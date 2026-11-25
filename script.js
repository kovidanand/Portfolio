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

  // 8. Copy Email to Clipboard
  const copyBtn = document.getElementById('copyEmailBtn');
  const copyText = document.getElementById('copyEmailText');
  if (copyBtn && copyText) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('kovidanand05@gmail.com').then(() => {
        const original = copyText.textContent;
        copyText.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        window.setTimeout(() => {
          copyText.textContent = original;
          copyBtn.classList.remove('copied');
        }, 2200);
      }).catch(() => {
        window.location.href = 'mailto:kovidanand05@gmail.com';
      });
    });
  }

  // 9. GYMTrack Interactive Featured Project Carousel
  const initGymtrackCarousel = () => {
    const carousel = document.getElementById('gymtrackCarousel');
    if (!carousel) return;

    const slides = carousel.querySelectorAll('.project-carousel-slide');
    const prevBtn = document.getElementById('gymtrackPrevBtn');
    const nextBtn = document.getElementById('gymtrackNextBtn');

    if (!slides.length) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoplayTimer = null;
    let isInteracted = false;

    const goToSlide = (targetIndex) => {
      slides[currentIndex].classList.remove('active');
      currentIndex = (targetIndex + totalSlides) % totalSlides;
      slides[currentIndex].classList.add('active');
    };

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    const stopAutoplay = () => {
      isInteracted = true;
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        stopAutoplay();
        prevSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        stopAutoplay();
        nextSlide();
      });
    }

    // Keyboard navigation when carousel is focused
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        stopAutoplay();
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        stopAutoplay();
        nextSlide();
      }
    });

    // Mobile touch swipe gestures
    let touchStartX = 0;
    let touchStartY = 0;
    carousel.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
          stopAutoplay();
          if (deltaX < 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        }
      }
    }, { passive: true });

    // Slow autoplay (5.5s), permanently stopping on any user interaction
    const startAutoplay = () => {
      if (isInteracted) return;
      autoplayTimer = setInterval(() => {
        if (!isInteracted) {
          nextSlide();
        }
      }, 5500);
    };

    carousel.addEventListener('mouseenter', stopAutoplay, { passive: true });
    carousel.addEventListener('pointerdown', stopAutoplay, { passive: true });

    startAutoplay();
  };

  initGymtrackCarousel();

  // 10. Direct Contact Email Form (Formspree Integration)
  const initContactForm = () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const subjectInput = document.getElementById('contactSubject');
    const messageInput = document.getElementById('contactMessage');
    const gotchaInput = document.getElementById('contactGotcha');
    const submitBtn = document.getElementById('contactSubmitBtn');
    const submitIcon = document.getElementById('contactSubmitIcon');
    const submitText = document.getElementById('contactSubmitText');
    const statusBox = document.getElementById('contactFormStatus');

    const errorEls = {
      name: document.getElementById('contactNameError'),
      email: document.getElementById('contactEmailError'),
      subject: document.getElementById('contactSubjectError'),
      message: document.getElementById('contactMessageError')
    };

    const EMAIL_REGEX = /^[^\s@<>()[\]\\.,;:\s@"]+(\.[^\s@<>()[\]\\.,;:\s@"]+)*@[^\s@<>()[\]\\.,;:\s@"]+\.[^\s@]{2,}$/;
    const FAILURE_MESSAGE = 'Unable to send your message right now. Please try again in a moment.';
    const UNAVAILABLE_MESSAGE = 'Our email service is temporarily unavailable.';
    const RATE_LIMIT_MESSAGE = 'Too many attempts. Please try again later.';
    const SUCCESS_MESSAGE = 'Your message has been sent successfully. Thank you for reaching out!';
    const RATE_LIMIT_STORAGE_KEY = 'portfolio_contact_submissions';
    const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
    const RATE_LIMIT_MAX_ATTEMPTS = 5;
    let isSubmitting = false;

    const setStatus = (type, text) => {
      if (!statusBox) return;
      if (!text) {
        statusBox.hidden = true;
        statusBox.textContent = '';
        statusBox.className = 'contact-form-status';
        return;
      }
      statusBox.hidden = false;
      statusBox.textContent = text;
      statusBox.className = `contact-form-status ${type === 'success' ? 'is-success' : 'is-error'}`;
    };

    const setFieldError = (fieldKey, inputEl, message) => {
      const errorEl = errorEls[fieldKey];
      if (errorEl) errorEl.textContent = message || '';
      if (inputEl) inputEl.classList.toggle('is-invalid', Boolean(message));
    };

    const clearAllFieldErrors = () => {
      setFieldError('name', nameInput, '');
      setFieldError('email', emailInput, '');
      setFieldError('subject', subjectInput, '');
      setFieldError('message', messageInput, '');
    };

    const checkClientRateLimit = () => {
      try {
        const now = Date.now();
        const raw = window.sessionStorage.getItem(RATE_LIMIT_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        const recent = Array.isArray(parsed) ? parsed.filter((t) => typeof t === 'number' && now - t < RATE_LIMIT_WINDOW_MS) : [];
        if (recent.length >= RATE_LIMIT_MAX_ATTEMPTS) {
          return false;
        }
        return true;
      } catch {
        return true;
      }
    };

    const recordSubmissionTimestamp = () => {
      try {
        const now = Date.now();
        const raw = window.sessionStorage.getItem(RATE_LIMIT_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        const recent = Array.isArray(parsed) ? parsed.filter((t) => typeof t === 'number' && now - t < RATE_LIMIT_WINDOW_MS) : [];
        recent.push(now);
        window.sessionStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(recent));
      } catch {
        // Ignore storage restrictions
      }
    };

    const validateForm = () => {
      clearAllFieldErrors();
      let isValid = true;
      let firstInvalid = null;
      let hasMissingRequired = false;
      let hasInvalidEmail = false;

      const nameVal = (nameInput?.value || '').trim();
      const emailVal = (emailInput?.value || '').trim();
      const subjectVal = (subjectInput?.value || '').trim();
      const messageVal = (messageInput?.value || '').trim();

      if (!nameVal) {
        setFieldError('name', nameInput, 'Please enter your full name.');
        isValid = false;
        hasMissingRequired = true;
        firstInvalid = firstInvalid || nameInput;
      } else if (nameVal.length < 2 || nameVal.length > 100) {
        setFieldError('name', nameInput, 'Name must be between 2 and 100 characters.');
        isValid = false;
        firstInvalid = firstInvalid || nameInput;
      }

      if (!emailVal) {
        setFieldError('email', emailInput, 'Please enter your email address.');
        isValid = false;
        hasMissingRequired = true;
        firstInvalid = firstInvalid || emailInput;
      } else if (emailVal.length > 160 || !EMAIL_REGEX.test(emailVal)) {
        setFieldError('email', emailInput, 'Please enter a valid email address.');
        isValid = false;
        hasInvalidEmail = true;
        firstInvalid = firstInvalid || emailInput;
      }

      if (!subjectVal) {
        setFieldError('subject', subjectInput, 'Please enter a subject.');
        isValid = false;
        hasMissingRequired = true;
        firstInvalid = firstInvalid || subjectInput;
      } else if (subjectVal.length < 2 || subjectVal.length > 160) {
        setFieldError('subject', subjectInput, 'Subject must be between 2 and 160 characters.');
        isValid = false;
        firstInvalid = firstInvalid || subjectInput;
      }

      if (!messageVal) {
        setFieldError('message', messageInput, 'Please write your message.');
        isValid = false;
        hasMissingRequired = true;
        firstInvalid = firstInvalid || messageInput;
      } else if (messageVal.length < 10) {
        setFieldError('message', messageInput, 'Message must be at least 10 characters.');
        isValid = false;
        firstInvalid = firstInvalid || messageInput;
      } else if (messageVal.length > 3000) {
        setFieldError('message', messageInput, 'Message cannot exceed 3000 characters.');
        isValid = false;
        firstInvalid = firstInvalid || messageInput;
      }

      let summaryError = '';
      if (!isValid) {
        if (hasMissingRequired) {
          summaryError = 'Please complete all required fields.';
        } else if (hasInvalidEmail) {
          summaryError = 'Please enter a valid email address.';
        } else {
          summaryError = 'Please check the highlighted fields and try again.';
        }
      }

      if (firstInvalid) firstInvalid.focus();
      return {
        isValid,
        summaryError,
        values: {
          name: nameVal,
          email: emailVal,
          subject: subjectVal,
          message: messageVal,
          gotcha: gotchaInput ? gotchaInput.value : ''
        }
      };
    };

    const setLoadingState = (loading) => {
      isSubmitting = loading;
      if (submitBtn) submitBtn.disabled = loading;
      if (submitText) submitText.textContent = loading ? 'Sending...' : 'Send Message';
      if (submitIcon) {
        submitIcon.className = loading ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-paper-plane';
      }
    };

    [
      ['name', nameInput],
      ['email', emailInput],
      ['subject', subjectInput],
      ['message', messageInput]
    ].forEach(([key, el]) => {
      if (!el) return;
      el.addEventListener('input', () => {
        if (el.classList.contains('is-invalid')) {
          setFieldError(key, el, '');
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      setStatus(null, '');
      const { isValid, summaryError, values } = validateForm();
      if (!isValid) {
        setStatus('error', summaryError);
        return;
      }

      // Honeypot check: silently ignore automated bot submissions
      if (values.gotcha && values.gotcha.trim().length > 0) {
        form.reset();
        setStatus('success', SUCCESS_MESSAGE);
        return;
      }

      if (!checkClientRateLimit()) {
        setStatus('error', RATE_LIMIT_MESSAGE);
        return;
      }

      const rawAction = (form.getAttribute('action') || '').trim();
      const endpoint = (window.PORTFOLIO_CONTACT_ENDPOINT || rawAction || form.getAttribute('data-endpoint') || '').trim();
      if (!endpoint || endpoint.includes('YOUR_FORMSPREE_ID')) {
        console.error('Contact form endpoint is not configured yet.');
        setStatus('error', UNAVAILABLE_MESSAGE);
        return;
      }

      setLoadingState(true);

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 15000);

      try {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('email', values.email);
        formData.append('_replyto', values.email);
        formData.append('subject', values.subject);
        formData.append('_subject', `[Portfolio Contact] ${values.subject}`);
        formData.append('message', values.message);
        formData.append('_gotcha', values.gotcha || '');

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          },
          body: formData,
          signal: controller.signal
        });

        let data = {};
        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          if (response.status === 429) {
            setStatus('error', RATE_LIMIT_MESSAGE);
          } else if (response.status === 503) {
            setStatus('error', UNAVAILABLE_MESSAGE);
          } else if (response.status === 400 || response.status === 422) {
            if (Array.isArray(data.errors) && data.errors.length > 0) {
              data.errors.forEach((errItem) => {
                if (errItem.field === 'email') setFieldError('email', emailInput, 'Please enter a valid email address.');
                if (errItem.field === 'name') setFieldError('name', nameInput, 'Please enter your full name.');
                if (errItem.field === 'subject') setFieldError('subject', subjectInput, 'Please enter a subject.');
                if (errItem.field === 'message') setFieldError('message', messageInput, 'Please write your message.');
              });
              setStatus('error', 'Please check the highlighted fields and try again.');
            } else {
              setStatus('error', FAILURE_MESSAGE);
            }
          } else {
            console.error('Contact form submission rejected with status:', response.status);
            setStatus('error', FAILURE_MESSAGE);
          }
          return;
        }

        recordSubmissionTimestamp();
        form.reset();
        clearAllFieldErrors();
        setStatus('success', SUCCESS_MESSAGE);
      } catch (err) {
        console.error('Contact form network error:', err && err.name ? err.name : 'Request failed');
        setStatus('error', UNAVAILABLE_MESSAGE);
      } finally {
        window.clearTimeout(timeoutId);
        setLoadingState(false);
      }
    });
  };

  initContactForm();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}