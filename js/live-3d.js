import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
document.addEventListener('DOMContentLoaded', function() {
init();
});
// Configuration variables

// Spin things

const initialCubeRotation = Math.PI;
const constantRotationSpeedX = 0.004;
const constantRotationSpeedY = 0.004;
const dragRotationMultiplier = 0.007;
const dragFallOff = 0.95;
const maxRotationSpeed = 0.2;

// The cameraman stands here

const cameraPosition = 2.5;

// Various scene colours

const pirateClassicGold = "#BB9645";
const pirateGold = "#ff7300";
const pirateDark = "#090909";
const pirateBlue = "#24243a";

// On load spin in speed

let dragSpeedX = 0,
  dragSpeedY = 0;
let textCanvas, textContext;

// Text colour controller

const pirateText = pirateDark;

// Fonts (3D fonts coming soon - maybe)

const largeFont = "800 28px 'Arial Condensed', 'Arial Bold', sans-serif";
const smallFont = "800 24px 'Arial Condensed', 'Arial Bold', sans-serif";

// Light configuration. It's heavy work

const pirateLightColour = "#555";
const pointLightIntensity = 600;
const pointLightDistance = 30000;
const pointLightDecay = 1;
const pointLightPosition = { x: 2, y: 4, z: 5 };
const ambientLightIntensity = 0;

// Material configuration

const cubeMaterialTransparent = false;
const cubeEmissiveIntensity = 0;
const cubeEmissiveIColour = "#ffffff";
const cubeReflectivity = 1;
const cubeRoughness = 0.03;
const cubeMetalness = 0.7;
const cubeEnvMapIntensity = 0.14;

// Shoving these material settings on to the 3D object

const cubeMaterialsConfig = new Array(6).fill({
  transparent: cubeMaterialTransparent,
  emissive: cubeEmissiveIColour,
  emissiveIntensity: cubeEmissiveIntensity,
  reflectivity: cubeReflectivity,
  roughness: cubeRoughness,
  metalness: cubeMetalness,
  envMapIntensity: cubeEnvMapIntensity,
});

// Scene setup variables

let scene, camera, renderer, cube;
let mouseDown = false,
  mouseX = 0,
  mouseY = 0;
let ambientLight, pointLight;

// Initialisation function

function init() {
  scene = new THREE.Scene();
  // scene.fog = new THREE.Fog( "#000000", 3, 1 );
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  // renderer.setSize(window.innerWidth, window.innerHeight);

  document.getElementById("container").appendChild(renderer.domElement);

  createTextCanvas();
  createCube();
  setupLights();

  camera.position.z = cameraPosition;

  addEventListeners();
  animate();

  handleWindowResize();
}

// Text canvas creation for cube faces, not your faces - I need make this use the global variables above

function createTextCanvas() {
  textCanvas = document.createElement("canvas");
  textCanvas.width = 256;
  textCanvas.height = 256;
  textContext = textCanvas.getContext("2d");
  textContext.font = "800 30px 'Arial Condensed'";
  textContext.textAlign = "center";
  textContext.textBaseline = "middle";
}

// Cube face texture creation. Yay!

function createCubeFaceTexture(title, data, textColor, faceColor) {
  const faceCanvas = document.createElement("canvas");
  faceCanvas.width = 256;
  faceCanvas.height = 256;
  const faceContext = faceCanvas.getContext("2d");

  faceContext.textAlign = "center";
  faceContext.textBaseline = "middle";

  faceContext.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
  faceContext.fillStyle = faceColor;
  faceContext.fillRect(0, 0, faceCanvas.width, faceCanvas.height);

  // Drawing text depending on whether the title is present

  if (title) {
    faceContext.font = largeFont;
    faceContext.fillStyle = textColor;
    faceContext.fillText(title, 128, 100);

    faceContext.font = smallFont;
    faceContext.fillText(data, 128, 150);
  } else {
    faceContext.font = largeFont;
    faceContext.fillStyle = textColor;
    faceContext.fillText(data, 128, 128);
  }

  return new THREE.CanvasTexture(faceCanvas);
}

// Function to load a Pirate HDRI image and create an environment map

function createEnvironmentMap() {
  const textureLoader = new THREE.TextureLoader();
  const envMap = textureLoader.load("../img/pc-reflection-2.jpg");
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  return envMap;
}

// Cube creation, like a god

function createCube() {
  const geometry = new THREE.BoxGeometry();
  const envMap = createEnvironmentMap();
  const materials = cubeMaterialsConfig.map((config, index) => {
    
    // Data pirated from local storage

    const arrrData = JSON.parse(localStorage.getItem("arrrData")) || {};
    let title, data;
    switch (index) {
      case 0:
        title = "";
        data = document.getElementById("textInput").value || "Loading...";
        break;
      case 1:
        title = "Value USD";
        data = `$${(parseFloat(arrrData.priceUSD) || 0).toLocaleString()}`;
        break;
      case 2:
        title = "Value BTC";
        data = arrrData.priceBTC || "Loading...";
        break;
      case 3:
        title = "24 Hour Vol";
        data = `$${(parseFloat(arrrData.volume24h) || 0).toLocaleString()}`;
        break;
      case 4:
        title = "24 Hour High";
        data = `$${(parseFloat(arrrData.high24h) || 0).toLocaleString()}`;
        break;
      case 5:
        title = "24 Hour Low";
        data = `$${(parseFloat(arrrData.low24h) || 0).toLocaleString()}`;
        break;
      default:
        title = "Side";
        data = (index + 1).toString();
    }

    const texture = createCubeFaceTexture(
      title,
      data,
      document.getElementById("textColourPicker").value || pirateText,
      document.getElementById("cubeColourPicker").value || pirateGold
    );
    return new THREE.MeshPhysicalMaterial({
      map: texture,
      envMap: envMap,
      transparent: config.transparent,
      reflectivity: config.reflectivity,
      emissive: config.emissive,
      emissiveIntensity: config.emissiveIntensity,
      roughness: config.roughness,
      metalness: config.metalness,
      envMapIntensity: config.envMapIntensity,
    });
  });

  cube = new THREE.Mesh(geometry, materials);
  cube.rotation.y = initialCubeRotation;
  scene.add(cube);
}

// Lighting setup. A bright idea.

function setupLights() {
  pointLight = new THREE.PointLight(
    pirateLightColour,
    pointLightIntensity,
    pointLightDistance,
    pointLightDecay
  );
  pointLight.position.set(
    pointLightPosition.x,
    pointLightPosition.y,
    pointLightPosition.z
  );
  scene.add(pointLight);
  ambientLight = new THREE.AmbientLight(
    pirateLightColour,
    ambientLightIntensity
  );
  scene.add(ambientLight);
}

// Event listener setup

function addEventListeners() {
  renderer.domElement.addEventListener("mousemove", handleMouseEvents);
  renderer.domElement.addEventListener("mousedown", handleMouseEvents);
  renderer.domElement.addEventListener("mouseup", handleMouseEvents);

  document.getElementById("cubeColourPicker").addEventListener("input", () => {
    refreshCube();
  });
  document.getElementById("textColourPicker").addEventListener("input", () => {
    refreshCube();
  });
  document.getElementById("textInput").addEventListener("input", () => {
    refreshCube();
  });

  window.addEventListener("resize", handleWindowResize);

  // Adding touch event listeners

  renderer.domElement.addEventListener("touchstart", handleTouchEvents, {
    passive: false,
  });
  renderer.domElement.addEventListener("touchmove", handleTouchEvents, {
    passive: false,
  });
  renderer.domElement.addEventListener("touchend", handleTouchEvents, {
    passive: false,
  });
}

// Touch event handler

function handleTouchEvents(event) {
  event.preventDefault();
  const touch = event.touches[0] || event.changedTouches[0];

  if (event.type === "touchstart") {
    mouseDown = true;
    mouseX = touch.pageX;
    mouseY = touch.pageY;
  } else if (event.type === "touchmove" && mouseDown) {
    dragSpeedX = (touch.pageY - mouseY) * dragRotationMultiplier;
    dragSpeedY = (touch.pageX - mouseX) * dragRotationMultiplier;
    mouseX = touch.pageX;
    mouseY = touch.pageY;
  } else if (event.type === "touchend") {
    mouseDown = false;
  }
}

// Update this please

function refreshCube() {
  if (cube) {
    // Save the current rotation of the reallt cool cube - so when the custom text changes, it doesn't reset.

    const currentRotation = {
      x: cube.rotation.x,
      y: cube.rotation.y,
      z: cube.rotation.z,
    };

    // Remove the old cube and create a new one, because it's fun and trending to be new

    scene.remove(cube);
    createCube();

    // Apply the saved rotation to the new cool cube

    cube.rotation.x = currentRotation.x;
    cube.rotation.y = currentRotation.y;
    cube.rotation.z = currentRotation.z;
  } else {
    // If for some reason the cube doesn't exist, just create a new one and shout at it. ARRRR!

    createCube();
  }
}

// Window resize handler

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Mouse event handler. Squeak squeak

function handleMouseEvents(event) {
  if (event.type === "mousedown" && event.target === renderer.domElement) {
    mouseDown = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
  } else if (event.type === "mousemove" && mouseDown) {
    event.preventDefault();
    dragSpeedX = (event.clientY - mouseY) * dragRotationMultiplier;
    dragSpeedY = (event.clientX - mouseX) * dragRotationMultiplier;
    mouseX = event.clientX;
    mouseY = event.clientY;
  } else if (event.type === "mouseup") {
    mouseDown = false;
  }
}

// Animation loop the loop

function animate() {
  requestAnimationFrame(animate);

  // Define maximum rotation speed

  const maxSpeed = maxRotationSpeed;

  let newRotationX = cube.rotation.x + constantRotationSpeedX + dragSpeedX;
  let newRotationY = cube.rotation.y + constantRotationSpeedY + dragSpeedY;

  cube.rotation.x +=
    Math.abs(newRotationX - cube.rotation.x) > maxSpeed
      ? maxSpeed * Math.sign(newRotationX - cube.rotation.x)
      : constantRotationSpeedX + dragSpeedX;
  cube.rotation.y +=
    Math.abs(newRotationY - cube.rotation.y) > maxSpeed
      ? maxSpeed * Math.sign(newRotationY - cube.rotation.y)
      : constantRotationSpeedY + dragSpeedY;

  // Apply drag fall-off, but don't fall off your chair

  dragSpeedX *= dragFallOff;
  dragSpeedY *= dragFallOff;

  renderer.render(scene, camera);

  // I put this in so I could find the correct values for the value button positions

  console.log(
    `Rotation - X: ${cube.rotation.x}, Y: ${cube.rotation.y}, Z: ${cube.rotation.z}`
  );
}

// Function for rotating the cube to a specific face

function rotateCube(targetRotationY, targetRotationX) {
  cube.rotation.y = targetRotationY;
  cube.rotation.x = targetRotationX;

  // Zoom to position speed. Weeeeee!

  dragSpeedX = 0.02;
  dragSpeedY = 0.04;
}

// Event listener for each ARRR button element

document
  .getElementById("customText")
  .addEventListener("click", () => rotateCube(29, -0.7));
document
  .getElementById("ARRRpriceDollar")
  .addEventListener("click", () => rotateCube(13.1, -0.8));
document
  .getElementById("ARRRpriceBTC")
  .addEventListener("click", () => rotateCube(11.5, 0.5));
document
  .getElementById("ARRR24High")
  .addEventListener("click", () => rotateCube(30.3, -1.2));
document
  .getElementById("ARRR24low")
  .addEventListener("click", () => rotateCube(27.3, -1.0));
document
  .getElementById("ARRR24Vol")
  .addEventListener("click", () => rotateCube(5.1, -2.7));

window.onload = init;

// But wait, there's more
// Maybe not... The end
