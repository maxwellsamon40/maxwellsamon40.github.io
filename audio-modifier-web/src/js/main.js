// src/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const pitchInput = document.getElementById('pitch');
    const speedInput = document.getElementById('speed');
    const downloadButton = document.getElementById('download');

    pitchInput.addEventListener('input', updateAudio);
    speedInput.addEventListener('input', updateAudio);
    downloadButton.addEventListener('click', downloadModifiedAudio);

    function updateAudio() {
        const pitchValue = pitchInput.value;
        const speedValue = speedInput.value;
        // Call the audio processing function from audioProcessor.js
        processAudio(pitchValue, speedValue);
    }

    function downloadModifiedAudio() {
        // Call the download function from downloadButton.js
        triggerDownload();
    }
});