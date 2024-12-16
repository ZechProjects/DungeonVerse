function setup_particles(x, y, z) {
  const particles = new THREE.BufferGeometry();
  const particleCount = 300; // Number of particles
  const positions = new Float32Array(particleCount * 3); // x, y, z for each particle

  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 6; // Random position in space
  }

  particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff, // Particle color
    size: 0.5, // Size of particles
    transparent: true,
    opacity: 0.5,
  });

  particleMaterial.map = new THREE.TextureLoader().load("assets/img/glow.png");
  particleMaterial.blending = THREE.AdditiveBlending; // Creates a glowing effect
  particleMaterial.depthWrite = false;

  particleSystem = new THREE.Points(particles, particleMaterial);
  particleSystem.position.y = y; // Place in front of the camera
  particleSystem.position.x = x; // Place in front of the camera
  particleSystem.position.z = z; // Place in front of the camera
  scene.add(particleSystem);
}
