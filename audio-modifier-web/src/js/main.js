// src/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const pitch = document.getElementById('pitch');
    const speed = document.getElementById('speed');
    const pitchValue = document.getElementById('pitchValue');
    const speedValue = document.getElementById('speedValue');
    const playButton = document.getElementById('playButton');
    const stopButton = document.getElementById('stopButton');
    const downloadButton = document.getElementById('downloadButton');
    const audioPlayer = document.getElementById('audioPlayer');

    let currentFileName = 'modified.wav';

    pitch.addEventListener('input', () => {
        pitchValue.textContent = pitch.value;
    });

    speed.addEventListener('input', () => {
        speedValue.textContent = parseFloat(speed.value).toFixed(1);
    });

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        currentFileName = file.name.replace(/\.[^/.]+$/, '') + '-modified.wav';
        const arrayBuffer = await file.arrayBuffer();
        await audioProcessor.loadArrayBuffer(arrayBuffer);

        // Enable buttons
        playButton.disabled = false;
        stopButton.disabled = false;
        downloadButton.disabled = false;

        // create a preview URL using render for current params (quick approach: create blob via offline render)
        // For fast preview we can use AudioContext playback; here we'll use audioProcessor.play for immediate preview when user presses Play.
    });

    playButton.addEventListener('click', async () => {
        const p = parseFloat(pitch.value);
        const s = parseFloat(speed.value);
        // resume audio context if needed (required in some browsers)
        try { await audioProcessor.audioCtx.resume(); } catch (e) {}
        audioProcessor.play(p, s);
    });

    stopButton.addEventListener('click', () => {
        audioProcessor.stop();
    });

    downloadButton.addEventListener('click', async () => {
        downloadButton.disabled = true;
        downloadButton.textContent = 'Rendering...';
        try {
            const p = parseFloat(pitch.value);
            const s = parseFloat(speed.value);
            const wavBlob = await audioProcessor.renderToWav(p, s);
            const url = URL.createObjectURL(wavBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = currentFileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert('Erro ao gerar arquivo: ' + err.message);
        } finally {
            downloadButton.disabled = false;
            downloadButton.textContent = 'Download Modified Audio';
        }
    });
});