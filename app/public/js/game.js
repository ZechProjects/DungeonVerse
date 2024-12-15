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

  // Create dungeon walls based on the map
  createWalls();

  // Add floor
  const floorTexture = new THREE.TextureLoader().load(
    assetsPath + "img/wall3.png"
  );
  floorTexture.wrapS = THREE.RepeatWrapping;
  floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(dungeonMap[0].length, dungeonMap.length);
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
  ceilingTexture.repeat.set(dungeonMap[0].length, dungeonMap.length);
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

  // Example usage of loadGLTFModel
  loadGLTFModel(
    assetsPath + "3d/objects/chest.glb",
    new THREE.Vector3(10, 2, 18.5),
    8,
    new THREE.Euler(0, Math.PI / 2, 0)
  );

  var textureLoader = new THREE.TextureLoader();
  var remap = textureLoader.load(assetsPath + "3d/enemies/skeleton_grunt.jpg");
  var remap = new THREE.MeshStandardMaterial({
    map: textureLoader.load(assetsPath + "3d/enemies/skeleton_grunt.jpg"),
  });
  let enemy = loadFBXModel(
    assetsPath + "3d/enemies/Samba.fbx",
    new THREE.Vector3(50, 0, 20),
    0.05,
    new THREE.Euler(0, (Math.PI / 4) * 3, 0)
  );

  // Add event listener for player controls
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("touchstart", handleTouchStart);
  document.addEventListener("touchmove", handleTouchMove);
  animate();

  startGame();

  // Add at the top with other global variables
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Add this function to handle NFT wall clicks
  function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children);

    for (let i = 0; i < intersects.length; i++) {
      // Check if the intersected object is a wall with NFT data
      if (intersects[i].object.userData.nft) {
        const nftData = intersects[i].object.userData.nft;
        // Show NFT information modal or tooltip
        showNFTInfo(nftData);
        break;
      }
    }
  }

  // Add this function to show NFT information
  function showNFTInfo(nftData) {
    // You can create a modal or tooltip to show NFT information
    alert(`NFT: ${nftData.name}\nContract: ${nftData.contractAddress}\nToken ID: ${nftData.tokenId}`);
  }

  // Add the click event listener in init()
  document.addEventListener('click', onMouseClick);
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
  const check = dungeonMap[Math.round(y)]?.[Math.round(x)]?.wall;
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
  let wallTexture = {};
  let wallMaterial;

  // Create dungeon walls based on the map
  for (let row = 0; row < dungeonMap.length; row++) {
    for (let col = 0; col < dungeonMap[row].length; col++) {
      if (dungeonMap[row][col]?.wall) {
        if (dungeonMap[row][col]?.nft) {
          // Create NFT texture
          const nftTexture = new THREE.TextureLoader().load(dungeonMap[row][col].nft.image);
          wallMaterial = new THREE.MeshStandardMaterial({ map: nftTexture });
          
          // Add interaction data to the wall
          const wall = new THREE.Mesh(
            new THREE.BoxGeometry(wallSize, wallSize, wallSize),
            wallMaterial
          );
          wall.position.set(col * wallSize, wallSize / 2, row * wallSize);
          wall.userData.nft = dungeonMap[row][col].nft; // Store NFT data for interaction
          scene.add(wall);
          
        } else if (dungeonMap[row][col]?.texture) {
          // Regular textured wall
          if (wallTexture[dungeonMap[row][col].texture] === undefined) {
            wallTexture[dungeonMap[row][col].texture] = new THREE.TextureLoader().load(
              assetsPath + "img/" + dungeonMap[row][col].texture + ".png"
            );
          }
          wallMaterial = new THREE.MeshStandardMaterial({
            map: wallTexture[dungeonMap[row][col].texture],
          });
          
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

function loadGLTFModel(path, position, scale, rotation, material = null) {
  const loader = new THREE.GLTFLoader();
  loader.load(
    path,
    function (gltf) {
      const model = gltf.scene;

      // Set texture parameters and remove invalid material properties
      model.traverse((child) => {
        if (child.isMesh) {
          const mixer = new THREE.AnimationMixer(child);
          const animations = child.animations;
          console.log("animations", child.name, animations);
          if (material) {
            child.material = material;
          }
          if (child.material.map) {
            child.material.map.minFilter = THREE.LinearFilter;
            child.material.map.magFilter = THREE.LinearFilter;
            child.material.map.format = THREE.RGBAFormat;
          }
        }
      });

      model.position.copy(position);
      model.scale.set(scale, scale, scale);
      model.rotation.copy(rotation);
      scene.add(model);

      // Set up animation mixer
      const mixer = new THREE.AnimationMixer(model);
      const animations = model.animations;
      console.log("animations", animations);
      if (animations && animations.length > 0) {
        console.log("Model has animations:", animations);
        const action = mixer.clipAction(animations[0]);
        action.setLoop(THREE.LoopRepeat);
        action.play();
      }

      // Update the animation in the render loop
      function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        mixer.update(delta);
        renderer.render(scene, camera);
      }

      animate();
    },
    undefined,
    function (error) {
      console.error("An error happened while loading the model:", error);
    }
  );
}

function loadFBXModel(path, position, scale, rotation, material = null) {
  const loader = new THREE.FBXLoader();
  loader.load(
    path,
    function (model) {
      model.traverse((child) => {
        if (child.isMesh) {
          const mixer = new THREE.AnimationMixer(child);
          const animations = child.animations;
          console.log("animations", child.name, animations);
          if (material) {
            child.material = material;
          }
          if (child.material.map) {
            child.material.map.minFilter = THREE.LinearFilter;
            child.material.map.magFilter = THREE.LinearFilter;
            child.material.map.format = THREE.RGBAFormat;
          }
        }
      });

      model.position.copy(position);
      model.scale.set(scale, scale, scale);
      model.rotation.copy(rotation);
      scene.add(model);

      // Set up animation mixer
      const mixer = new THREE.AnimationMixer(model);
      const animations = model.animations;
      console.log("animations", animations);
      if (animations && animations.length > 0) {
        console.log("Model has animations:", animations);
        const action = mixer.clipAction(animations[0]);
        action.setLoop(THREE.LoopRepeat);
        action.play();
      }

      // Update the animation in the render loop
      function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        mixer.update(delta);
        renderer.render(scene, camera);
      }

      animate();
    },
    undefined,
    function (error) {
      console.error("An error happened while loading the model:", error);
    }
  );
}

function loadOBJModel(path, position, scale, rotation, material = null) {
  console.log("Loading OBJ model:", path);
  const loader = new THREE.OBJLoader();
  loader.load(
    path,
    function (obj) {
      obj.traverse((child) => {
        if (child.isMesh) {
          if (material) {
            child.material = material;
          }
          if (child.material.map) {
            child.material.map.minFilter = THREE.LinearFilter;
            child.material.map.magFilter = THREE.LinearFilter;
            child.material.map.format = THREE.RGBAFormat;
          }
        }
      });

      obj.position.copy(position);
      obj.scale.set(scale, scale, scale);
      obj.rotation.copy(rotation);
      scene.add(obj);

      // Set up animation mixer
      const mixer = new THREE.AnimationMixer(obj);
      const animations = obj.animations;

      if (animations && animations.length > 0) {
        console.log("Model has animations:", animations);
        const action = mixer.clipAction(animations[0]);
        action.setLoop(THREE.LoopRepeat);
        action.play();
      }

      // Update the animation in the render loop
      function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        mixer.update(delta);
        renderer.render(scene, camera);
      }

      animate();
    },
    undefined,
    function (error) {
      console.error("An error happened while loading the model:", error);
    }
  );
}

function showGameEndModal(moves) {
  document.getElementById("totalMoves").innerText = moves;
  $("#gameEndModal").modal("show");
  play_sound("win.mp3");
  confetti({
    particleCount: 300,
    spread: 100,
    origin: { y: 0.6 },
  });
}

function restartGame() {
  // Logic to restart the game
  location.reload();
}

function showToast(message, type = 'info') {
  const backgroundColor = {
    info: 'linear-gradient(to right, #00b09b, #96c93d)',
    error: 'linear-gradient(to right, #ff5f6d, #ffc371)',
    warning: 'linear-gradient(to right, #f7b733, #fc4a1a)',
    success: 'linear-gradient(to right, #00b09b, #96c93d)'
  };

  Toastify({
    text: message,
    duration: 3000,
    gravity: "bottom",
    position: "right",
    style: {
      background: backgroundColor[type]
    }
  }).showToast();
}
