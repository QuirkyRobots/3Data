document.addEventListener("DOMContentLoaded", function () {

  // Fade the page in and be super cool.

  setTimeout(function () {
    var bodyElement = document.body;
    bodyElement.style.transition = "opacity 1s";
    bodyElement.style.opacity = 1;
  }, 1000);

  // and and remove the weed, I mean hash, because the URL doesn't like it

  const updateURLParam = (param, value) => {
    const url = new URL(window.location);
    url.searchParams.set(param, value.replace("#", ""));
    window.history.pushState({}, "", url);
  };

  // Read the URL and asign the values. Super fancy

  const updatePageFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search);

    const bgColour = urlParams.get("bg");
    if (bgColour) {
      const bgPicker = document.getElementById("backgroundColourPicker");
      bgPicker.value = "#" + bgColour;
      document.getElementById("selectedBackgroundColour").innerText = "#" + bgColour;
      document.body.style.backgroundImage = `radial-gradient(#${bgColour}, transparent)`;
    }

    const blockColour = urlParams.get("block");
    if (blockColour) {
      const blockPicker = document.getElementById("cubeColourPicker");
      blockPicker.value = "#" + blockColour;
      document.getElementById("selectedCubeColour").innerText = "#" + blockColour;
    }

    const txtColour = urlParams.get("txt");
    if (txtColour) {
      const textPicker = document.getElementById("textColourPicker");
      textPicker.value = "#" + txtColour;
      document.getElementById("selectedTextColour").innerText = "#" + txtColour;
    }

    const message = urlParams.get("msg");
    if (message) {
      const textInput = document.getElementById("textInput");
      textInput.value = message;
    }
    const blockOpacity = urlParams.get("o");
    if (blockOpacity) {
      const textInput = document.getElementById("opacitySlider");
      textInput.value = blockOpacity;
    }
    const coin = urlParams.get("coin");
    if (coin) {
      document.getElementById("coin").value = coin;
    }
  };

  // Plonk the values in the URL

  document.addEventListener("input", (event) => {
    const elementId = event.target.id;
    const value = event.target.value;

    if (elementId === "backgroundColourPicker") {
      document.getElementById("selectedBackgroundColour").innerText = value;
      document.body.style.backgroundImage = `radial-gradient(${value}, transparent)`;
      updateURLParam("bg", value);
    } else if (elementId === "cubeColourPicker") {
      document.getElementById("selectedCubeColour").innerText = value;
      updateURLParam("block", value);
    } else if (elementId === "textColourPicker") {
      document.getElementById("selectedTextColour").innerText = value;
      updateURLParam("txt", value);
    } else if (elementId === "textInput") {
      updateURLParam("msg", value);
    } else if (elementId === "opacitySlider") {
      updateURLParam("o", value);
    }
  });
  document.getElementById("getStats").addEventListener("click", async () => {
    currentCoin = document.getElementById("coin").value;

    // Call getExchangeRate and wait for it to complete

    await getExchangeRate(currentCoin);

    updateURLParam("coin", currentCoin);
    updateURLParam("msg", window.coinSymbol);
    textInput.value = window.coinSymbol;
  });

  // Set default theme
  // New themes coming soon

  const updateTheme = (theme) => {
    const textColour = theme === "gold" ? "#050505" : "#b34700";
    const cubeColour = theme === "gold" ? "#c65f0c" : "#020203";

    const updateElement = (id, value, propName = "value") => {
      const element = document.getElementById(id);
      element[propName] = value;
      element.dispatchEvent(new Event("input"));
    };

    updateElement("textColourPicker", textColour);
    updateElement("cubeColourPicker", cubeColour);
    updateElement("opacitySlider", 100);
    updateElement("wfCheckbox", false, "checked");

    document.getElementById("selectedTextColour").textContent = textColour;
    document.getElementById("selectedCubeColour").textContent = cubeColour;

    document.body.style.backgroundColor = "";
    document.body.style.backgroundImage = "";
    const vNumberElement = document.querySelector(".v-number");
    if (vNumberElement) vNumberElement.style.display = "none";

    // Clean the URL. It's dirty

    const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    window.history.pushState({ path: url }, "", url);
  };

  // Event listeners for theme buttons. They might be having a rave

  document.getElementById("goldTheme").addEventListener("click", () => updateTheme("gold"));
  document.getElementById("blackTheme").addEventListener("click", () => updateTheme("black"));

  // Copy URL to clipboard

  document.getElementById("copy").addEventListener("click", () => {
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

  updatePageFromURL();

  // Hide or show if tickbox is ticked off or not. It gets angry

  const checkbox = document.getElementById("wfCheckbox");
  const vNumberDiv = document.querySelector(".v-number");

  checkbox.addEventListener("change", function () {
    vNumberDiv.style.display = checkbox.checked ? "flex" : "none";
  });

  // Untick theme switch on load, because Firefox is a pain.

  document.getElementById("themeSwitch").checked = false;

  // Idea: Prevent the wireframe vertices from being too big, because it will roast some devices.

  // Controls on and off with fancy fx

  document.getElementById("themeSwitch").addEventListener("change", function () {
    document.querySelector(".theme-controls").classList.toggle("show", this.checked);
    document.querySelector(".pirate-panel").style.overflowY = this.checked ? "auto" : "hidden";
  });

  const piratePanelWrapper = document.getElementById("piratePanelWrapper");
  const resizer = document.getElementById("resizer");
  let startMouseX,
    startMouseY,
    currentScale = 1;
  let posX = piratePanelWrapper.offsetLeft,
    posY = piratePanelWrapper.offsetTop;
  let isDragging = false,
    isScaling = false;

  const onMouseMove = (e) => {
    if (isScaling) {
      const scaleChange = (startMouseX - e.clientX) * 0.003;
      const newScale = Math.min(Math.max(currentScale - scaleChange, 0.7), 1.1);
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
      currentScale = parseFloat(getComputedStyle(piratePanelWrapper).transform.split("(")[1]) || 1;
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

  // Checks to see if the body tag has had a bg theme applied, if it has, it's the end of pixels as we know them.

  const body = document.body;
  const observer = new MutationObserver(() => {
    const hasBackground = body.style.background || body.style.backgroundImage;
    body.classList.toggle("hasStyle", !!hasBackground);
  });

  observer.observe(body, { attributes: true });
  body.classList.toggle("hasStyle", body.style.background || body.style.backgroundImage);

  // Play sounds 

  const volumeLevel = 0.3;

  const playSound = (soundFile) => {
    const sound = new Audio(`sounds/${soundFile}.mp3`);
    sound.volume = volumeLevel;
    sound.play();
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
});

// Toggle the style "display: none;" for elements with class .show-hide

document.addEventListener("keydown", (event) => {
  if (event.key === "S" && event.shiftKey) {
    const elements = document.querySelectorAll(".show-hide");
    
    elements.forEach((element) => {
      element.style.display = element.style.display === "none" ? "" : "none";
    });
  }
});
