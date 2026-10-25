/**
 * KOVID ANAND · PORTFOLIO V2 (LIGHT THEME)
 * three-hero.js - Tactile, Sculptural 3D Art Piece for Light Environment
 * Featuring realistic materials: Frosted Optical Glass, Satin Metallic Rings,
 * Pearlescent Core, Studio Lighting & Contact Shadows.
 */

(() => {
  'use strict';

  const container = document.getElementById('heroThreeContainer');
  if (!container) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hasWebGL = () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  };

  if (!hasWebGL() || typeof THREE === 'undefined') {
    container.classList.add('three-fallback');
    return;
  }

  // Scene setup
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0.4, 7.2);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Master group for floating sculpture
  const sculptureGroup = new THREE.Group();
  scene.add(sculptureGroup);

  // ── MATERIALS (Designed specifically for clean light environment) ──
  
  // 1. Satin Cobalt Core Ring & Accents
  const cobaltMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x2563eb,
    metalness: 0.65,
    roughness: 0.22,
    clearcoat: 0.4,
    clearcoatRoughness: 0.15,
    reflectivity: 0.9
  });

  // 2. Pearlescent Ceramic / Polished Ivory
  const ceramicMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfdfdfd,
    roughness: 0.18,
    metalness: 0.1,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1
  });

  // 3. Frosted Optical Glass (Translucent with light refraction)
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.05,
    roughness: 0.12,
    transmission: 0.78,
    thickness: 1.2,
    ior: 1.52,
    transparent: true,
    opacity: 0.88
  });

  // 4. Fine Brushed Silver/Titanium
  const titaniumMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    metalness: 0.85,
    roughness: 0.28
  });

  // ── 3D SCULPTURAL COMPONENTS ──

  // Component A: Central Multi-Faceted Crystal Core
  const coreGeo = new THREE.IcosahedronGeometry(1.35, 0);
  const coreMesh = new THREE.Mesh(coreGeo, glassMaterial);
  coreMesh.castShadow = true;
  sculptureGroup.add(coreMesh);

  // Component B: Inner Geometric Jewel (floating inside the glass)
  const innerJewelGeo = new THREE.OctahedronGeometry(0.72, 0);
  const innerJewelMesh = new THREE.Mesh(innerJewelGeo, cobaltMaterial);
  sculptureGroup.add(innerJewelMesh);

  // Component C: Nested Orbital Torus Rings
  // Primary cobalt orbital ring
  const primaryRingGeo = new THREE.TorusGeometry(2.1, 0.055, 32, 128);
  const primaryRingMesh = new THREE.Mesh(primaryRingGeo, cobaltMaterial);
  primaryRingMesh.rotation.x = Math.PI / 3.2;
  primaryRingMesh.rotation.y = Math.PI / 7;
  sculptureGroup.add(primaryRingMesh);

  // Secondary ivory floating ring
  const secondaryRingGeo = new THREE.TorusGeometry(2.45, 0.045, 32, 128);
  const secondaryRingMesh = new THREE.Mesh(secondaryRingGeo, ceramicMaterial);
  secondaryRingMesh.rotation.x = -Math.PI / 4;
  secondaryRingMesh.rotation.y = -Math.PI / 5;
  sculptureGroup.add(secondaryRingMesh);

  // Tertiary delicate titanium ring
  const tertiaryRingGeo = new THREE.TorusGeometry(2.78, 0.03, 32, 128);
  const tertiaryRingMesh = new THREE.Mesh(tertiaryRingGeo, titaniumMaterial);
  tertiaryRingMesh.rotation.x = Math.PI / 2.2;
  tertiaryRingMesh.rotation.z = Math.PI / 4;
  sculptureGroup.add(tertiaryRingMesh);

  // Component D: Interconnected Floating Node Spheres
  const nodeCount = 8;
  const nodesGroup = new THREE.Group();
  sculptureGroup.add(nodesGroup);

  const nodeGeo = new THREE.SphereGeometry(0.11, 24, 24);
  const satelliteMeshes = [];

  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * Math.PI * 2;
    const rad = 2.1;
    const mesh = new THREE.Mesh(nodeGeo, i % 2 === 0 ? cobaltMaterial : ceramicMaterial);
    mesh.position.set(
      Math.cos(angle) * rad,
      Math.sin(angle) * 0.35,
      Math.sin(angle) * rad
    );
    nodesGroup.add(mesh);
    satelliteMeshes.push(mesh);
  }

  // Component E: Soft Ground Contact Shadow (simulates depth in light studio)
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const ctx = shadowCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
  gradient.addColorStop(0, 'rgba(30, 41, 59, 0.16)');
  gradient.addColorStop(0.4, 'rgba(30, 41, 59, 0.06)');
  gradient.addColorStop(1, 'rgba(30, 41, 59, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowGeo = new THREE.PlaneGeometry(6.5, 6.5);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false
  });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -2.45;
  scene.add(shadowPlane);

  // ── STUDIO LIGHTING FOR LIGHT THEME ──
  // Ambient diffuse light
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
  scene.add(ambientLight);

  // Warm key light from top-left
  const keyLight = new THREE.DirectionalLight(0xfffbf0, 2.2);
  keyLight.position.set(6, 8, 7);
  scene.add(keyLight);

  // Soft cool fill light from right
  const fillLight = new THREE.DirectionalLight(0xe0f2fe, 1.4);
  fillLight.position.set(-6, -2, 5);
  scene.add(fillLight);

  // Backlight for glass refraction rim
  const rimLight = new THREE.PointLight(0x38bdf8, 2.0, 15);
  rimLight.position.set(0, 4, -4);
  scene.add(rimLight);

  // ── INTERACTIVITY & POINTER CONTROLS ──
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;
  let isDragging = false;
  let prevPointerX = 0;
  let prevPointerY = 0;

  const onPointerMove = (e) => {
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    mouseX = x;
    mouseY = y;

    if (isDragging) {
      const deltaX = e.clientX - prevPointerX;
      const deltaY = e.clientY - prevPointerY;
      targetRotationY += deltaX * 0.007;
      targetRotationX += deltaY * 0.007;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
    }
  };

  const onPointerDown = (e) => {
    isDragging = true;
    prevPointerX = e.clientX;
    prevPointerY = e.clientY;
    container.style.cursor = 'grabbing';
  };

  const onPointerUp = () => {
    isDragging = false;
    container.style.cursor = 'grab';
  };

  container.addEventListener('pointermove', onPointerMove, { passive: true });
  container.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);

  // Touch support for mobile
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      prevPointerX = e.touches[0].clientX;
      prevPointerY = e.touches[0].clientY;
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - prevPointerX;
      const deltaY = e.touches[0].clientY - prevPointerY;
      targetRotationY += deltaX * 0.006;
      targetRotationX += deltaY * 0.006;
      prevPointerX = e.touches[0].clientX;
      prevPointerY = e.touches[0].clientY;
    }
  }, { passive: true });

  container.addEventListener('touchend', () => { isDragging = false; }, { passive: true });

  // Responsive resize
  const onResize = () => {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener('resize', onResize, { passive: true });

  // Visibility optimization (pause when scrolled offscreen)
  let isVisible = true;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(container);
  }

  // Animation Loop
  let clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);

    if (!isVisible) return;

    const delta = clock.getDelta();
    const speed = prefersReducedMotion ? 0.2 : 1.0;

    // Ambient floating oscillation
    const time = clock.getElapsedTime() * speed;
    sculptureGroup.position.y = Math.sin(time * 0.8) * 0.08;
    shadowPlane.scale.setScalar(1 + Math.sin(time * 0.8) * 0.04);

    if (!isDragging) {
      // Gentle continuous rotation
      sculptureGroup.rotation.y += 0.004 * speed;
      sculptureGroup.rotation.x += 0.0015 * speed;

      // Pointer parallax lerp
      targetRotationY += (mouseX * 0.38 - targetRotationY) * 0.035;
      targetRotationX += (-mouseY * 0.35 - targetRotationX) * 0.035;
    }

    sculptureGroup.rotation.y += (targetRotationY - sculptureGroup.rotation.y) * 0.07;
    sculptureGroup.rotation.x += (targetRotationX - sculptureGroup.rotation.x) * 0.07;

    // Nested relative rotations
    primaryRingMesh.rotation.z += 0.006 * speed;
    secondaryRingMesh.rotation.x -= 0.005 * speed;
    tertiaryRingMesh.rotation.y += 0.004 * speed;

    coreMesh.rotation.y += 0.002 * speed;
    innerJewelMesh.rotation.y -= 0.008 * speed;
    innerJewelMesh.rotation.x += 0.004 * speed;

    nodesGroup.rotation.y += 0.003 * speed;

    renderer.render(scene, camera);
  };

  animate();
})();
