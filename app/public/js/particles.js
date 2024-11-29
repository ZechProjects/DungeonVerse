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
    size: 0.3, // Size of particles
    transparent: true,
    opacity: 0.8,
  });

  particleMaterial.map = new THREE.TextureLoader().load("assets/img/glow.png");
  particleMaterial.blending = THREE.AdditiveBlending; // Creates a glowing effect
  particleMaterial.depthWrite = false;

  particleSystem = new THREE.Points(particles, particleMaterial);
  particleSystem.position.y = 5; // Place in front of the camera
  particleSystem.position.x = 30; // Place in front of the camera
  particleSystem.position.z = 30; // Place in front of the camera
  scene.add(particleSystem);
}
