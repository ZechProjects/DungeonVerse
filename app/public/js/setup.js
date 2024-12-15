let particleSystem = null;
let redOverlay = null;
let scene, camera, renderer, controls;
const wallSize = 10;
const player = { x: 1, y: 1, direction: 0, heading: "South" }; // Initial player position and facing direction (0: +Z)
const assetsPath = "assets/";
let touchStartX = 0;
let touchStartY = 0;
const clock = new THREE.Clock();

let playerLight = null;
let mixers = [];

let mapSizeX = 20;
let mapSizeY = 5;

let key = null;
let isTransitioning = false;

let wallTexture = null;
let wallMaterial = null;

let audioAssets = {};

const MOVEMENT_TRANSITION = 0.15; // Adjust this value to change the transition speed

/**
 * Game variables
 */
let moves = 0;
const GAME_STATES = {
  NAVIGATION: "NAVIGATION",
  COMBAT: "COMBAT",
  ENDED: "ENDED",
};
let GAME_STATE = GAME_STATES.NAVIGATION;

// Dungeon grid map (1 = wall, 0 = empty space)
let dungeonMap = [
  [
    { wall: true, texture: "rockwall" },
    { wall: true, texture: "rockwall" },
    { wall: true, texture: "rockwall" },
    { wall: true, texture: "rockwall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
  ],
  [
    { wall: true, texture: "rockwall" },
    { start: true },
    {},
    {},
    { wall: true, texture: "rockwall" },
    {},
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
  ],
  [
    { wall: true, texture: "rockwall" },
    { objects: [{ id: "chest", rotation: Math.PI / 2 }] },
    { wall: true, texture: "rockwall" },
    ,
    { objects: [{ id: "enemy", rotation: -Math.PI / 2 }] },
    {},
    {},
    {},
    {},
    { objects: [{ id: "key", rotation: 0 }] },
    { wall: true, texture: "wall" },
  ],
  [
    { wall: true, texture: "rockwall" },
    {},
    {},
    {},
    { wall: true, texture: "rockwall" },
    {},
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
  ],
  [
    { wall: true, texture: "rockwall" },
    { wall: true, texture: "rockwall" },
    { wall: true, texture: "rockwall" },
    { wall: true, texture: "rockwall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
    { wall: true, texture: "wall" },
  ],
];

if(localStorage.getItem('currentDungeon')) {
  const dungeonData = localStorage.getItem('currentDungeon');
  const dungeon = JSON.parse(dungeonData);
  dungeonMap = dungeon.map
  console.log("reached here")
}

console.log(dungeonMap)

let endX = 8;
let endY = 2;

function generateConnectedDungeonMap(width, height) {
  mapSizeX = width;
  mapSizeY = height;

  // Create an empty map filled with walls
  const map = Array.from({ length: height }, () => Array(width).fill(1));

  // Directions for carving paths: [dy, dx]
  const directions = [
    [0, -2], // Left
    [0, 2], // Right
    [-2, 0], // Up
    [2, 0], // Down
  ];

  function isWithinBounds(y, x) {
    return y > 0 && y < height - 1 && x > 0 && x < width - 1;
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function carvePassages(y, x) {
    // Mark the current cell as open
    map[y][x] = 0;

    // Shuffle directions to create random paths
    const shuffledDirections = shuffleArray(directions.slice());

    for (const [dy, dx] of shuffledDirections) {
      const ny = y + dy;
      const nx = x + dx;
      const midY = y + dy / 2;
      const midX = x + dx / 2;

      // Check if the new position is within bounds and surrounded by walls
      if (isWithinBounds(ny, nx) && map[ny][nx] === 1) {
        // Carve a path to the new cell
        map[midY][midX] = 0; // Remove wall between current cell and new cell
        carvePassages(ny, nx);
      }
    }
  }

  // Start carving from a random position
  const startY = Math.floor((Math.random() * (height - 2)) / 2) * 2 + 1;
  const startX = Math.floor((Math.random() * (width - 2)) / 2) * 2 + 1;
  carvePassages(startY, startX);

  return map;
}

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
