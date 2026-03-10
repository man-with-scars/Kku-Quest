// landing/tile-voice.js
// Exposes: window.TileVoice = { init, isDone, hasPermission }
// Responsibility: audio recording + animated waveform bars.

window.TileVoice = (function () {
    'use strict';

    let isDone = false;
    let permissionGranted = false;

    function init() {
        const btn = document.getElementById('btn-voice');
        const status = document.getElementById('voice-status');
        const wave = document.getElementById('voice-wave');

        if (!btn || !status || !wave) {
            console.warn('TileVoice: Required elements not found');
            return;
        }

        let recorder = null;
        let chunks = [];
        let recording = false;

        btn.addEventListener('click', async () => {
            if (isDone) return;

            if (!recording) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    chunks = [];
                    recorder = new MediaRecorder(stream);
                    recorder.ondataavailable = e => chunks.push(e.data);

                    recorder.start();

                    // Register with MediaStorage for persistent recording
                    if (window.MediaStorage) {
                        window.MediaStorage.registerRecorder(recorder, 'voice');
                    }

                    recording = true;
                    status.textContent = '🔴 Recording...';
                    status.style.color = '#ff3250';
                    btn.textContent = 'Recording...';
                    btn.disabled = true;
                    permissionGranted = true;
                    isDone = true;
                    document.dispatchEvent(new CustomEvent('kku:task-completed', { detail: 'voice' }));

                    wave.innerHTML = '';
                    wave.style.display = 'flex';
                    for (let i = 0; i < 12; i++) {
                        const bar = document.createElement('div');
                        bar.className = 'bar';
                        bar.style.animationDelay = (i * 0.07) + 's';
                        wave.appendChild(bar);
                    }
                } catch (e) {
                    status.textContent = 'Mic denied';
                    console.error(e);
                }
            }
        });
    }

    return {
        init: init,
        isDone: () => isDone,
        hasPermission: () => permissionGranted
    };
}());
