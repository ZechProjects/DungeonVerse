// Initialize the scene
function init() {
  scene = new THREE.Scene();

  scene.fog = new THREE.Fog(0x222222, 10, 50);

  // Set up camera
  camera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(player.x * wallSize, wallSize / 2, player.y * wallSize);
  camera.lookAt(player.x * wallSize, wallSize / 2, (player.y + 1) * wallSize);

  // Set up renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Handle window resize
  window.addEventListener("resize", onWindowResize, false);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

  setup_flicker(scene);

  // Load wall texture
  wallTexture = new THREE.TextureLoader().load(assetsPath + "img/wall2.png");
  wallMaterial = new THREE.MeshStandardMaterial({
    map: wallTexture,
  });

  // Create dungeon walls based on the map
  createWalls();

  // Add floor
  const floorTexture = new THREE.TextureLoader().load(
    assetsPath + "img/wall3.png"
  );
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(mapSizeX, mapSizeY);
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: floorTexture,
  });
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(
      dungeonMap[0].length * wallSize,
      dungeonMap.length * wallSize
    ),
    floorMaterial
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(
    (dungeonMap[0].length / 2 - 0.5) * wallSize,
    0,
    (dungeonMap.length / 2 - 0.5) * wallSize
  );
  scene.add(floor);

  // Add ceiling
  const ceilingTexture = new THREE.TextureLoader().load(
    assetsPath + "img/ceiling.png"
  );
  ceilingTexture.wrapS = THREE.RepeatWrapping;
  ceilingTexture.wrapT = THREE.RepeatWrapping;
  ceilingTexture.repeat.set(mapSizeX, mapSizeY);
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    map: ceilingTexture,
  });
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(
      dungeonMap[0].length * wallSize,
      dungeonMap.length * wallSize
    ),
    ceilingMaterial
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(
    (dungeonMap[0].length / 2 - 0.5) * wallSize,
    wallSize,
    (dungeonMap.length / 2 - 0.5) * wallSize
  );
  scene.add(ceiling);

  setup_particles();

  key = load_sprite(
    "key",
    new THREE.Vector3(80, 4, 20),
    3,
    new THREE.Euler(0, -90, 0)
  );

  console.log("key", key);

  // Add event listener for player controls
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("touchstart", handleTouchStart);
  document.addEventListener("touchmove", handleTouchMove);
  animate();

  startGame();
}

function startGame() {
  moves = 0;
  GAME_STATE = GAME_STATES.NAVIGATION;
}

// Handle window resize
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Check if a position is a wall
function isWall(x, y) {
  const check = dungeonMap[Math.round(y)]?.[Math.round(x)] === 1;
  if (check) {
    play_sound("bash.wav");
    shakeScreen();
  }
  return check;
}

// Render the scene
function animate() {
  requestAnimationFrame(animate);
  particleSystem.rotation.y += 0.01;
  renderer.render(scene, camera);
}

function createWalls() {
  // Create dungeon walls based on the map
  for (let row = 0; row < dungeonMap.length; row++) {
    for (let col = 0; col < dungeonMap[row].length; col++) {
      if (dungeonMap[row][col] === 1) {
        const wall = new THREE.Mesh(
          new THREE.BoxGeometry(wallSize, wallSize, wallSize),
          wallMaterial
        );
        wall.position.set(col * wallSize, wallSize / 2, row * wallSize);
        scene.add(wall);
      }
    }
  }
}

function shakeScreen(duration = 0.2, intensity = 5) {
  const canvas = renderer.domElement;
  const timeline = gsap.timeline();

  intensity = Math.random() * intensity + 1;

  timeline.to(canvas, {
    x: `+=${intensity}`,
    y: `+=${intensity}`,
    duration: duration / 4,
    ease: "power1.inOut",
    yoyo: true,
    repeat: 3,
    onComplete: () => {
      gsap.set(canvas, { x: 0, y: 0 });
    },
  });
}

function generateNewDungeon() {
  // Example usage:
  mapSizeX = 20;
  mapSizeY = 5;

  dungeonMap = generateConnectedDungeonMap(mapSizeX, mapSizeY);
  // Remove existing walls
  scene.children = scene.children.filter(
    (child) => child.type !== "Mesh" || child.geometry.type !== "BoxGeometry"
  );
  // Recreate walls with textures
  createWalls();
}
