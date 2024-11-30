// Handle player movement and rotation
function handleKeyDown(event) {
  if (isTransitioning) return;

  const moveStep = 1; // Move one tile at a time
  const dirX = Math.round(Math.sin(player.direction));
  const dirZ = Math.round(Math.cos(player.direction));
  let newX = player.x;
  let newY = player.y;
  let newDirection = player.direction;

  switch (event.key) {
    case "ArrowUp": // Move forward
    case "w": // Move forward
      if (!isWall(player.x + dirX, player.y + dirZ)) {
        newX += dirX;
        newY += dirZ;
      }
      break;
    case "s": // Move backward
    case "ArrowDown": // Move backward
      if (!isWall(player.x - dirX, player.y - dirZ)) {
        newX -= dirX;
        newY -= dirZ;
      }
      break;
    case "a": // Turn left
    case "ArrowLeft": // Turn left
      newDirection += Math.PI / 2;
      break;
    case "ArrowRight": // Turn right
    case "d": // Turn right
      newDirection -= Math.PI / 2;
      break;
  }

  // Update player position and direction with smooth transition
  isTransitioning = true;
  gsap.to(player, {
    x: newX,
    y: newY,
    direction: newDirection,
    duration: MOVEMENT_TRANSITION, // Adjust this value to change the transition speed
    onUpdate: () => {
      camera.position.set(
        player.x * wallSize,
        wallSize / 2,
        player.y * wallSize
      );
      const lookAtX =
        player.x * wallSize + Math.sin(player.direction) * wallSize;
      const lookAtZ =
        player.y * wallSize + Math.cos(player.direction) * wallSize;
      camera.lookAt(lookAtX, wallSize / 2, lookAtZ);
    },
    onComplete: () => {
      isTransitioning = false;
    },
  });

  play_sound("walk1.wav");
}

// Handle touch start
function handleTouchStart(event) {
  event.preventDefault(); // Prevent default touch behavior (e.g., scrolling)
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}

// Handle touch move
function handleTouchMove(event) {
  event.preventDefault(); // Prevent default touch behavior (e.g., scrolling)
  if (!touchStartX || !touchStartY || isTransitioning) {
    return;
  }

  const touchEndX = event.touches[0].clientX;
  const touchEndY = event.touches[0].clientY;

  const diffX = touchStartX - touchEndX;
  const diffY = touchStartY - touchEndY;
  let newX = player.x;
  let newY = player.y;
  let newDirection = player.direction;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    // Horizontal swipe
    if (diffX > 0) {
      // Swipe left
      newDirection -= Math.PI / 2;
    } else {
      // Swipe right
      newDirection += Math.PI / 2;
    }
  } else {
    // Vertical swipe
    const dirX = Math.round(Math.sin(player.direction));
    const dirZ = Math.round(Math.cos(player.direction));
    if (diffY > 0) {
      // Swipe up
      if (!isWall(player.x + dirX, player.y + dirZ)) {
        newX += dirX;
        newY += dirZ;
      }
    } else {
      // Swipe down
      if (!isWall(player.x - dirX, player.y - dirZ)) {
        newX -= dirX;
        newY -= dirZ;
      }
    }
  }

  // Reset touch start coordinates
  touchStartX = 0;
  touchStartY = 0;

  // Update player position and direction with smooth transition
  isTransitioning = true;
  gsap.to(player, {
    x: newX,
    y: newY,
    direction: newDirection,
    duration: MOVEMENT_TRANSITION, // Adjust this value to change the transition speed
    onUpdate: () => {
      camera.position.set(
        player.x * wallSize,
        wallSize / 2,
        player.y * wallSize
      );
      const lookAtX =
        player.x * wallSize + Math.sin(player.direction) * wallSize;
      const lookAtZ =
        player.y * wallSize + Math.cos(player.direction) * wallSize;
      camera.lookAt(lookAtX, wallSize / 2, lookAtZ);
    },
    onComplete: () => {
      isTransitioning = false;
    },
  });
}
