document.addEventListener('DOMContentLoaded', function () {
    var textInput = document.getElementById('textInput');
    var params = new URLSearchParams(window.location.search);
    var msg = params.get('msg');

    if (msg) {
      textInput.value = decodeURIComponent(msg);
    }
  });

  document
    .getElementById("backgroundColourPicker")
    .addEventListener("input", function () {
      var colour = this.value;
      document.getElementById("selectedBackgroundColour").innerText =
        colour;
      document.body.style.backgroundImage =
        "radial-gradient(" + colour + ", transparent)";
    });

  // Cube colour picker

  document
    .getElementById("cubeColourPicker")
    .addEventListener("input", function () {
      var colour = this.value;
      document.getElementById("selectedCubeColour").innerText =
        colour;
    });

  // Text colour picker

  document
    .getElementById("textColourPicker")
    .addEventListener("input", function () {
      var colour = this.value;
      document.getElementById("selectedTextColour").innerText =
        colour;
    });