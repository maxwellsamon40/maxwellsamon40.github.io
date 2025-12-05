// src/js/main.js

document.addEventListener('DOMContentLoaded', async () => {
    const fileInput = document.getElementById('fileInput');
    const pitch = document.getElementById('pitch');
    const speed = document.getElementById('speed');
    const pitchValue = document.getElementById('pitchValue');
    const speedValue = document.getElementById('speedValue');
    const playButton = document.getElementById('playButton');
    const stopButton = document.getElementById('stopButton');
    const downloadButton = document.getElementById('downloadButton');

    let currentFileName = 'modified.wav';
    let isPlaying = false;

    // Resume audio context on first interaction
    document.addEventListener('click', async () => {
        try { await audioProcessor.audioCtx.resume(); } catch (e) {}
    }, { once: true });

    pitch.addEventListener('input', () => {
        pitchValue.textContent = pitch.value;
        if (isPlaying) {
            const p = parseFloat(pitch.value);
            const s = parseFloat(speed.value);
            audioProcessor.play(p, s);
        }
    });

    speed.addEventListener('input', () => {
        speedValue.textContent = parseFloat(speed.value).toFixed(1);
        if (isPlaying) {
            const p = parseFloat(pitch.value);
            const s = parseFloat(speed.value);
            audioProcessor.play(p, s);
        }
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

        // Auto-play when file is loaded
        try { await audioProcessor.audioCtx.resume(); } catch (e) {}
        const p = parseFloat(pitch.value);
        const s = parseFloat(speed.value);
        audioProcessor.play(p, s);
        isPlaying = true;
        playButton.textContent = 'Pause';
    });

    playButton.addEventListener('click', async () => {
        try { await audioProcessor.audioCtx.resume(); } catch (e) {}
        
        if (isPlaying) {
            audioProcessor.stop();
            isPlaying = false;
            playButton.textContent = 'Play';
        } else {
            const p = parseFloat(pitch.value);
            const s = parseFloat(speed.value);
            audioProcessor.play(p, s);
            isPlaying = true;
            playButton.textContent = 'Pause';
        }
    });

    stopButton.addEventListener('click', () => {
        audioProcessor.stop();
        isPlaying = false;
        playButton.textContent = 'Play';
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