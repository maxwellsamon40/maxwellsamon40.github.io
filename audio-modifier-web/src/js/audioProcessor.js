const audioProcessor = (function () {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioCtx();
    let originalBuffer = null;
    let sourceNode = null;
    let gainNode = audioCtx.createGain();

    async function loadArrayBuffer(arrayBuffer) {
        originalBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
        return originalBuffer;
    }

    function isLoaded() {
        return !!originalBuffer;
    }

    function stop() {
        if (sourceNode) {
            try { sourceNode.stop(0); } catch (e) {}
            sourceNode.disconnect();
            sourceNode = null;
        }
    }

    function play(pitchSemitones = 0, speed = 1) {
        if (!originalBuffer) return;
        stop();
        const playbackRate = speed * Math.pow(2, pitchSemitones / 12);
        sourceNode = audioCtx.createBufferSource();
        sourceNode.buffer = originalBuffer;
        sourceNode.playbackRate.value = playbackRate;
        sourceNode.connect(gainNode).connect(audioCtx.destination);
        sourceNode.start();
    }

    // Render modified buffer into a new AudioBuffer via OfflineAudioContext and return WAV Blob
    async function renderToWav(pitchSemitones = 0, speed = 1) {
        if (!originalBuffer) throw new Error('No audio loaded');
        const playbackRate = speed * Math.pow(2, pitchSemitones / 12);

        const channels = originalBuffer.numberOfChannels;
        const srcSampleRate = originalBuffer.sampleRate;
        const newLength = Math.ceil(originalBuffer.length / playbackRate);

        const offlineCtx = new OfflineAudioContext(channels, newLength, srcSampleRate);

        const bufferSource = offlineCtx.createBufferSource();
        bufferSource.buffer = originalBuffer;
        bufferSource.playbackRate.value = playbackRate;
        bufferSource.connect(offlineCtx.destination);
        bufferSource.start(0);

        const renderedBuffer = await offlineCtx.startRendering();
        const wavBlob = audioBufferToWavBlob(renderedBuffer);
        return wavBlob;
    }

    // 16-bit PCM WAV encoder
    function audioBufferToWavBlob(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const length = buffer.length * numChannels * 2; // 16-bit
        const header = 44;
        const totalLength = header + length;
        const bufferArr = new ArrayBuffer(totalLength);
        const view = new DataView(bufferArr);

        function writeString(view, offset, string) {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        }

        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + length, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // PCM chunk size
        view.setUint16(20, 1, true);  // PCM format
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * 2, true);
        view.setUint16(32, numChannels * 2, true);
        view.setUint16(34, 16, true); // bits per sample
        writeString(view, 36, 'data');
        view.setUint32(40, length, true);

        // write interleaved PCM16
        let offset = 44;
        const channelsData = [];
        for (let ch = 0; ch < numChannels; ch++) {
            channelsData.push(buffer.getChannelData(ch));
        }

        const interleaved = new Int16Array(buffer.length * numChannels);
        let index = 0;
        for (let i = 0; i < buffer.length; i++) {
            for (let ch = 0; ch < numChannels; ch++) {
                let sample = channelsData[ch][i];
                sample = Math.max(-1, Math.min(1, sample));
                interleaved[index++] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            }
        }

        for (let i = 0; i < interleaved.length; i++, offset += 2) {
            view.setInt16(offset, interleaved[i], true);
        }

        return new Blob([view], { type: 'audio/wav' });
    }

    return {
        loadArrayBuffer,
        isLoaded,
        play,
        stop,
        renderToWav,
        audioCtx
    };
})();