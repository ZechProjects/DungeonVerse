function load_sprite(
  img,
  position,
  scale = 1,
  rotation = new THREE.Euler(0, 0, 0)
) {
  // Load the PNG texture
  const textureLoader = new THREE.TextureLoader();
  const sprite = textureLoader.load("assets/img/" + img + ".png", (texture) => {
    // Create a material with the loaded texture
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });

    // Create a plane geometry and apply the material
    const geometry = new THREE.PlaneGeometry(2, 2); // Adjust size as needed
    const plane = new THREE.Mesh(geometry, material);

    // Position the plane in the scene
    plane.position.copy(position); // Adjust position as needed
    plane.scale.set(scale, scale, scale); // Adjust scale as needed
    plane.rotation.copy(rotation);
    scene.add(plane);

    return plane;
  });

  return sprite;
}
