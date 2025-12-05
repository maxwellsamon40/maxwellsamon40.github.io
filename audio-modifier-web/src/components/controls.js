const controls = (() => {
    const createControls = () => {
        const container = document.createElement('div');
        container.classList.add('controls');

        const pitchLabel = document.createElement('label');
        pitchLabel.textContent = 'Pitch Adjustment:';
        const pitchInput = document.createElement('input');
        pitchInput.type = 'range';
        pitchInput.min = '-12';
        pitchInput.max = '12';
        pitchInput.value = '0';
        pitchInput.id = 'pitch';

        const speedLabel = document.createElement('label');
        speedLabel.textContent = 'Speed Adjustment:';
        const speedInput = document.createElement('input');
        speedInput.type = 'range';
        speedInput.min = '0.5';
        speedInput.max = '2';
        speedInput.step = '0.1';
        speedInput.value = '1';
        speedInput.id = 'speed';

        container.appendChild(pitchLabel);
        container.appendChild(pitchInput);
        container.appendChild(speedLabel);
        container.appendChild(speedInput);

        return container;
    };

    const updateControls = (pitchValue, speedValue) => {
        const pitchInput = document.getElementById('pitch');
        const speedInput = document.getElementById('speed');

        pitchInput.value = pitchValue;
        speedInput.value = speedValue;
    };

    return {
        createControls,
        updateControls
    };
})();

export default controls;