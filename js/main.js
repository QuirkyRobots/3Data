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
      document.getElementById("selectedBackgroundColour").innerText =
        "#" + bgColour;
      document.body.style.backgroundImage = `radial-gradient(#${bgColour}, transparent)`;
    }

    const blockColour = urlParams.get("block");
    if (blockColour) {
      const blockPicker = document.getElementById("cubeColourPicker");
      blockPicker.value = "#" + blockColour;
      document.getElementById("selectedCubeColour").innerText =
        "#" + blockColour;
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
    }
  });

  updatePageFromURL();
});
