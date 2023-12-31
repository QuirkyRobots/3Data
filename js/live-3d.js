import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

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

// const wireframeAmount = 20;
const cubeMaterialTransparent = true;
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
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.getElementById("container").appendChild(renderer.domElement);
  camera.position.z = cameraPosition;
  createTextCanvas();
  createCube();
  setupLights();
  addEventListeners();
  animate();
  handleWindowResize();
}

// Text canvas creation for cube faces, not your faces

function createTextCanvas() {
  textCanvas = document.createElement("canvas");
}

// Cube face texture creation. Yay!

function createCubeFaceTexture(title, data, textColor, faceColor) {
  const faceCanvas = document.createElement("canvas");
  const faceContext = faceCanvas.getContext("2d");

  faceCanvas.width = 256;
  faceCanvas.height = 256;

  faceContext.textAlign = "center";
  faceContext.textBaseline = "middle";
  faceContext.textwrap = "true";

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
  const envMap = textureLoader.load("img/pc-reflection-2.jpg");
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  return envMap;
}

// Cube creation, like a god

function createCube() {
  const wireframeDetail = document.getElementById("vNumber").value;
  const geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2, wireframeDetail, wireframeDetail, wireframeDetail);
  const envMap = createEnvironmentMap();
  const opacityValue = document.getElementById("opacitySlider").value / 100;
  const wireframeValue = document.getElementById("wfCheckbox").checked;
  const materials = cubeMaterialsConfig.map((config, index) => {
    
    // Data pirated from local storage

    const arrrData = JSON.parse(localStorage.getItem("arrrData")) || {};
    let title, data;

    const dataMappings = {
      0: ["", document.getElementById("textInput").value || "ARRR"],
      1: ["Value USD", `$${(parseFloat(arrrData.priceUSD) || 0).toLocaleString()}`],
      2: ["Value BTC", arrrData.priceBTC || "Loading..."],
      3: ["24 Hour Vol", `$${(parseFloat(arrrData.volume24h) || 0).toLocaleString()}`],
      4: ["24 Hour High", `$${(parseFloat(arrrData.high24h) || 0).toLocaleString()}`],
      5: ["24 Hour Low", `$${(parseFloat(arrrData.low24h) || 0).toLocaleString()}`],
    };

    if (dataMappings.hasOwnProperty(index)) {
      [title, data] = dataMappings[index];
    } else {
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

      opacity: opacityValue,
      wireframe: wireframeValue,
      vNumber: wireframeDetail,
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
  pointLight = new THREE.PointLight(pirateLightColour, pointLightIntensity, pointLightDistance, pointLightDecay);
  pointLight.position.set(pointLightPosition.x, pointLightPosition.y, pointLightPosition.z);
  scene.add(pointLight);
  ambientLight = new THREE.AmbientLight(pirateLightColour, ambientLightIntensity);
  scene.add(ambientLight);
}

// Event listener setup

function addEventListeners() {
  const addEventListenerToElement = (element, eventTypes, listener, options) => {
    eventTypes.forEach((eventType) => {
      element.addEventListener(eventType, listener, options);
    });
  };

  addEventListenerToElement(renderer.domElement, ["mousemove", "mousedown", "mouseup"], handleMouseEvents);
  addEventListenerToElement(window, ["resize"], handleWindowResize);

  ["cubeColourPicker", "textColourPicker", "textInput", "wfCheckbox", "vNumber", "opacitySlider"].forEach((id) => {
    addEventListenerToElement(document.getElementById(id), ["input"], refreshCube);
  });

  addEventListenerToElement(renderer.domElement, ["touchstart", "touchmove", "touchend"], handleTouchEvents, {
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

  console
    .log
    // `Rotation - X: ${cube.rotation.x}, Y: ${cube.rotation.y}, Z: ${cube.rotation.z}`
    ();
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

const cubeRotationMappings = {
  customText: [29, -0.7],
  ARRRpriceDollar: [13.1, -0.8],
  ARRRpriceBTC: [11.5, 0.5],
  ARRR24High: [30.3, -1.2],
  ARRR24low: [27.3, -1.0],
  ARRR24Vol: [5.1, -2.7],
};

Object.entries(cubeRotationMappings).forEach(([id, params]) => {
  document.getElementById(id).addEventListener("click", () => rotateCube(...params));
});

window.onload = init;

// But wait, there's more
// Maybe not... The end
