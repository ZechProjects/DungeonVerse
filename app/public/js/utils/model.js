import * as THREE from "three";
import { OrbitControls } from "../three/addons/controls/OrbitControls.js";
import { FBXLoader } from "../three/addons/loaders/FBXLoader.js";

export function load_model(scene, model, texture) {
  const fbxLoader = new FBXLoader();

  fbxLoader.load(
    "assets/3d/" + model + ".fbx",
    (object) => {
      // Add the model to the scene
      scene.add(object);

      // Traverse through model children to apply materials or textures
      object.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          // Load texture (example)
          const textureLoader = new THREE.TextureLoader();
          const texture = textureLoader.load("assets/3d/" + texture + ".jpg");
          child.material.map = texture;
        }
      });

      // Handle animations
      if (object.animations.length > 0) {
        console.log("Model has animations:", object.animations);
        const mixer = new THREE.AnimationMixer(object);
        const action = mixer.clipAction(object.animations[0]); // Play the first animation
        action.play();

        // Update mixer on render
        const animate = function () {
          requestAnimationFrame(animate);
          const delta = clock.getDelta();
          mixer.update(delta);
          renderer.render(scene, camera);
        };
        animate();
      }
    },
    (xhr) => {
      console.log(`Model loading: ${(xhr.loaded / xhr.total) * 100}% loaded`);
    },
    (error) => {
      console.error("An error occurred while loading the model:", error);
    }
  );
}
