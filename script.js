/**
 * KOVID ANAND · PORTFOLIO V2
 * script.js - Core UI interactions, counters, reading progress, and modal controls.
 */

const initPortfolio = () => {
  'use strict';

  // 1. Fast, Smooth Page Loader
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loaderBar');

  if (loaderBar) loaderBar.style.width = '100%';

  if (loader) {
    window.setTimeout(() => {
      loader.style.transition = 'opacity 0.28s ease-out';
      loader.style.opacity = '0';
      window.setTimeout(() => {
        loader.style.display = 'none';
      }, 280);
    }, 120);
  }

  // 2. Navbar Scroll Behavior & Active Section Spy
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const handleScroll = () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 25);
    }

    let currentSectionId = '';
    const scrollPos = window.scrollY + 180;

    sections.forEach((sec) => {
      if (scrollPos >= sec.offsetTop) {
        currentSectionId = sec.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('data-s') === currentSectionId);
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 3. Mobile Navigation
  const hamburger = document.getElementById('hamburger');
  const navLinksMenu = document.getElementById('navLinks');

  if (hamburger && navLinksMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinksMenu.classList.toggle('open');
    });

    navLinksMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinksMenu.classList.remove('open');
      });
    });
  }

  // 4. Counter Animation for Metrics
  const counters = document.querySelectorAll('.cnt');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target'));
        const isFloat = String(target).includes('.');
        const duration = 1400;
        const startTime = performance.now();

        const updateCount = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const currentVal = target * easeProgress;

          el.textContent = isFloat ? currentVal.toFixed(2) : Math.floor(currentVal);

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            el.textContent = isFloat ? target.toFixed(2) : target;
          }
        };

        requestAnimationFrame(updateCount);
        obs.unobserve(el);
      });
    }, { threshold: 0.3 });

    counters.forEach((c) => counterObserver.observe(c));
  }

  // 5. Certificate Preview Modal
  const certModal = document.getElementById('certModal');
  const certBackdrop = document.getElementById('certModalBackdrop');
  const certCloseBtn = document.getElementById('certModalClose');
  const certModalContent = document.querySelector('.cert-modal-content');
  const certModalLoading = document.getElementById('certModalLoading');
  const certFrame = document.getElementById('certPreviewFrame');
  const certCards = document.querySelectorAll('.cert-card[data-cert-key]');

  const defaultPreviewUrl = 'https://drive.google.com/file/d/18LAPknODLqJ-3NgODIN2An59Fa8U-0fa/preview?rm=minimal';
  const certPreviewMap = {
    'google-analytics': 'https://drive.google.com/file/d/18LAPknODLqJ-3NgODlN2An59Fa8U-0fa/preview?rm=minimal',
    'sql-advanced': 'https://drive.google.com/file/d/1k7ryRKbgG4KZAhuJwFd1JdoWQtLd3Bkb/preview?rm=minimal',
    'databricks-sql': 'https://drive.google.com/file/d/1AiBkA4RuIGqCCRKaMv1XT67-D80RKSFy/preview?rm=minimal',
    'product-roadmap': 'https://drive.google.com/file/d/1WnCkST6-VyM5YykbRnRYpCyGLxrU6FJV/preview?rm=minimal',
    'business-analysis': 'https://drive.google.com/file/d/11vAR-jhJLt5ivoDUEH_OT1LtntFbvNH9/preview?rm=minimal',
    'tata-analytics': 'https://drive.google.com/file/d/1QVNGMFfLZXD8Irdc_HJBZq2TNwkhkf11/preview?rm=minimal',
    'excel-dashboarding': 'https://drive.google.com/file/d/1zkmLU4MB4q8eajVLNUaPkOLfQgWSnrCZ/preview?rm=minimal',
    'ml-foundations': 'https://drive.google.com/file/d/1UFVPXLkI9Imz6ch0B7QjwRw8w3wNEjun/preview?rm=minimal',
  };

  const normalizeDriveUrl = (url) => {
    if (!url) return defaultPreviewUrl;
    const m = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/i);
    if (m && m[1]) return `https://drive.google.com/file/d/${m[1]}/preview?rm=minimal`;
    return url;
  };

  const openCertModal = (url) => {
    if (!certModal || !certFrame) return;
    if (certModalContent) certModalContent.classList.add('loading');
    if (certModalLoading) certModalLoading.setAttribute('aria-hidden', 'false');
    certFrame.src = normalizeDriveUrl(url);
    certModal.classList.add('open');
    certModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeCertModal = () => {
    if (!certModal || !certFrame) return;
    certModal.classList.remove('open');
    certModal.setAttribute('aria-hidden', 'true');
    certFrame.src = '';
    if (certModalContent) certModalContent.classList.remove('loading');
    if (certModalLoading) certModalLoading.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  certCards.forEach((card) => {
    card.addEventListener('click', () => {
      const key = card.getAttribute('data-cert-key');
      openCertModal(certPreviewMap[key] || defaultPreviewUrl);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  if (certFrame) {
    certFrame.addEventListener('load', () => {
      if (certModalContent) certModalContent.classList.remove('loading');
      if (certModalLoading) certModalLoading.setAttribute('aria-hidden', 'true');
    });
  }

  if (certCloseBtn) certCloseBtn.addEventListener('click', closeCertModal);
  if (certBackdrop) certBackdrop.addEventListener('click', closeCertModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && certModal && certModal.classList.contains('open')) {
      closeCertModal();
    }
  });

  // 6. Seamless Technology Strip Duplication
  const marqueeTrack = document.getElementById('marqueeTrack');
  if (marqueeTrack && marqueeTrack.dataset.cloned !== 'true') {
    marqueeTrack.innerHTML += marqueeTrack.innerHTML;
    marqueeTrack.dataset.cloned = 'true';
  }

  // 7. Minimal Reading Progress Indicator
  const progressBar = document.createElement('div');
  Object.assign(progressBar.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    height: '2px',
    width: '0%',
    background: '#2563EB',
    zIndex: '9999',
    transition: 'width 0.1s linear',
    pointerEvents: 'none'
  });
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollTotal > 0) {
      progressBar.style.width = (window.scrollY / scrollTotal * 100) + '%';
    }
  }, { passive: true });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}