/**
 * KOVID ANAND PORTFOLIO 2.0
 * three-hero.js - Interactive 3D Spatial Data & Neural Polyhedron
 * Built with Three.js r128 - Performant, responsive, battery-friendly.
 */

(() => {
  'use strict';

  const container = document.getElementById('heroThreeContainer');
  if (!container) return;

  // Reduced motion preference check
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // WebGL Availability Check
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

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 7.5;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  // Group to hold all 3D components
  const masterGroup = new THREE.Group();
  scene.add(masterGroup);

  // 1. Core Geometric Polyhedron (Icosahedron with wireframe and vertices)
  const coreGeometry = new THREE.IcosahedronGeometry(1.8, 1);
  
  // Wireframe
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    wireframe: true,
    transparent: true,
    opacity: 0.38
  });
  const wireMesh = new THREE.Mesh(coreGeometry, wireMaterial);
  masterGroup.add(wireMesh);

  // Glowing Vertices
  const vertexPointsGeo = new THREE.BufferGeometry();
  const corePos = coreGeometry.attributes.position.array;
  vertexPointsGeo.setAttribute('position', new THREE.BufferAttribute(corePos, 3));
  
  const vertexMaterial = new THREE.PointsMaterial({
    color: 0x60a5fa,
    size: 0.09,
    transparent: true,
    opacity: 0.85
  });
  const vertexPoints = new THREE.Points(vertexPointsGeo, vertexMaterial);
  masterGroup.add(vertexPoints);

  // 2. Inner Crystalline Polyhedron (Faceted, deep glass)
  const innerGeometry = new THREE.IcosahedronGeometry(1.1, 0);
  const innerMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.45,
    roughness: 0.2,
    metalness: 0.8,
    transparent: true,
    opacity: 0.75,
    flatShading: true
  });
  const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
  masterGroup.add(innerMesh);

  // 3. Nested Orbital Technical Rings
  const createOrbitalRing = (radius, tube, color, rotX, rotY) => {
    const ringGeo = new THREE.TorusGeometry(radius, tube, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.45,
      wireframe: true
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = rotX;
    ringMesh.rotation.y = rotY;
    return ringMesh;
  };

  const ring1 = createOrbitalRing(2.6, 0.012, 0x38bdf8, Math.PI / 3, 0);
  const ring2 = createOrbitalRing(3.1, 0.010, 0x818cf8, -Math.PI / 4, Math.PI / 6);
  const ring3 = createOrbitalRing(3.5, 0.008, 0x06b6d4, Math.PI / 6, -Math.PI / 3);

  masterGroup.add(ring1);
  masterGroup.add(ring2);
  masterGroup.add(ring3);

  // 4. Dimensional Data Dust Particles
  const particleCount = 240;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleScales = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const r = 2.4 + Math.random() * 3.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    particlePositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    particlePositions[i * 3 + 2] = r * Math.cos(phi);
    particleScales[i] = Math.random() * 0.06 + 0.02;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x93c5fd,
    size: 0.045,
    transparent: true,
    opacity: 0.65
  });
  const particleSystem = new THREE.Points(particleGeo, particleMat);
  masterGroup.add(particleSystem);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const keyLight = new THREE.PointLight(0x3b82f6, 2.5, 30);
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0x06b6d4, 1.8, 30);
  fillLight.position.set(-5, -4, 4);
  scene.add(fillLight);

  const topRimLight = new THREE.PointLight(0x818cf8, 1.5, 20);
  topRimLight.position.set(0, 6, -4);
  scene.add(topRimLight);

  // Pointer & Drag Interaction State
  let mouseX = 0;
  let mouseY = 0;
  let targetRotationX = 0;
  let targetRotationY = 0;
  let isDragging = false;
  let previousPointerX = 0;
  let previousPointerY = 0;
  let isHovered = false;

  const onPointerMove = (e) => {
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    mouseX = x;
    mouseY = y;

    if (isDragging) {
      const deltaX = e.clientX - previousPointerX;
      const deltaY = e.clientY - previousPointerY;
      targetRotationY += deltaX * 0.007;
      targetRotationX += deltaY * 0.007;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
    }
  };

  const onPointerDown = (e) => {
    isDragging = true;
    previousPointerX = e.clientX;
    previousPointerY = e.clientY;
    container.style.cursor = 'grabbing';
  };

  const onPointerUp = () => {
    isDragging = false;
    container.style.cursor = 'grab';
  };

  container.addEventListener('pointermove', onPointerMove, { passive: true });
  container.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointerenter', () => { isHovered = true; });
  container.addEventListener('pointerleave', () => { isHovered = false; });

  // Touch handlers for mobile
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousPointerX = e.touches[0].clientX;
      previousPointerY = e.touches[0].clientY;
    }
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - previousPointerX;
      const deltaY = e.touches[0].clientY - previousPointerY;
      targetRotationY += deltaX * 0.006;
      targetRotationX += deltaY * 0.006;
      previousPointerX = e.touches[0].clientX;
      previousPointerY = e.touches[0].clientY;
    }
  }, { passive: true });

  container.addEventListener('touchend', () => {
    isDragging = false;
  }, { passive: true });

  // Resize handler
  const onResize = () => {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };
  window.addEventListener('resize', onResize, { passive: true });

  // Liveness & Visibility optimization: stop render loop when scrolled offscreen
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
    const speedMultiplier = prefersReducedMotion ? 0.2 : 1.0;

    // Default continuous ambient rotation
    if (!isDragging) {
      masterGroup.rotation.y += 0.0035 * speedMultiplier;
      masterGroup.rotation.x += 0.0018 * speedMultiplier;
      
      // Gentle cursor parallax influence
      targetRotationY += (mouseX * 0.35 - targetRotationY) * 0.035;
      targetRotationX += (-mouseY * 0.35 - targetRotationX) * 0.035;
    }

    // Smooth inertia interpolation
    masterGroup.rotation.y += (targetRotationY - masterGroup.rotation.y) * 0.08;
    masterGroup.rotation.x += (targetRotationX - masterGroup.rotation.x) * 0.08;

    // Independent nested rotations for dynamic dimensionality
    ring1.rotation.z += 0.006 * speedMultiplier;
    ring2.rotation.y += 0.008 * speedMultiplier;
    ring3.rotation.x -= 0.005 * speedMultiplier;

    innerMesh.rotation.y -= 0.004 * speedMultiplier;
    innerMesh.rotation.z += 0.002 * speedMultiplier;

    particleSystem.rotation.y -= 0.0015 * speedMultiplier;

    // Dynamic light hover modulation
    if (isHovered) {
      keyLight.intensity = THREE.MathUtils.lerp(keyLight.intensity, 3.2, 0.05);
      fillLight.intensity = THREE.MathUtils.lerp(fillLight.intensity, 2.4, 0.05);
    } else {
      keyLight.intensity = THREE.MathUtils.lerp(keyLight.intensity, 2.2, 0.05);
      fillLight.intensity = THREE.MathUtils.lerp(fillLight.intensity, 1.6, 0.05);
    }

    renderer.render(scene, camera);
  };

  animate();
})();
