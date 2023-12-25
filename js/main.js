


document.addEventListener("DOMContentLoaded", function () {

    setTimeout(function() {
        var bodyElement = document.body;
       bodyElement.style.transition = 'opacity 1s';
       bodyElement.style.opacity = 1;
    }, 1000);
    

  applyStylesFromURL();

  const params = new URLSearchParams(window.location.search);
  const inputMappings = {
    msg: "textInput",
    bg: "backgroundColourPicker",
    cube: "cubeColourPicker",
    txt: "textColourPicker",
  };

  Object.keys(inputMappings).forEach((key) => {
    let value = params.get(key);
    if (value) {
      if (key !== "msg" && !value.startsWith("#")) {
        value = "#" + value;
      }
      document.getElementById(inputMappings[key]).value =
        decodeURIComponent(value);
    }
  });
});

// URL magic

const applyStylesFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  const bgValue = params.get("bg");
  if (bgValue) {
    document.body.style.backgroundImage = `radial-gradient(#${bgValue}, transparent)`;
  }
};

const updateURLAndStyles = () => {
  const params = new URLSearchParams();
  const elements = {
    msg: "textInput",
    bg: "backgroundColourPicker",
    cube: "cubeColourPicker",
    txt: "textColourPicker",
  };

  for (const [key, id] of Object.entries(elements)) {
    const element = document.getElementById(id);
    const value =
      key !== "msg" ? element.value.replace("#", "") : element.value;
    params.set(key, value);

    if (key === "bg") {
      document.body.style.backgroundImage = `radial-gradient(${element.value}, transparent)`;
    }
  }
  window.history.pushState({}, "", `${window.location.pathname}?${params}`);
};

[
  "textInput",
  "backgroundColourPicker",
  "cubeColourPicker",
  "textColourPicker",
].forEach((id) =>
  document.getElementById(id).addEventListener("input", updateURLAndStyles)
);

// Background colour picker

document
  .getElementById("backgroundColourPicker")
  .addEventListener("input", function () {
    var colour = this.value;
    document.getElementById("selectedBackgroundColour").innerText = colour;
    document.body.style.backgroundImage =
      "radial-gradient(" + colour + ", transparent)";
  });

// Cube colour picker

document
  .getElementById("cubeColourPicker")
  .addEventListener("input", function () {
    var colour = this.value;
    document.getElementById("selectedCubeColour").innerText = colour;
  });

// Text colour picker

document
  .getElementById("textColourPicker")
  .addEventListener("input", function () {
    var colour = this.value;
    document.getElementById("selectedTextColour").innerText = colour;
  });
