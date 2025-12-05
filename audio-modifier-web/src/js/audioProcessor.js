function adjustPitch(audioBuffer, pitchFactor) {
    const offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    const pitchShift = offlineContext.createGain();
    pitchShift.gain.value = pitchFactor;

    source.connect(pitchShift);
    pitchShift.connect(offlineContext.destination);
    source.start(0);
    
    return offlineContext.startRendering();
}

function adjustSpeed(audioBuffer, speedFactor) {
    const offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    source.playbackRate.value = speedFactor;
    source.connect(offlineContext.destination);
    source.start(0);
    
    return offlineContext.startRendering();
}

function handleAudioProcessing(audioFile, pitchFactor, speedFactor) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(event.target.result);
            
            const pitchAdjustedBuffer = await adjustPitch(audioBuffer, pitchFactor);
            const speedAdjustedBuffer = await adjustSpeed(pitchAdjustedBuffer, speedFactor);
            
            resolve(speedAdjustedBuffer);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(audioFile);
    });
}

function downloadAudio(buffer, filename) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContext.decodeAudioData(buffer, (decodedData) => {
        audioContext.destination;
        const wavData = audioBufferToWav(decodedData);
        const blob = new Blob([new Uint8Array(wavData)], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteLength = buffer.length * blockAlign + 44; // 44 bytes for WAV header
    const wavBuffer = new ArrayBuffer(byteLength);
    const view = new DataView(wavBuffer);

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, byteLength - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size for PCM
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, byteLength - 44, true);

    // Write PCM samples
    let offset = 44;
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
            view.setInt16(offset, channelData[i] * 32767, true);
            offset += bytesPerSample;
        }
    }

    return new Uint8Array(wavBuffer);
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}