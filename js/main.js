document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const inputMappings = {
        'msg': 'textInput',
        'bg': 'backgroundColourPicker',
        'cube': 'cubeColourPicker',
        'txt': 'textColourPicker'
    };

    Object.keys(inputMappings).forEach(key => {
        const value = params.get(key);
        if (value) {
            document.getElementById(inputMappings[key]).value = decodeURIComponent(value);
        }
    });
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