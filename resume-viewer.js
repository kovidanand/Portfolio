(() => {
  const modal = document.getElementById('resumeModal');
  const openButton = document.getElementById('resumeOpen');
  const closeButton = document.getElementById('resumeClose');
  const backdrop = document.getElementById('resumeModalBackdrop');
  const documentWrap = document.getElementById('resumeDocumentWrap');
  const zoomIn = document.getElementById('resumeZoomIn');
  const zoomOut = document.getElementById('resumeZoomOut');
  const zoomReset = document.getElementById('resumeZoomReset');
  const fullscreen = document.getElementById('resumeFullscreen');

  if (!modal || !openButton || !closeButton || !documentWrap) return;

  let zoom = 1;
  let previousFocus;

  const applyZoom = () => {
    documentWrap.style.setProperty('--resume-zoom', zoom);
    documentWrap.setAttribute('aria-label', `Resume zoom ${Math.round(zoom * 100)} percent`);
  };

  const openViewer = () => {
    previousFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeButton.focus();
  };

  const closeViewer = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (previousFocus) previousFocus.focus();
  };

  openButton.addEventListener('click', openViewer);
  closeButton.addEventListener('click', closeViewer);
  backdrop.addEventListener('click', closeViewer);

  zoomIn.addEventListener('click', () => {
    zoom = Math.min(1.6, +(zoom + 0.1).toFixed(1));
    applyZoom();
  });
  zoomOut.addEventListener('click', () => {
    zoom = Math.max(0.7, +(zoom - 0.1).toFixed(1));
    applyZoom();
  });
  zoomReset.addEventListener('click', () => {
    zoom = 1;
    applyZoom();
  });

  fullscreen.addEventListener('click', async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await modal.requestFullscreen?.();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeViewer();
  });

  applyZoom();
})();
