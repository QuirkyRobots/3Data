import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { RoundedBoxGeometry } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/geometries/RoundedBoxGeometry.js";

// Configuration variables

// Spin things

const CONFIG = {
  rotation: {
    enabled: true,
    initial: Math.PI,
    constantSpeedX: 0.004,
    constantSpeedY: 0.004,
    dragMultiplier: 0.007,
    dragFallOff: 0.95,
    maxSpeed: 0.2,
  },

  // The cameraman stands here

  camera: {
    position: 2.5,
    fov: 75,
    near: 0.1,
    far: 1000,
  },

  // Various scene colours

  colors: {
    classicGold: "#BB9645",
    gold: "#ff7300",
    dark: "#090909",
    blue: "#24243a",
    lightColor: "#555",
  },

  // Light configuration. It's heavy work

  lighting: {
    point: {
      intensity: 600,
      distance: 30000,
      decay: 1,
      position: { x: 2, y: 4, z: 5 },
    },
    ambient: {
      intensity: 0,
    },
  },

  // Material configuration

  material: {
    transparent: true,
    emissiveIntensity: 0,
    emissiveColor: "#ffffff",
    reflectivity: 1,
    roughness: 0.03,
    metalness: 0.7,
    envMapIntensity: 0.14,
  },

  // Canvas dimensions for texture rendering

  canvas: {
    width: 512,
    height: 512,
  },
  // faceDefaults

  faceDefaults: {
    padding: 40,
    titleSize: 7.5,
    dataSize: 11,
    titleSpacing: 30,
    blockOffset: 0,
    dataWeight: "bold",
  },

  // Table layout constants

  table: {
    columnGap: 15,
    lineSpacing: 10,
  },
};

// Global title styling (applies to all cube faces)

const globalTitleStyle = {
  weight: "bold",
};

// Face styling configuration - customize per cube side

const faceStyles = {
  0: {
    textAlign: "center",
    titleSize: CONFIG.faceDefaults.titleSize,
    dataSize: CONFIG.faceDefaults.dataSize,
    padding: CONFIG.faceDefaults.padding,
    titleSpacing: CONFIG.faceDefaults.titleSpacing,
    blockOffset: CONFIG.faceDefaults.blockOffset,
    dataWeight: CONFIG.faceDefaults.dataWeight,
  },
  1: {
    textAlign: "center",
    titleSize: CONFIG.faceDefaults.titleSize,
    dataSize: CONFIG.faceDefaults.dataSize,
    padding: CONFIG.faceDefaults.padding,
    titleSpacing: CONFIG.faceDefaults.titleSpacing,
    blockOffset: CONFIG.faceDefaults.blockOffset,
    dataWeight: CONFIG.faceDefaults.dataWeight,
  },
  2: {
    textAlign: "center",
    titleSize: CONFIG.faceDefaults.titleSize,
    dataSize: CONFIG.faceDefaults.dataSize,
    padding: CONFIG.faceDefaults.padding,
    titleSpacing: CONFIG.faceDefaults.titleSpacing,
    blockOffset: CONFIG.faceDefaults.blockOffset,
    dataWeight: CONFIG.faceDefaults.dataWeight,
  },
  3: {
    textAlign: "center",
    titleSize: CONFIG.faceDefaults.titleSize,
    dataSize: CONFIG.faceDefaults.dataSize,
    padding: CONFIG.faceDefaults.padding,
    titleSpacing: CONFIG.faceDefaults.titleSpacing,
    blockOffset: CONFIG.faceDefaults.blockOffset,
    dataWeight: CONFIG.faceDefaults.dataWeight,
  },
  4: {
    textAlign: "left",
    titleSize: CONFIG.faceDefaults.titleSize,
    dataSize: 14,
    padding: CONFIG.faceDefaults.padding,
    titleSpacing: 50,
    blockOffset: CONFIG.faceDefaults.blockOffset,
    dataWeight: CONFIG.faceDefaults.dataWeight,
  },
  5: {
    textAlign: "center",
    titleSize: CONFIG.faceDefaults.titleSize,
    dataSize: CONFIG.faceDefaults.dataSize,
    padding: CONFIG.faceDefaults.padding,
    titleSpacing: CONFIG.faceDefaults.titleSpacing,
    blockOffset: CONFIG.faceDefaults.blockOffset,
    dataWeight: CONFIG.faceDefaults.dataWeight,
  },
};

// Scene setup variables

let scene, camera, renderer, cube;
let mouseDown = false,
  mouseX = 0,
  mouseY = 0;
let dragSpeedX = 0,
  dragSpeedY = 0;
let ambientLight, pointLight;

// Cube rotation mappings for navigation buttons

const CUBE_ROTATION_MAPPINGS = {
  customText: [29, -0.7],
  CoinPriceDollar: [13.1, -0.8],
  CoinPriceBTC: [11.5, 0.5],
  Coin24High: [30.3, -1.2],
  Coin24Low: [27.3, -1.0],
  Coin24Vol: [5.1, -2.7],
};

// Initialisation function

function init() {
  try {
    setupScene();
    setupCamera();
    setupRenderer();

    createCube();
    setupLights();
    addEventListeners();

    animate();
    handleWindowResize();
  } catch (error) {
    console.error("Failed to initialize 3D scene:", error);
  }
}

function setupScene() {
  scene = new THREE.Scene();
}

function setupCamera() {
  camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fov,
    window.innerWidth / window.innerHeight,
    CONFIG.camera.near,
    CONFIG.camera.far
  );
  camera.position.z = CONFIG.camera.position;
}

function setupRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const container = document.getElementById("container");
  if (container) {
    container.appendChild(renderer.domElement);
  } else {
    throw new Error("Container element not found");
  }
}

// Lighting setup. A bright idea.

function setupLights() {
  const pointConfig = CONFIG.lighting.point;

  pointLight = new THREE.PointLight(
    CONFIG.colors.lightColor,
    pointConfig.intensity,
    pointConfig.distance,
    pointConfig.decay
  );
  pointLight.position.set(
    pointConfig.position.x,
    pointConfig.position.y,
    pointConfig.position.z
  );
  scene.add(pointLight);

  ambientLight = new THREE.AmbientLight(
    CONFIG.colors.lightColor,
    CONFIG.lighting.ambient.intensity
  );
  scene.add(ambientLight);
}

// Formatting functions

function formatCurrency(value) {
  const number = parseFloat(value);
  return isNaN(number) ? "No data" : `$${number.toLocaleString()}`;
}

function formatPercent(value) {
  const n = parseFloat(value);
  return isNaN(n) ? "No data" : `${n.toFixed(2)}%`;
}

function getFaceData(faceIndex, coinData) {
  const textInput = document.getElementById("textInput");

  const dataMappings = {
    0: ["", textInput ? textInput.value || "BTC" : "BTC"],
    1: ["Value USD", formatCurrency(coinData.priceUSD)],
    2: ["Value BTC", coinData.priceBTC || "No Data"],
    3: ["24 Hour Vol", formatCurrency(coinData.volume24h)],
    4: [
      "Highs",
      [
        `24h: ${formatCurrency(coinData.high24h)}`,
        `7d: ${formatPercent(coinData.price_change_percentage_7d)}`,
        `30d: ${formatPercent(coinData.price_change_percentage_30d)}`,
        `1y: ${formatPercent(coinData.price_change_percentage_1y)}`,
        `ATH: ${formatPercent(coinData.ath_change_percentage)}`,
      ],
    ],
    5: ["24 Hour Low", formatCurrency(coinData.low24h)],
  };

  if (dataMappings.hasOwnProperty(faceIndex)) {
    const [title, data] = dataMappings[faceIndex];
    return { title, data };
  }

  return { title: "Side", data: (faceIndex + 1).toString() };
}

// Cube creation functions

// User-friendly control mapping (adjust only these values)

const ROUNDED_BOX_UI = {
  defaultSmoothness: 4, // 0 - 10 Bug... Higher numbers create leak lines on edges.
  radiusMinFactor: 0.005, 
  radiusMaxFactor: 0.50, // How round - max is a ball
  segMin: 0, // minimum segments
  segMax: 128, // maximum segments for smoothest
};

function getUserLevel(id, fallback = 0) {
  const el = document.getElementById(id);
  const v = el ? Number(el.value) : fallback;
  if (isNaN(v)) return fallback;
  return Math.min(10, Math.max(0, v));
}

function createCubeGeometry(size, detail) {
  const roundLevel = getUserLevel("rNumber", 0);
  const smoothLevel = getUserLevel(
    "smoothnessLevel",
    ROUNDED_BOX_UI.defaultSmoothness
  );

  const radius =
    roundLevel === 0
      ? size * 0.00001
      : size *
        (ROUNDED_BOX_UI.radiusMinFactor +
          (ROUNDED_BOX_UI.radiusMaxFactor - ROUNDED_BOX_UI.radiusMinFactor) *
            (roundLevel / 10));

  const segments = Math.max(
    ROUNDED_BOX_UI.segMin,
    Math.round(
      ROUNDED_BOX_UI.segMin +
        (ROUNDED_BOX_UI.segMax - ROUNDED_BOX_UI.segMin) * (smoothLevel / 10)
    )
  );

  const geo = new RoundedBoxGeometry(size, size, size, segments, radius);
  geo.computeVertexNormals();
  return geo;
}

// Function to load a HDRI image and create an environment map non GPS

function createEnvironmentMap() {
  const textureLoader = new THREE.TextureLoader();
  const envMap = textureLoader.load("img/pc-reflection-2.jpg");
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  return envMap;
}

// Shoving these material settings on to the 3D object

function createMaterialConfig() {
  return {
    transparent: CONFIG.material.transparent,
    emissive: CONFIG.material.emissiveColor,
    emissiveIntensity: CONFIG.material.emissiveIntensity,
    reflectivity: CONFIG.material.reflectivity,
    roughness: CONFIG.material.roughness,
    metalness: CONFIG.material.metalness,
    envMapIntensity: CONFIG.material.envMapIntensity,
  };
}

function createCubeMaterials(coinData, envMap, opacity, wireframe) {
  const materialConfig = createMaterialConfig();
  const textColorPicker = document.getElementById("textColourPicker");
  const cubeColorPicker = document.getElementById("cubeColourPicker");

  const textColor = textColorPicker
    ? textColorPicker.value
    : CONFIG.colors.dark;
  const faceColor = cubeColorPicker
    ? cubeColorPicker.value
    : CONFIG.colors.gold;

  return Array.from({ length: 6 }, (_, index) => {
    const { title, data } = getFaceData(index, coinData);
    const texture = createCubeFaceTexture(
      title,
      data,
      textColor,
      faceColor,
      index
    );

    return new THREE.MeshPhysicalMaterial({
      map: texture,
      envMap: envMap,
      opacity: opacity,
      wireframe: wireframe,
      transparent: materialConfig.transparent,
      reflectivity: materialConfig.reflectivity,
      emissive: materialConfig.emissive,
      emissiveIntensity: materialConfig.emissiveIntensity,
      roughness: materialConfig.roughness,
      metalness: materialConfig.metalness,
      envMapIntensity: materialConfig.envMapIntensity,
    });
  });
}

// Cube creation, like a god

function createCube() {
  try {
    const coinData = getCoinData();
    const cubeSize = getCubeSize();
    const opacity = getOpacity();
    const geometry = createCubeGeometry(cubeSize);
    const envMap = createEnvironmentMap();
    const materials = createCubeMaterials(coinData, envMap, opacity, false);

    cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);
  } catch (error) {
    console.error("Error creating cube:", error);
  }
}

// Data pirated from local storage

function getCoinData() {
  try {
    return JSON.parse(localStorage.getItem("coinData") || "{}");
  } catch (error) {
    console.error("Error parsing coin data:", error);
    return {};
  }
}

function getCubeSize() {
  const slider = document.getElementById("sizeSlider");
  return slider ? slider.value / 100 : 1;
}

function getOpacity() {
  const slider = document.getElementById("opacitySlider");
  return slider ? slider.value / 100 : 1;
}

// Cube face texture creation. Yay!

function createCubeFaceTexture(title, data, textColor, faceColor, faceIndex) {
  const faceCanvas = document.createElement("canvas");
  const faceContext = faceCanvas.getContext("2d");

  faceCanvas.width = CONFIG.canvas.width;
  faceCanvas.height = CONFIG.canvas.height;

  const style = faceStyles[faceIndex] || faceStyles[0];

  faceContext.textAlign = style.textAlign;
  faceContext.textBaseline = "middle";

  faceContext.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
  faceContext.fillStyle = faceColor;
  faceContext.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

  const fontSizeLarge = CONFIG.canvas.width / style.titleSize;
  const fontSizeSmall = CONFIG.canvas.width / style.dataSize;

  const largeFont = `${globalTitleStyle.weight} ${fontSizeLarge}px Arial`;
  const smallFont = `${style.dataWeight || "bold"} ${fontSizeSmall}px Arial`;

  if (title) {
    renderTextWithTitle(
      faceContext,
      title,
      data,
      textColor,
      style,
      fontSizeLarge,
      fontSizeSmall,
      largeFont,
      smallFont
    );
  } else {
    renderTextWithoutTitle(
      faceContext,
      data,
      textColor,
      style,
      fontSizeSmall,
      largeFont,
      smallFont
    );
  }

  const texture = new THREE.CanvasTexture(faceCanvas);
  texture.center.set(0.5, 0.5);
  // texture.rotation = Math.PI;
  return texture;
}

function renderTextWithTitle(
  faceContext,
  title,
  data,
  textColor,
  style,
  fontSizeLarge,
  fontSizeSmall,
  largeFont,
  smallFont
) {
  faceContext.fillStyle = textColor;
  faceContext.font = largeFont;

  const lines = Array.isArray(data) ? data : [data];
  const lineHeight = fontSizeSmall + CONFIG.table.lineSpacing;
  const totalDataHeight = lines.length * lineHeight;
  const totalContentHeight =
    fontSizeLarge + style.titleSpacing + totalDataHeight;
  const contentStartY = (CONFIG.canvas.height - totalContentHeight) / 2;
  const titleWidth = faceContext.measureText(title).width;

  let titleX = calculateTitleX(
    faceContext,
    style,
    titleWidth,
    lines,
    smallFont
  );

  const titleY = contentStartY + fontSizeLarge / 2;
  faceContext.fillText(title, titleX, titleY);

  faceContext.font = smallFont;
  const dataStartY = titleY + fontSizeLarge / 2 + style.titleSpacing;

  if (style.textAlign === "left") {
    renderTableAlignedData(
      faceContext,
      lines,
      titleX,
      dataStartY,
      lineHeight,
      smallFont
    );
  } else {
    renderNormalAlignedData(faceContext, lines, titleX, dataStartY, lineHeight);
  }
}

// Calculate positioning for table-like layout with centered block

function calculateTitleX(faceContext, style, titleWidth, lines, smallFont) {
  if (style.textAlign === "left") {
    faceContext.font = smallFont;

    const splitLines = lines.map((line) => {
      const parts = line.split(":");
      return parts.length > 1
        ? { label: parts[0] + ":", value: parts.slice(1).join(":").trim() }
        : { label: "", value: line };
    });

    const labelWidths = splitLines.map(
      (l) => faceContext.measureText(l.label).width
    );
    const maxLabelWidth = Math.max(...labelWidths, 0);

    // Account for minus sign alignment in values

    const minusWidth = faceContext.measureText("-").width;
    const valueWidths = splitLines.map((l) => {
      const value = l.value;
      if (value.startsWith("-")) {
        return faceContext.measureText(value.substring(1)).width + minusWidth;
      }
      return faceContext.measureText(value).width + minusWidth;
    });

    const maxValueWidth = Math.max(...valueWidths, 0);
    const tableWidth = maxLabelWidth + maxValueWidth + CONFIG.table.columnGap;
    const contentWidth = Math.max(titleWidth, tableWidth);

    return (CONFIG.canvas.width - contentWidth) / 2 + (style.blockOffset || 0);
  } else if (style.textAlign === "right") {
    return CONFIG.canvas.width - style.padding;
  }

  return CONFIG.canvas.width / 2;
}

// Render table-aligned data where labels and values line up like a spreadsheet

function renderTableAlignedData(
  faceContext,
  lines,
  titleX,
  dataStartY,
  lineHeight,
  smallFont
) {
  faceContext.font = smallFont;

  const splitLines = lines.map((line) => {
    const parts = line.split(":");
    return parts.length > 1
      ? { label: parts[0] + ":", value: parts.slice(1).join(":").trim() }
      : { label: "", value: line };
  });

  const labelWidths = splitLines.map(
    (l) => faceContext.measureText(l.label).width
  );
  const maxLabelWidth = Math.max(...labelWidths, 0);
  const minusWidth = faceContext.measureText("-").width;

  lines.forEach((line, i) => {
    const split = splitLines[i];
    const y = dataStartY + i * lineHeight;

    if (split.label) {
      faceContext.fillText(split.label, titleX, y);

      const valueStartX = titleX + maxLabelWidth + CONFIG.table.columnGap;
      const value = split.value;

      // Align minus signs separately so numbers line up

      if (value.startsWith("-")) {
        faceContext.fillText("-", valueStartX, y);
        faceContext.fillText(value.substring(1), valueStartX + minusWidth, y);
      } else {
        faceContext.fillText(value, valueStartX + minusWidth, y);
      }
    } else {
      faceContext.fillText(split.value, titleX, y);
    }
  });
}

function renderNormalAlignedData(
  faceContext,
  lines,
  titleX,
  dataStartY,
  lineHeight
) {
  lines.forEach((line, i) => {
    faceContext.fillText(line, titleX, dataStartY + i * lineHeight);
  });
}

function renderTextWithoutTitle(
  faceContext,
  data,
  textColor,
  style,
  fontSizeSmall,
  largeFont,
  smallFont
) {
  faceContext.fillStyle = textColor;

  const lines = Array.isArray(data) ? data : [data];
  faceContext.font = lines.length > 1 ? smallFont : largeFont;
  const fontSize =
    lines.length > 1 ? fontSizeSmall : CONFIG.canvas.width / style.titleSize;
  const lineHeight = fontSize + 8;

  let cx;
  if (style.textAlign === "left") {
    const widths = lines.map((line) => faceContext.measureText(line).width);
    const maxWidth = Math.max(...widths);
    cx = (CONFIG.canvas.width - maxWidth) / 2 + (style.blockOffset || 0);
  } else if (style.textAlign === "right") {
    cx = CONFIG.canvas.width - style.padding;
  } else {
    cx = CONFIG.canvas.width / 2;
  }

  const cy = CONFIG.canvas.height / 2;
  const startY = cy - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, i) => {
    faceContext.fillText(line, cx, startY + i * lineHeight);
  });
}

// Update these please

function refreshCube() {
  if (!cube) {
    createCube();
    return;
  }

  try {
    // Save the current rotation of the really cool cube - so when the custom text changes, it doesn't reset.

    const currentRotation = {
      x: cube.rotation.x,
      y: cube.rotation.y,
      z: cube.rotation.z,
    };

    // Remove the old cube and create a new one, because it's fun and trending to be new

    scene.remove(cube);
    createCube();

    // Apply the saved rotation to the new cool cube

    if (cube) {
      cube.rotation.x = currentRotation.x;
      cube.rotation.y = currentRotation.y;
      cube.rotation.z = currentRotation.z;
    }
  } catch (error) {
    console.error("Error refreshing cube:", error);
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
    dragSpeedX = (event.clientY - mouseY) * CONFIG.rotation.dragMultiplier;
    dragSpeedY = (event.clientX - mouseX) * CONFIG.rotation.dragMultiplier;
    mouseX = event.clientX;
    mouseY = event.clientY;
  } else if (event.type === "mouseup") {
    mouseDown = false;
  }
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
    dragSpeedX = (touch.pageY - mouseY) * CONFIG.rotation.dragMultiplier;
    dragSpeedY = (touch.pageX - mouseX) * CONFIG.rotation.dragMultiplier;
    mouseX = touch.pageX;
    mouseY = touch.pageY;
  } else if (event.type === "touchend") {
    mouseDown = false;
  }
}

// Event listener setup

function addEventListeners() {
  const addListenerToElement = (element, eventTypes, listener, options) => {
    eventTypes.forEach((eventType) => {
      element.addEventListener(eventType, listener, options);
    });
  };

  addListenerToElement(
    renderer.domElement,
    ["mousemove", "mousedown", "mouseup"],
    handleMouseEvents
  );
  addListenerToElement(window, ["resize"], handleWindowResize);

  [
    "cubeColourPicker",
    "textColourPicker",
    "textInput",
    "opacitySlider",
    "sizeSlider",
    "rNumber",
  ].forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      addListenerToElement(element, ["input"], refreshCube);
    }
  });

  addListenerToElement(
    renderer.domElement,
    ["touchstart", "touchmove", "touchend"],
    handleTouchEvents,
    {
      passive: false,
    }
  );

  const toggleButton = document.getElementById("togglePlayPause");
  if (toggleButton) {
    toggleButton.addEventListener("click", function () {
      CONFIG.rotation.enabled = !CONFIG.rotation.enabled;
    });
  }

  // Listen for data update events instead of polling localStorage

  document.addEventListener("cryptoDataUpdated", (event) => {
    refreshCube();
  });

  setupRotationButtons();
}

// Event listener for each button element

function setupRotationButtons() {
  Object.entries(CUBE_ROTATION_MAPPINGS).forEach(([id, params]) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("click", () => rotateCube(...params));
    }
  });
}

// Function for rotating the cube to a specific face

function rotateCube(targetRotationY, targetRotationX) {
  if (!cube) return;

  cube.rotation.y = targetRotationY;
  cube.rotation.x = targetRotationX;

  // Zoom to position speed. Weeeeee!

  dragSpeedX = 0.02;
  dragSpeedY = 0.04;
}

// Animation loop the loop

function animate() {
  requestAnimationFrame(animate);

  if (!cube) return;

  let newRotationX = cube.rotation.x + dragSpeedX;
  let newRotationY = cube.rotation.y + dragSpeedY;

  if (CONFIG.rotation.enabled) {
    newRotationX += CONFIG.rotation.constantSpeedX;
    newRotationY += CONFIG.rotation.constantSpeedY;
  }

  // Apply calculated rotation with max speed limit

  const maxSpeed = CONFIG.rotation.maxSpeed;

  cube.rotation.x +=
    Math.abs(newRotationX - cube.rotation.x) > maxSpeed
      ? maxSpeed * Math.sign(newRotationX - cube.rotation.x)
      : newRotationX - cube.rotation.x;

  cube.rotation.y +=
    Math.abs(newRotationY - cube.rotation.y) > maxSpeed
      ? maxSpeed * Math.sign(newRotationY - cube.rotation.y)
      : newRotationY - cube.rotation.y;

  dragSpeedX *= CONFIG.rotation.dragFallOff;
  dragSpeedY *= CONFIG.rotation.dragFallOff;

  renderer.render(scene, camera);
}

window.onload = init;

// But wait, there's more
// Maybe not... The end