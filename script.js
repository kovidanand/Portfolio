/* ════════════════════════════════════════════════════════
   ANAND · PORTFOLIO  ·  script.js
   Light Mode Upgrade · Performance & Timeline fixed
════════════════════════════════════════════════════════ */

window.addEventListener('load', () => {

  gsap.registerPlugin(ScrollTrigger, TextPlugin);

  /* ════════════════════════════════════════════════
     1.  PAGE LOADER (Fast Cinematic)
  ════════════════════════════════════════════════ */
  const loader  = document.getElementById('loader');
  const lBar    = document.getElementById('loaderBar');
  const letters = document.querySelectorAll('.ll');

  // Fast stagger in
  requestAnimationFrame(() => letters.forEach(l => l.classList.add('in')));

  let pct = 0;
  const fillTimer = setInterval(() => {
    pct += Math.random() * 30; // Faster increment
    if(pct >= 100){ 
      pct = 100; 
      clearInterval(fillTimer); 
    }
    if(lBar) lBar.style.width = pct + '%';
  }, 40);

  // Quick slide up
  gsap.to(loader, {
    yPercent: -100, 
    duration: 0.8, 
    ease: 'power3.inOut', 
    delay: 0.8, // Reduced delay
    onComplete: () => { 
      loader.style.display = 'none'; 
      revealHero(); 
    }
  });


  /* ════════════════════════════════════════════════
     2.  MESH GRADIENT CANVAS (Light Pastel)
  ════════════════════════════════════════════════ */
  const canvas = document.getElementById('meshCanvas');
  if(canvas){
    const ctx = canvas.getContext('2d');
    let W, H;
    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    // Subtle pastel gradients for light mode
    const nodes = [
      { x:.2, y:.3, r:.6, col:'rgba(0,102,255,',   a:.08 },
      { x:.8, y:.2, r:.5, col:'rgba(138,43,226,',  a:.06 },
      { x:.5, y:.8, r:.7, col:'rgba(224,28,213,',  a:.04 },
      { x:.1, y:.8, r:.5, col:'rgba(0,182,122,',   a:.05 },
      { x:.9, y:.7, r:.6, col:'rgba(255,98,0,',    a:.04 },
    ];
    
    const speeds = nodes.map(() => ({
      vx: (Math.random()-.5)*.001,
      vy: (Math.random()-.5)*.001,
      va: (Math.random()-.5)*.002,
    }));

    let mouseNX = .5, mouseNY = .5;
    window.addEventListener('mousemove', e => {
      mouseNX = e.clientX / window.innerWidth;
      mouseNY = e.clientY / window.innerHeight;
    });

    function drawMesh(){
      ctx.clearRect(0, 0, W, H);
      nodes.forEach((n, i) => {
        const mx = (mouseNX - .5) * .08;
        const my = (mouseNY - .5) * .06;
        const px = (n.x + mx) * W;
        const py = (n.y + my) * H;
        const rad = n.r * Math.max(W, H);
        const a = Math.max(.02, Math.min(.12, n.a));

        const g = ctx.createRadialGradient(px, py, 0, px, py, rad);
        g.addColorStop(0, n.col + a + ')');
        g.addColorStop(1, n.col + '0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        n.x += speeds[i].vx;
        n.y += speeds[i].vy;
        n.a += speeds[i].va;
        if(n.x < 0 || n.x > 1) speeds[i].vx *= -1;
        if(n.y < 0 || n.y > 1) speeds[i].vy *= -1;
        if(n.a < .02 || n.a > .12) speeds[i].va *= -1;
      });
      requestAnimationFrame(drawMesh);
    }
    drawMesh();
  }


  /* ════════════════════════════════════════════════
     3.  CURSOR & SPOTLIGHT
  ════════════════════════════════════════════════ */
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  const cLabel = document.getElementById('cursorLabel');
  let mx = 0, my = 0, rx = 0, ry = 0;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if(dot){ dot.style.left = mx+'px'; dot.style.top = my+'px'; }
    const sp = document.getElementById('spotlight');
    if(sp) sp.style.setProperty('--mx', mx+'px'), sp.style.setProperty('--my', my+'px');
  });

  const animRing = () => {
    rx += (mx-rx)*.15; ry += (my-ry)*.15;
    if(ring){ ring.style.left=rx+'px'; ring.style.top=ry+'px'; }
    requestAnimationFrame(animRing);
  };
  animRing();

  document.querySelectorAll('a, button, .tm-content, .bcard, .cert-card, [data-magnetic]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cur-hover');
      if(cLabel && el.dataset.cursor) cLabel.textContent = el.dataset.cursor;
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cur-hover');
      if(cLabel) cLabel.textContent = '';
    });
  });


  /* ════════════════════════════════════════════════
     4.  MAGNETIC BUTTONS
  ════════════════════════════════════════════════ */
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r  = el.getBoundingClientRect();
      const xc = r.left + r.width  / 2;
      const yc = r.top  + r.height / 2;
      const dx = (e.clientX - xc) * .3;
      const dy = (e.clientY - yc) * .3;
      gsap.to(el, { x:dx, y:dy, duration:.4, ease:'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x:0, y:0, duration:.6, ease:'elastic.out(1,.5)' });
    });
  });


  /* ════════════════════════════════════════════════
     5.  NAVBAR
  ════════════════════════════════════════════════ */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    let cur = '';
    sections.forEach(s => { if(window.scrollY >= s.offsetTop - 200) cur = s.id; });
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.s === cur));
  };
  window.addEventListener('scroll', onScroll, { passive:true });

  const ham  = document.getElementById('hamburger');
  const menu = document.getElementById('navLinks');
  ham.addEventListener('click', () => {
    ham.classList.toggle('open');
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    ham.classList.remove('open'); menu.classList.remove('open');
  }));


  /* ════════════════════════════════════════════════
     6.  HERO ENTRANCE
  ════════════════════════════════════════════════ */
  function revealHero(){
    const tl = gsap.timeline({ defaults:{ ease:'power3.out' } });

    tl.to('#heroChip',    { opacity:1, y:0, duration:.5 })
      .to('#heroH1',      { opacity:1, duration:.01 },       '-=.2')
      .to('.h1w',         { y:'0%', duration:.8, stagger:.06, ease:'expo.out' }, '-=.1')
      .to('.hero-sub',    { opacity:1, duration:.5 },        '-=.3')
      .to('#heroTagline', { opacity:1, y:0, duration:.5 },   '-=.2')
      .to('#heroBtns',    { opacity:1, y:0, duration:.5 },   '-=.2')
      .call(startTyping, null, '-=.1');
  }


  /* ════════════════════════════════════════════════
     7.  TYPING ANIMATION
  ════════════════════════════════════════════════ */
  const typedEl = document.getElementById('typedEl');
  const roles   = ['AI Product Manager','Data Analyst','ML Engineer','Builder'];
  let ri = 0, ci = 0, del = false;

  function startTyping(){ typeNext(); }
  function typeNext(){
    const word = roles[ri];
    if(!del){
      typedEl.textContent = word.slice(0, ++ci);
      if(ci === word.length){ del = true; setTimeout(typeNext, 2000); return; }
    } else {
      typedEl.textContent = word.slice(0, --ci);
      if(ci === 0){ del = false; ri = (ri+1)%roles.length; setTimeout(typeNext, 400); return; }
    }
    setTimeout(typeNext, del ? 30 : 60);
  }


  /* ════════════════════════════════════════════════
     8.  WORD-BY-WORD REVEAL 
  ════════════════════════════════════════════════ */
  document.querySelectorAll('.reveal-words').forEach(el => {
    const html = el.innerHTML;
    el.innerHTML = html.replace(/(<em>[^<]*<\/em>|[^\s<]+)/g, match =>
      `<span class="rw-word"><span class="rw-inner">${match}</span></span> `
    );

    const inners = el.querySelectorAll('.rw-inner');
    gsap.fromTo(inners,
      { y:'105%' },
      { y:'0%', duration:0.6, stagger:.03, ease:'expo.out',
        scrollTrigger:{ trigger:el, start:'top 90%', toggleActions:'play none none none' }
      }
    );
  });


  /* ════════════════════════════════════════════════
     9.  GENERIC REVEAL-UP
  ════════════════════════════════════════════════ */
  document.querySelectorAll('.reveal-up').forEach(el => {
    const d = parseFloat(el.dataset.delay || 0);
    gsap.fromTo(el,
      { opacity:0, y:30 },
      { opacity:1, y:0, duration:.6, delay:d, ease:'power3.out',
        scrollTrigger:{ trigger:el, start:'top 90%', toggleActions:'play none none none' }
      }
    );
  });

  /* ════════════════════════════════════════════════
     10.5 CERTIFICATE STAGGER REVEAL (INTERSECTION OBSERVER)
  ════════════════════════════════════════════════ */
  const certRevealCards = document.querySelectorAll('.cert-card.cert-reveal');
  if(certRevealCards.length){
    const supportsIO = 'IntersectionObserver' in window;

    if(supportsIO){
      const certObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if(!entry.isIntersecting) return;
          const card = entry.target;
          const index = [...certRevealCards].indexOf(card);
          setTimeout(() => card.classList.add('in'), Math.max(0, index) * 85);
          obs.unobserve(card);
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });

      certRevealCards.forEach((card) => certObserver.observe(card));
    } else {
      certRevealCards.forEach((card) => card.classList.add('in'));
    }
  }


  /* ════════════════════════════════════════════════
     10. SKILL METER FILL (FIXED)
     Natively powered by GSAP to avoid CSS transition conflicts
  ════════════════════════════════════════════════ */
  document.querySelectorAll('.bc-meter').forEach(m => {
    const fill = m.querySelector('.bc-fill');
    const pct  = m.getAttribute('data-pct');

    // Reset initially
    gsap.set(fill, { width: '0%' });

    ScrollTrigger.create({
      trigger: m,
      start: 'top 95%',
      onEnter: () => {
        gsap.to(fill, {
          width: pct + '%',
          duration: 1.2,
          ease: 'power3.out'
        });
      }
    });
  });


  /* ════════════════════════════════════════════════
     11. COUNTER ANIMATION
  ════════════════════════════════════════════════ */
  document.querySelectorAll('.cnt').forEach(el => {
    const target  = parseFloat(el.dataset.target);
    const isFloat = String(target).includes('.');
    ScrollTrigger.create({
      trigger: el, start:'top 90%',
      onEnter: () => {
        gsap.fromTo(el,
          { innerText: 0 },
          { innerText: target, duration:1.8, ease:'power2.out',
            snap:{ innerText: isFloat ? .1 : 1 },
            onUpdate(){ el.innerText = isFloat ? parseFloat(el.innerText).toFixed(1) : Math.round(el.innerText); }
          }
        );
      }
    });
  });

  /* ════════════════════════════════════════════════
     12. CERTIFICATE PREVIEW MODAL
  ════════════════════════════════════════════════ */
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

  const normalizeDrivePreviewUrl = (url) => {
    if(!url) return defaultPreviewUrl;
    const m = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/i);
    if(m && m[1]) return `https://drive.google.com/file/d/${m[1]}/preview?rm=minimal`;
    if(/\/view(\?.*)?$/i.test(url)) return url.replace(/\/view(\?.*)?$/i, '/preview?rm=minimal');
    if(/\/preview(\?.*)?$/i.test(url)){
      return url.includes('rm=minimal')
        ? url
        : `${url}${url.includes('?') ? '&' : '?'}rm=minimal`;
    }
    return `${url.replace(/\/+$/, '')}/preview?rm=minimal`;
  };

  const openCertModal = (url) => {
    if(!certModal || !certFrame) return;
    if(certModalContent) certModalContent.classList.add('loading');
    if(certModalLoading) certModalLoading.setAttribute('aria-hidden', 'false');
    certFrame.src = normalizeDrivePreviewUrl(url);
    certModal.classList.add('open');
    certModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeCertModal = () => {
    if(!certModal || !certFrame) return;
    certModal.classList.remove('open');
    certModal.setAttribute('aria-hidden', 'true');
    certFrame.src = '';
    if(certModalContent) certModalContent.classList.remove('loading');
    if(certModalLoading) certModalLoading.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  certCards.forEach((card) => {
    card.addEventListener('click', () => {
      const key = card.getAttribute('data-cert-key');
      openCertModal(certPreviewMap[key] || defaultPreviewUrl);
    });
  });
  if(certFrame){
    certFrame.addEventListener('load', () => {
      if(certModalContent) certModalContent.classList.remove('loading');
      if(certModalLoading) certModalLoading.setAttribute('aria-hidden', 'true');
    });
  }

  if(certCloseBtn) certCloseBtn.addEventListener('click', closeCertModal);
  if(certBackdrop) certBackdrop.addEventListener('click', closeCertModal);
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && certModal && certModal.classList.contains('open')) {
      closeCertModal();
    }
  });

  /* ════════════════════════════════════════════════
     13. READING PROGRESS BAR
  ════════════════════════════════════════════════ */
    /* ════════════════════════════════════════════════
      MARQUEE: ensure seamless infinite loop by duplicating items
      We duplicate the track's content once (so there are two sets)
      and let the CSS translateX(-50%) animate across one set.
    ════════════════════════════════════════════════ */
    (function setupSeamlessMarquee(){
     const track = document.getElementById('marqueeTrack');
     if(!track) return;
     // Avoid double-cloning on hot-reload / repeated runs
     if(track.dataset.cloned === 'true') return;
     const content = track.innerHTML;
     // Duplicate the content so animation can translate exactly -50%
     track.innerHTML = content + content;
     track.dataset.cloned = 'true';
    })();

  const progressBar = document.createElement('div');
  Object.assign(progressBar.style, {
    position:'fixed',top:'0',left:'0',height:'3px',width:'0%',
    background:'linear-gradient(90deg, #0066ff, #8a2be2)',
    zIndex:'9999',transition:'width .1s linear',
    pointerEvents:'none',
  });
  document.body.appendChild(progressBar);
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (window.scrollY / h * 100) + '%';
  }, { passive:true });


  /* ════════════════════════════════════════════════
     14. HERO SCROLL PARALLAX
  ════════════════════════════════════════════════ */
  gsap.to('.hero-inner', {
    scale:.96, opacity:0, y: -50, ease:'none',
    scrollTrigger:{
      trigger:'.hero', start:'top top', end:'70% top', scrub:true
    }
  });

});