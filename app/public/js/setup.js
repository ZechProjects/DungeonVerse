let particleSystem = null;
let redOverlay = null;
let scene, camera, renderer, controls;
const wallSize = 10;
const player = { x: 1, y: 1, direction: 0 }; // Initial player position and facing direction (0: +Z)
const assetsPath = "assets/";
let touchStartX = 0;
let touchStartY = 0;

let key = null;
let isTransitioning = false;

// Dungeon grid map (1 = wall, 0 = empty space)
const dungeonMap = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 1, 1, 1, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

init();

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
