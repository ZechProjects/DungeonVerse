let particleSystem = null;
let redOverlay = null;

function setup_flicker(scene) {
  // Create a red tint overlay
  const redOverlayGeometry = new THREE.PlaneGeometry(2, 2);
  const redOverlayMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 1, // Start fully transparent
  });

  redOverlay = new THREE.Mesh(redOverlayGeometry, redOverlayMaterial);
  redOverlay.position.z = -1; // Place in front of the camera
  scene.add(redOverlay);
}

function setup_particles(scene) {
  const particles = new THREE.BufferGeometry();
  const particleCount = 1000; // Number of particles
  const positions = new Float32Array(particleCount * 3); // x, y, z for each particle

  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10; // Random position in space
  }

  particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff, // Particle color
    size: 0.1, // Size of particles
    transparent: true,
    opacity: 0.8,
  });

  particleSystem = new THREE.Points(particles, particleMaterial);
  particleSystem.position.x = 30; // Place in front of the camera
  particleSystem.position.z = 30; // Place in front of the camera
  scene.add(particleSystem);
}
