// Constants

const UI_CONFIG = {
  fadeInDelay: 1000,
  fadeInDuration: "1s",
  volumeLevel: 0.3,
  scaleChangeMultiplier: 0.003,
  minScale: 0.5,
  maxScale: 1.1,
};

// Set default theme
// New themes coming soon

const THEME_PRESETS = {
  gold: {
    textColor: "#050505",
    cubeColor: "#c65f0c",
    opacity: 93,
  },
  black: {
    textColor: "#b34700",
    cubeColor: "#020203",
    opacity: 93,
  },
};

document.addEventListener("DOMContentLoaded", function () {
  try {
    initializeUI();
  } catch (error) {
    console.error("Failed to initialize UI:", error);
  }
});

function initializeUI() {
  fadeInPage();
  setupPlayPauseToggle();
  setupURLManagement();
  setupThemeControls();
  setupClipboardCopy();
  setupPanelDragging();
  setupBackgroundObserver();
  setupSoundEffects();
  setupKeyboardShortcuts();
}

// Fade the page in and be super cool.

function fadeInPage() {
  setTimeout(function () {
    const bodyElement = document.body;
    bodyElement.style.transition = `opacity ${UI_CONFIG.fadeInDuration}`;
    bodyElement.style.opacity = 1;
  }, UI_CONFIG.fadeInDelay);
}

// Toggle play/pause

function setupPlayPauseToggle() {
  const toggleButton = document.getElementById("togglePlayPause");
  if (!toggleButton) return;

  toggleButton.addEventListener("click", function () {
    this.textContent = this.textContent === "||" ? "â–¶" : "||";
  });
}

// and and remove the weed, I mean hash, because the URL doesn't like it

function updateURLParam(param, value) {
  try {
    const url = new URL(window.location);
    url.searchParams.set(param, value.replace("#", ""));
    window.history.pushState({}, "", url);
  } catch (error) {
    console.error("Error updating URL parameter:", error);
  }
}

function setupURLManagement() {
  updatePageFromURL();
  setupURLUpdateListeners();
  setupGetStatsButton();
}

// Read the URL and assign the values. Super fancy

function updatePageFromURL() {
  try {
    const urlParams = new URLSearchParams(window.location.search);

    updateFromURLParam(urlParams, "bg", "backgroundColourPicker", (value) => {
      document.body.style.backgroundImage = `radial-gradient(#${value}, transparent)`;
      setElementText("selectedBackgroundColour", "#" + value);
    });

    updateFromURLParam(urlParams, "block", "cubeColourPicker", (value) => {
      setElementText("selectedCubeColour", "#" + value);
    });

    updateFromURLParam(urlParams, "txt", "textColourPicker", (value) => {
      setElementText("selectedTextColour", "#" + value);
    });

    updateFromURLParam(urlParams, "msg", "textInput");
    updateFromURLParam(urlParams, "o", "opacitySlider");
    updateFromURLParam(urlParams, "coin", "coin");
  } catch (error) {
    console.error("Error updating page from URL:", error);
  }
}

function updateFromURLParam(urlParams, param, elementId, callback) {
  const value = urlParams.get(param);
  if (!value) return;

  const element = document.getElementById(elementId);
  if (!element) return;

  element.value =
    param === "bg" || param === "block" || param === "txt"
      ? "#" + value
      : value;

  if (callback) {
    callback(value);
  }
}

function setElementText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerText = text;
  }
}

// Plonk the values in the URL

function setupURLUpdateListeners() {
  document.addEventListener("input", (event) => {
    const elementId = event.target.id;
    const value = event.target.value;

    const urlUpdateHandlers = {
      backgroundColourPicker: () => {
        setElementText("selectedBackgroundColour", value);
        document.body.style.backgroundImage = `radial-gradient(${value}, transparent)`;
        updateURLParam("bg", value);
      },
      cubeColourPicker: () => {
        setElementText("selectedCubeColour", value);
        updateURLParam("block", value);
      },
      textColourPicker: () => {
        setElementText("selectedTextColour", value);
        updateURLParam("txt", value);
      },
      textInput: () => updateURLParam("msg", value),
      opacitySlider: () => updateURLParam("o", value),
    };

    const handler = urlUpdateHandlers[elementId];
    if (handler) {
      handler();
    }
  });
}

function setupGetStatsButton() {
  const getStatsButton = document.getElementById("getStats");
  if (!getStatsButton) return;

  getStatsButton.addEventListener("click", async () => {
    try {
      const currentCoin = document.getElementById("coin")?.value;
      if (!currentCoin) return;

      const exchangeRate = await window.getExchangeRate(currentCoin);
      console.log(`Exchange Rate for ${currentCoin}: ${exchangeRate}`);

      updateURLParam("coin", currentCoin);

      if (window.coinSymbol) {
        await window.getExchangeRate(window.coinSymbol);
        console.log(`Button Press - Coin Symbol: ${window.coinSymbol}`);

        updateURLParam("msg", window.coinSymbol);
        const textInput = document.getElementById("textInput");
        if (textInput) {
          textInput.value = window.coinSymbol;
        }
      }
    } catch (error) {
      console.error("Error occurred:", error);
    }
  });
}

// Theme controls - you

function setupThemeControls() {
  setupVideoTheme();
  setupThemeButtons();
  setupThemeSwitch();
}

// Event listeners for theme buttons. They might be having a rave

// Preload music

const riseAboveAudio = new Audio("audio/music/rise-above.mp3");
riseAboveAudio.volume = UI_CONFIG.volumeLevel;
riseAboveAudio.loop = true;
riseAboveAudio.preload = "auto";
riseAboveAudio.load();

function setupVideoTheme() {
  const videoThemeButton = document.getElementById("videoTheme");
  if (!videoThemeButton) return;

  videoThemeButton.addEventListener("click", () => {
    const videoElement = document.getElementById("video");
    const picker = document.querySelector(".pc-colour-picker.canvas");

    if (!videoElement) return;

    const isVisible = videoElement.style.display === "block";
    videoElement.style.display = isVisible ? "none" : "block";

    const toggleMusicMute = document.getElementById("toggleMusicMute");
    if (toggleMusicMute) {
      const isVisible2 = toggleMusicMute.style.display === "block";
      toggleMusicMute.style.display = isVisible2 ? "none" : "block";
    }

    if (picker) {
      picker.style.pointerEvents = isVisible ? "auto" : "none";
      picker.style.filter = isVisible ? "none" : "opacity(0.5) brightness(0.9)";
    }

    // Toggle music button - sounds like a jumper

    if (riseAboveAudio.paused) {
      riseAboveAudio.play().catch((err) => console.error(err));
    } else {
      riseAboveAudio.pause();
    }
  });
}

// Mute the music, be a mutant

function setupMusicMuteToggle() {
  const toggleMusicMute = document.getElementById("toggleMusicMute");
  if (!toggleMusicMute) return;

  toggleMusicMute.addEventListener("click", (e) => {
    e.stopPropagation();

    riseAboveAudio.muted = !riseAboveAudio.muted;

    if (riseAboveAudio.muted) {
      toggleMusicMute.style.color = "#4d505a";
    } else {
      toggleMusicMute.style.color = "";
    }
  });
}

setupMusicMuteToggle();
function setupThemeButtons() {
  const goldButton = document.getElementById("goldTheme");
  const blackButton = document.getElementById("blackTheme");
  const videoButton = document.getElementById("videoTheme");

  if (goldButton) {
    goldButton.addEventListener("click", () => updateTheme("gold"));
  }

  if (blackButton) {
    blackButton.addEventListener("click", () => updateTheme("black"));
  }

  if (videoButton) {
    videoButton.addEventListener("click", () => updateTheme("black"));
  }
}

function updateTheme(theme) {
  try {
    const preset = THEME_PRESETS[theme];
    if (!preset) return;

    updateElement("textColourPicker", preset.textColor);
    updateElement("cubeColourPicker", preset.cubeColor);
    updateElement("opacitySlider", preset.opacity);
    setElementText("selectedTextColour", preset.textColor);
    setElementText("selectedCubeColour", preset.cubeColor);

    document.body.style.backgroundColor = "";
    document.body.style.backgroundImage = "";

    // Clean the URL. It's dirty

    clearThemeParams();
  } catch (error) {
    console.error("Error updating theme:", error);
  }
}

function updateElement(id, value, propName = "value") {
  const element = document.getElementById(id);
  if (!element) return;

  element[propName] = value;
  element.dispatchEvent(new Event("input"));
}



// Only remove the theme parts of the URL. They are not wated around here. Go away.

function clearThemeParams() {
  const url = new URL(window.location);
  url.searchParams.delete('bg');
  url.searchParams.delete('block');
  url.searchParams.delete('txt');
  url.searchParams.delete('o');
  window.history.pushState({}, "", url);
}

function setupThemeSwitch() {
  const themeSwitch = document.getElementById("themeSwitch");
  if (!themeSwitch) return;

  // Untick theme switch on load, because Firefox is a pain.

  themeSwitch.checked = false;

  themeSwitch.addEventListener("change", function () {
    const themeControls = document.querySelector(".theme-controls");
    const piratePanel = document.querySelector(".pirate-panel");

    if (themeControls) {
      themeControls.classList.toggle("show", this.checked);
    }

    if (piratePanel) {
      piratePanel.style.overflowY = this.checked ? "auto" : "hidden";
    }
  });
}

// Copy URL to clipboard

function setupClipboardCopy() {
  const copyButton = document.getElementById("copy");
  if (!copyButton) return;

  copyButton.addEventListener("click", () => {
    const url = window.location.href;

    navigator.clipboard
      .writeText(url)
      .then(() => {
        console.log("URL copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err);
      });
  });
}

// Controls on and off with fancy fx

function setupPanelDragging() {
  const piratePanelWrapper = document.getElementById("piratePanelWrapper");
  const piratePanel = document.getElementById("piratePanel");
  const resizer = document.getElementById("resizer");

  if (!piratePanelWrapper || !piratePanel || !resizer) return;

  let startMouseX,
    startMouseY,
    currentScale = 1;
  let posX = piratePanelWrapper.offsetLeft;
  let posY = piratePanelWrapper.offsetTop;
  let isDragging = false,
    isScaling = false;

  const onMouseMove = (e) => {
    if (isScaling) {
      const scaleChange =
        (startMouseX - e.clientX) * UI_CONFIG.scaleChangeMultiplier;
      const newScale = Math.min(
        Math.max(currentScale - scaleChange, UI_CONFIG.minScale),
        UI_CONFIG.maxScale
      );
      piratePanelWrapper.style.transform = `scale(${newScale})`;
    } else if (isDragging) {
      posX += e.clientX - startMouseX;
      posY += e.clientY - startMouseY;
      piratePanelWrapper.style.left = `${posX}px`;
      piratePanelWrapper.style.top = `${posY}px`;
      startMouseX = e.clientX;
      startMouseY = e.clientY;
    }
  };

  const cleanUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", cleanUp);
    document.removeEventListener("mouseleave", cleanUp);
    piratePanelWrapper.classList.remove("scale-active");
    piratePanel.classList.remove("drag-active");
    piratePanel.classList.add("drag-inactive");
    isDragging = false;
    isScaling = false;
  };

  const hasNoDragParent = (element) => {
    while (element && element !== document) {
      if (element.classList.contains("no-drag")) {
        return true;
      }
      element = element.parentNode;
    }
    return false;
  };

  piratePanelWrapper.addEventListener("mousedown", (e) => {
    if (hasNoDragParent(e.target)) {
      return;
    }

    startMouseX = e.clientX;
    startMouseY = e.clientY;

    if (e.target === resizer) {
      isScaling = true;
      const transform = getComputedStyle(piratePanelWrapper).transform;
      currentScale =
        transform !== "none" ? parseFloat(transform.split("(")[1]) : 1;
      piratePanelWrapper.classList.add("scale-active");
    } else {
      isDragging = true;
      posX = piratePanelWrapper.offsetLeft;
      posY = piratePanelWrapper.offsetTop;
      piratePanel.classList.add("drag-active");
      piratePanel.classList.remove("drag-inactive");
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", cleanUp, { once: true });
    document.addEventListener("mouseleave", cleanUp, { once: true });
  });
}

// Checks to see if the body tag has had a bg theme applied, if it has, it's the end of pixels as we know them.

function setupBackgroundObserver() {
  const body = document.body;

  const observer = new MutationObserver(() => {
    const hasBackground = body.style.background || body.style.backgroundImage;
    body.classList.toggle("hasStyle", !!hasBackground);
  });

  observer.observe(body, { attributes: true });
  body.classList.toggle(
    "hasStyle",
    !!(body.style.background || body.style.backgroundImage)
  );
}

// Play sounds

function setupSoundEffects() {
  const playSound = (soundFile) => {
    try {
      const sound = new Audio(`audio/${soundFile}.mp3`);
      sound.volume = UI_CONFIG.volumeLevel;
      sound.play().catch((err) => console.error("Error playing sound:", err));
    } catch (error) {
      console.error("Error loading sound:", error);
    }
  };

  const addEventListeners = (selector, soundFile, events) => {
    const elements = document.querySelectorAll(selector);

    elements.forEach((element) => {
      events.forEach((event) => {
        element.addEventListener(event, () => playSound(soundFile));

        if (event === "click") {
          const checkbox = element.querySelector('input[type="checkbox"]');
          if (checkbox) {
            checkbox.addEventListener("change", () => playSound(soundFile));
          }
        }
      });
    });
  };

  addEventListeners(".s2", "s2", ["click"]);
  addEventListeners(".s3", "s3", ["click"]);
  addEventListeners(".s4", "s4", ["mousedown"]);
  addEventListeners(".s6", "s6", ["mousedown"]);
  addEventListeners(".s7", "s7", ["mousedown"]);
}

// Toggle the style "display: none;" for elements with class .show-hide

function setupKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    if (event.key === "S" && event.shiftKey) {
      const elements = document.querySelectorAll(".show-hide");

      elements.forEach((element) => {
        element.style.display = element.style.display === "none" ? "" : "none";
      });
    }
  });
}