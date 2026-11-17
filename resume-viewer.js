/**
 * KOVID ANAND · PORTFOLIO
 * resume-viewer.js - High-Fidelity In-Page PDF Document Viewer (PDF.js)
 * 
 * True document-level zoom and pan:
 * - Re-renders PDF page at high DPI without scaling the modal or toolbar.
 * - Zoom in / Zoom out with visible percentage indicator.
 * - Fit to Width and Actual Size (100%) controls.
 * - Preserves scroll focal point while zooming.
 * - Native vertical & horizontal scrolling with centering.
 * - Fullscreen, download, and keyboard shortcuts (Esc, Ctrl + / - / wheel).
 */

(() => {
  'use strict';

  const modal = document.getElementById('resumeModal');
  const openButtons = document.querySelectorAll('#resumeOpen, #resumeHeroOpen, [data-action="open-resume"], .js-open-resume');
  const closeButton = document.getElementById('resumeClose');
  const backdrop = document.getElementById('resumeModalBackdrop');
  const documentWrap = document.getElementById('resumeDocumentWrap');
  const canvasContainer = document.getElementById('resumeCanvasContainer');
  const loadingIndicator = document.getElementById('resumeLoading');

  const zoomInBtn = document.getElementById('resumeZoomIn');
  const zoomOutBtn = document.getElementById('resumeZoomOut');
  const zoomVal = document.getElementById('resumeZoomVal');
  const fitWidthBtn = document.getElementById('resumeFitWidth');
  const actualSizeBtn = document.getElementById('resumeActualSize');
  const fullscreenBtn = document.getElementById('resumeFullscreen');

  if (!modal || !documentWrap || !canvasContainer) return;

  const PDF_URL = 'assets/Kovid_Anand_Resume.pdf';

  let pdfDoc = null;
  let currentScale = 1.0;
  const MIN_SCALE = 0.5;   // 50%
  const MAX_SCALE = 2.5;   // 250%
  const SCALE_STEP = 0.15; // 15% per click

  let isRendering = false;
  let renderQueuePending = false;
  let activeRenderTasks = [];
  let previousFocus = null;

  // Configure PDF.js worker
  const initWorker = () => {
    if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/js/pdf.worker.min.js';
    }
  };
  initWorker();

  // Update UI zoom controls state
  const updateZoomUI = () => {
    if (zoomVal) {
      zoomVal.textContent = `${Math.round(currentScale * 100)}%`;
    }
    if (zoomOutBtn) {
      zoomOutBtn.disabled = currentScale <= MIN_SCALE;
      zoomOutBtn.setAttribute('aria-disabled', String(currentScale <= MIN_SCALE));
    }
    if (zoomInBtn) {
      zoomInBtn.disabled = currentScale >= MAX_SCALE;
      zoomInBtn.setAttribute('aria-disabled', String(currentScale >= MAX_SCALE));
    }
  };

  // Link service for PDF.js annotation layer
  const createLinkService = () => ({
    getDestinationHash: (dest) => '#',
    getAnchorUrl: (hash) => hash || '#',
    goToDestination: (dest) => {},
    addLinkAttributes: (link, url, newWindow) => {
      link.href = url;
      if (url.startsWith('mailto:')) {
        link.target = '_self';
      } else {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      link.title = url;
    }
  });

  // Render annotations using PDF.js AnnotationLayer with robust fallback
  const renderAnnotations = async (page, viewport, layerDiv, annotations) => {
    if (!annotations || !annotations.length) return;

    let renderedViaPdfjs = false;

    if (window.pdfjsLib && window.pdfjsLib.AnnotationLayer) {
      try {
        const annotationLayer = new window.pdfjsLib.AnnotationLayer({
          div: layerDiv,
          accessibilityManager: null,
          annotationCanvasMap: null,
          page: page,
          viewport: viewport.clone({ dontFlip: true })
        });

        await annotationLayer.render({
          annotations: annotations,
          linkService: createLinkService(),
          downloadManager: null,
          imageResourcesPath: '',
          renderForms: false
        });

        renderedViaPdfjs = true;
      } catch (err) {
        console.warn('PDF.js AnnotationLayer.render threw, falling back:', err);
      }
    }

    if (!renderedViaPdfjs || !layerDiv.hasChildNodes()) {
      layerDiv.innerHTML = '';
      annotations.forEach((annot) => {
        if (!annot.rect || !annot.url) return;
        const rawRect = viewport.convertToViewportRectangle(annot.rect);
        const rect = window.pdfjsLib?.Util?.normalizeRect
          ? window.pdfjsLib.Util.normalizeRect(rawRect)
          : [
              Math.min(rawRect[0], rawRect[2]),
              Math.min(rawRect[1], rawRect[3]),
              Math.max(rawRect[0], rawRect[2]),
              Math.max(rawRect[1], rawRect[3])
            ];

        const left = rect[0];
        const top = rect[1];
        const width = rect[2] - rect[0];
        const height = rect[3] - rect[1];

        if (width <= 0 || height <= 0) return;

        const section = document.createElement('section');
        section.className = 'linkAnnotation';
        section.style.position = 'absolute';
        section.style.left = `${left.toFixed(2)}px`;
        section.style.top = `${top.toFixed(2)}px`;
        section.style.width = `${width.toFixed(2)}px`;
        section.style.height = `${height.toFixed(2)}px`;

        const a = document.createElement('a');
        a.href = annot.url;
        if (annot.url.startsWith('mailto:')) {
          a.target = '_self';
        } else {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
        a.title = annot.url;
        a.setAttribute('aria-label', annot.url);

        section.appendChild(a);
        layerDiv.appendChild(section);
      });
    }

    // Ensure all links have correct security attributes & open in new tab (or mailto)
    layerDiv.querySelectorAll('a').forEach((a) => {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('mailto:')) {
        a.target = '_self';
      } else if (href.startsWith('http://') || href.startsWith('https://')) {
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
    });
  };

  // Render all pages in the PDF document at current scale
  const renderDocument = async () => {
    if (!pdfDoc) return;

    if (isRendering) {
      renderQueuePending = true;
      activeRenderTasks.forEach((task) => {
        try {
          task.cancel();
        } catch (e) {
          /* ignore cancel exception */
        }
      });
      activeRenderTasks = [];
      return;
    }

    isRendering = true;
    updateZoomUI();

    // Preserve scroll position focal center
    const prevScrollWidth = documentWrap.scrollWidth || 1;
    const prevScrollHeight = documentWrap.scrollHeight || 1;
    const centerXRatio = (documentWrap.scrollLeft + documentWrap.clientWidth / 2) / prevScrollWidth;
    const centerYRatio = (documentWrap.scrollTop + documentWrap.clientHeight / 2) / prevScrollHeight;

    const pixelRatio = Math.max(window.devicePixelRatio || 1, 1);

    try {
      // Clear previous pages
      canvasContainer.innerHTML = '';

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);

        // Viewport at standard scale for layout and annotations (CSS pixels)
        const displayViewport = page.getViewport({ scale: currentScale });
        // Viewport at target scale * devicePixelRatio for crisp canvas bitmap rendering
        const canvasViewport = page.getViewport({ scale: currentScale * pixelRatio });

        const pageDiv = document.createElement('div');
        pageDiv.className = 'resume-page';
        pageDiv.setAttribute('data-page-number', String(pageNum));
        pageDiv.style.position = 'relative';
        pageDiv.style.width = `${Math.floor(displayViewport.width)}px`;
        pageDiv.style.height = `${Math.floor(displayViewport.height)}px`;

        const canvas = document.createElement('canvas');
        canvas.className = 'resume-page-canvas';
        canvas.width = Math.floor(canvasViewport.width);
        canvas.height = Math.floor(canvasViewport.height);
        canvas.style.width = `${Math.floor(displayViewport.width)}px`;
        canvas.style.height = `${Math.floor(displayViewport.height)}px`;

        pageDiv.appendChild(canvas);

        const annotationLayerDiv = document.createElement('div');
        annotationLayerDiv.className = 'annotationLayer';
        annotationLayerDiv.style.position = 'absolute';
        annotationLayerDiv.style.top = '0';
        annotationLayerDiv.style.left = '0';
        annotationLayerDiv.style.width = `${Math.floor(displayViewport.width)}px`;
        annotationLayerDiv.style.height = `${Math.floor(displayViewport.height)}px`;
        annotationLayerDiv.style.setProperty('--scale-factor', String(currentScale));
        pageDiv.appendChild(annotationLayerDiv);

        canvasContainer.appendChild(pageDiv);

        const ctx = canvas.getContext('2d', { alpha: false });
        const renderContext = {
          canvasContext: ctx,
          viewport: canvasViewport
        };

        const renderTask = page.render(renderContext);
        activeRenderTasks.push(renderTask);

        await renderTask.promise;

        // Render PDF interactive link annotations
        try {
          const annotations = await page.getAnnotations({ intent: 'display' });
          await renderAnnotations(page, displayViewport, annotationLayerDiv, annotations);
        } catch (annotErr) {
          console.warn('Error fetching or rendering annotations:', annotErr);
        }
      }

      if (loadingIndicator) {
        loadingIndicator.classList.add('is-hidden');
      }

      // Restore scroll around focal center
      requestAnimationFrame(() => {
        const newScrollWidth = documentWrap.scrollWidth;
        const newScrollHeight = documentWrap.scrollHeight;
        documentWrap.scrollLeft = Math.max(0, centerXRatio * newScrollWidth - documentWrap.clientWidth / 2);
        documentWrap.scrollTop = Math.max(0, centerYRatio * newScrollHeight - documentWrap.clientHeight / 2);
      });
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('Error rendering PDF page:', err);
      }
    } finally {
      isRendering = false;
      if (renderQueuePending) {
        renderQueuePending = false;
        renderDocument();
      }
    }
  };

  // Calculate and apply Fit to Width scale
  const applyFitToWidth = async () => {
    if (!pdfDoc) return;
    try {
      const page = await pdfDoc.getPage(1);
      const unscaledViewport = page.getViewport({ scale: 1 });
      const availableWidth = Math.max(300, documentWrap.clientWidth - 48);
      const fitScale = availableWidth / unscaledViewport.width;
      currentScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, +fitScale.toFixed(2)));
      renderDocument();
    } catch (e) {
      console.warn('Could not calculate fit-to-width:', e);
    }
  };

  // Load PDF document using PDF.js
  const loadPdf = async () => {
    if (pdfDoc) return;
    if (loadingIndicator) loadingIndicator.classList.remove('is-hidden');

    try {
      if (!window.pdfjsLib) {
        throw new Error('PDF.js library not loaded');
      }
      initWorker();
      const loadingTask = window.pdfjsLib.getDocument(PDF_URL);
      pdfDoc = await loadingTask.promise;

      // Auto-fit on initial load: on mobile fit width, on desktop comfortable viewing width
      const page = await pdfDoc.getPage(1);
      const unscaledViewport = page.getViewport({ scale: 1 });
      const availableWidth = Math.max(300, documentWrap.clientWidth - 48);
      const fitScale = availableWidth / unscaledViewport.width;

      if (window.innerWidth < 768) {
        currentScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, +fitScale.toFixed(2)));
      } else {
        // Comfortable default zoom between 100% and 125%
        currentScale = Math.min(1.25, Math.max(1.0, +fitScale.toFixed(2)));
      }

      await renderDocument();
    } catch (err) {
      console.error('Failed to load PDF document with PDF.js:', err);
      if (loadingIndicator) {
        loadingIndicator.innerHTML = `
          <div class="resume-error">
            <p>Could not load the document preview.</p>
            <a href="${PDF_URL}" download="Kovid_Anand_Resume.pdf" class="btn btn-primary btn-sm">
              <i class="fa-solid fa-download"></i> Download Resume PDF
            </a>
          </div>
        `;
      }
    }
  };

  // Open viewer modal
  const openViewer = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    previousFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    loadPdf();

    if (closeButton) closeButton.focus();
  };

  // Close viewer modal
  const closeViewer = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (previousFocus) previousFocus.focus();
  };

  // Zoom In
  const zoomIn = () => {
    if (currentScale >= MAX_SCALE) return;
    currentScale = Math.min(MAX_SCALE, +(currentScale + SCALE_STEP).toFixed(2));
    renderDocument();
  };

  // Zoom Out
  const zoomOut = () => {
    if (currentScale <= MIN_SCALE) return;
    currentScale = Math.max(MIN_SCALE, +(currentScale - SCALE_STEP).toFixed(2));
    renderDocument();
  };

  // Actual Size (100%)
  const actualSize = () => {
    currentScale = 1.0;
    renderDocument();
  };

  // Event Listeners
  openButtons.forEach((btn) => btn.addEventListener('click', openViewer));
  if (closeButton) closeButton.addEventListener('click', closeViewer);
  if (backdrop) backdrop.addEventListener('click', closeViewer);

  if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);
  if (fitWidthBtn) fitWidthBtn.addEventListener('click', applyFitToWidth);
  if (actualSizeBtn) actualSizeBtn.addEventListener('click', actualSize);

  // Fullscreen toggle
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', async () => {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.();
      } else {
        await modal.requestFullscreen?.();
      }
    });
  }

  // Ctrl + Mouse Wheel Zoom inside document area
  documentWrap.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else if (e.deltaY > 0) {
        zoomOut();
      }
    }
  }, { passive: false });

  // Keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('is-open')) return;

    if (event.key === 'Escape') {
      closeViewer();
    } else if ((event.ctrlKey || event.metaKey) && (event.key === '=' || event.key === '+')) {
      event.preventDefault();
      zoomIn();
    } else if ((event.ctrlKey || event.metaKey) && event.key === '-') {
      event.preventDefault();
      zoomOut();
    } else if ((event.ctrlKey || event.metaKey) && event.key === '0') {
      event.preventDefault();
      actualSize();
    }
  });

  // Handle window resize dynamically without forcing re-renders unless fit-to-width was active
  window.addEventListener('resize', () => {
    if (modal.classList.contains('is-open') && window.innerWidth < 640) {
      applyFitToWidth();
    }
  });

  updateZoomUI();
})();
