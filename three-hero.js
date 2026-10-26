/**
 * KOVID ANAND · PORTFOLIO (LIGHT THEME)
 * three-hero.js - Seamless, Tactile 3D Hero Sculpture
 * 
 * High-end art-directed 3D composition with zero clipping, dynamic responsive framing,
 * refined materials (optical glass, cobalt satin metal, ivory porcelain, titanium),
 * soft ambient contact shadow, and balanced studio lighting.
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

  // ── SCENE SETUP ──
  const scene = new THREE.Scene();

  // 38° FOV provides a more architectural, natural telephoto perspective with minimal distortion
  const camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 8.6);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  container.appendChild(renderer.domElement);

  // Master group for floating sculpture
  const sculptureGroup = new THREE.Group();
  scene.add(sculptureGroup);

  // ── REFINED MATERIALS (Formulated for pristine light architectural theme) ──

  // 1. Satin Cobalt Blue
  const cobaltMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x2563eb,
    metalness: 0.58,
    roughness: 0.22,
    clearcoat: 0.6,
    clearcoatRoughness: 0.12,
    reflectivity: 0.95
  });

  // 2. Pearlescent Ivory Porcelain
  const ceramicMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfcfcfc,
    roughness: 0.16,
    metalness: 0.08,
    clearcoat: 0.85,
    clearcoatRoughness: 0.08
  });

  // 3. Frosted Optical Glass Prism
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.04,
    roughness: 0.14,
    transmission: 0.74,
    thickness: 1.1,
    ior: 1.52,
    transparent: true,
    opacity: 0.86
  });

  // 4. Fine Brushed Titanium / Aerospace Alloy
  const titaniumMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4d4d8,
    metalness: 0.88,
    roughness: 0.24
  });

  // ── 3D SCULPTURAL COMPONENTS ──
  // Proportioned with precise geometric hierarchy so the maximum radius at any rotation is ~2.48 units

  // Component A: Central Multi-Faceted Crystal Core
  const coreGeo = new THREE.IcosahedronGeometry(1.18, 0);
  const coreMesh = new THREE.Mesh(coreGeo, glassMaterial);
  sculptureGroup.add(coreMesh);

  // Component B: Inner Geometric Cobalt Jewel
  const innerJewelGeo = new THREE.OctahedronGeometry(0.64, 0);
  const innerJewelMesh = new THREE.Mesh(innerJewelGeo, cobaltMaterial);
  sculptureGroup.add(innerJewelMesh);

  // Component C: Nested Orbital Torus Rings
  // Primary cobalt orbital ring
  const primaryRingGeo = new THREE.TorusGeometry(1.85, 0.05, 32, 128);
  const primaryRingMesh = new THREE.Mesh(primaryRingGeo, cobaltMaterial);
  primaryRingMesh.rotation.x = Math.PI / 3.2;
  primaryRingMesh.rotation.y = Math.PI / 7;
  sculptureGroup.add(primaryRingMesh);

  // Secondary ivory ceramic floating ring
  const secondaryRingGeo = new THREE.TorusGeometry(2.18, 0.04, 32, 128);
  const secondaryRingMesh = new THREE.Mesh(secondaryRingGeo, ceramicMaterial);
  secondaryRingMesh.rotation.x = -Math.PI / 4;
  secondaryRingMesh.rotation.y = -Math.PI / 5;
  sculptureGroup.add(secondaryRingMesh);

  // Tertiary delicate titanium ring
  const tertiaryRingGeo = new THREE.TorusGeometry(2.46, 0.026, 32, 128);
  const tertiaryRingMesh = new THREE.Mesh(tertiaryRingGeo, titaniumMaterial);
  tertiaryRingMesh.rotation.x = Math.PI / 2.2;
  tertiaryRingMesh.rotation.z = Math.PI / 4;
  sculptureGroup.add(tertiaryRingMesh);

  // Component D: Interconnected Floating Node Spheres
  const nodeCount = 8;
  const nodesGroup = new THREE.Group();
  sculptureGroup.add(nodesGroup);

  const nodeGeo = new THREE.SphereGeometry(0.095, 24, 24);
  const satelliteMeshes = [];

  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * Math.PI * 2;
    const rad = 1.85;
    const mesh = new THREE.Mesh(nodeGeo, i % 2 === 0 ? cobaltMaterial : ceramicMaterial);
    mesh.position.set(
      Math.cos(angle) * rad,
      Math.sin(angle) * 0.32,
      Math.sin(angle) * rad
    );
    nodesGroup.add(mesh);
    satelliteMeshes.push(mesh);
  }

  // Component E: Soft Ground Contact Shadow (Natural, seamless ambient occlusion disc)
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const ctx = shadowCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 128, 10, 128, 128, 110);
  gradient.addColorStop(0, 'rgba(26, 32, 44, 0.12)');
  gradient.addColorStop(0.35, 'rgba(26, 32, 44, 0.055)');
  gradient.addColorStop(0.7, 'rgba(26, 32, 44, 0.012)');
  gradient.addColorStop(1, 'rgba(26, 32, 44, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
  const shadowGeo = new THREE.PlaneGeometry(4.2, 4.2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
    opacity: 0.9
  });
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -2.15;
  scene.add(shadowPlane);

  // ── STUDIO LIGHTING FOR LIGHT ARCHITECTURAL THEME ──
  // Ambient diffuse light
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
  scene.add(ambientLight);

  // Warm key light from top-left
  const keyLight = new THREE.DirectionalLight(0xfffbf0, 2.1);
  keyLight.position.set(5.5, 7.5, 6.5);
  scene.add(keyLight);

  // Soft cool fill light from right
  const fillLight = new THREE.DirectionalLight(0xe0f2fe, 1.3);
  fillLight.position.set(-5.5, -1.8, 4.5);
  scene.add(fillLight);

  // Delicate rim light for crystal refraction rim
  const rimLight = new THREE.PointLight(0x60a5fa, 1.6, 16);
  rimLight.position.set(0, 3.5, -3.5);
  scene.add(rimLight);

  // Ground bounce light for subtle studio depth
  const bounceLight = new THREE.DirectionalLight(0xf8fafc, 0.4);
  bounceLight.position.set(0, -5, 2);
  scene.add(bounceLight);

  // ── DYNAMIC RESPONSIVE FRAMING ──
  // Dynamically frames the camera so the sculpture ALWAYS fits with ample breathing room,
  // completely eliminating any clipping across all viewport sizes and aspect ratios.
  const updateCameraFraming = () => {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;

    const aspect = width / height;
    camera.aspect = aspect;

    // Sculptural bounding radius + ~22% margin ensures seamless floating with zero edge collisions
    const boundingRadius = 2.95;
    const vFovRad = (camera.fov * Math.PI) / 180;
    const distY = boundingRadius / Math.tan(vFovRad / 2);
    const distX = boundingRadius / (Math.tan(vFovRad / 2) * aspect);

    // Keep camera centered at y=0 so top and bottom margins are perfectly balanced
    const optimalDistance = Math.max(distY, distX, 8.2);
    camera.position.set(0, 0, optimalDistance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
  };

  updateCameraFraming();
  window.addEventListener('resize', updateCameraFraming, { passive: true });

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

  // Touch support with non-intrusive gesture handling
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

  // Visibility optimization (pause loop when scrolled offscreen)
  let isVisible = true;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(container);
  }

  // ── ANIMATION LOOP ──
  const clock = new THREE.Clock();

  const animate = () => {
    requestAnimationFrame(animate);

    if (!isVisible) return;

    const delta = clock.getDelta();
    const speed = prefersReducedMotion ? 0.2 : 1.0;

    // Ambient floating oscillation
    const time = clock.getElapsedTime() * speed;
    sculptureGroup.position.y = Math.sin(time * 0.75) * 0.07;
    shadowPlane.scale.setScalar(1 + Math.sin(time * 0.75) * 0.035);

    if (!isDragging) {
      // Gentle continuous rotation
      sculptureGroup.rotation.y += 0.0035 * speed;
      sculptureGroup.rotation.x += 0.0012 * speed;

      // Pointer parallax lerp
      targetRotationY += (mouseX * 0.32 - targetRotationY) * 0.035;
      targetRotationX += (-mouseY * 0.30 - targetRotationX) * 0.035;
    }

    sculptureGroup.rotation.y += (targetRotationY - sculptureGroup.rotation.y) * 0.07;
    sculptureGroup.rotation.x += (targetRotationX - sculptureGroup.rotation.x) * 0.07;

    // Relative nested rotations
    primaryRingMesh.rotation.z += 0.0055 * speed;
    secondaryRingMesh.rotation.x -= 0.0045 * speed;
    tertiaryRingMesh.rotation.y += 0.0035 * speed;

    coreMesh.rotation.y += 0.002 * speed;
    innerJewelMesh.rotation.y -= 0.007 * speed;
    innerJewelMesh.rotation.x += 0.0035 * speed;

    nodesGroup.rotation.y += 0.0028 * speed;

    renderer.render(scene, camera);
  };

  animate();
})();
