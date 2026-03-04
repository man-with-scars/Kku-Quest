// landing/tile-voice.js
// Exposes: window.TileVoice = { init }
// Responsibility: audio recording + animated waveform bars.

window.TileVoice = (function () {
    'use strict';

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
            if (!recording) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    chunks = [];
                    recorder = new MediaRecorder(stream);
                    recorder.ondataavailable = e => chunks.push(e.data);
                    recorder.onstop = () => {
                        // Stop tracks to release mic
                        stream.getTracks().forEach(t => t.stop());

                        const blob = new Blob(chunks, { type: 'audio/webm' });
                        const au = document.createElement('audio');
                        au.src = URL.createObjectURL(blob);
                        au.controls = true;
                        au.style.cssText = 'width:100%;margin-top:8px;border-radius:8px;';
                        wave.after(au);

                        status.textContent = '✅ Recorded';
                        status.classList.add('ok');
                        wave.style.display = 'none';
                        recording = false;
                        btn.textContent = 'Record Again';
                    };

                    recorder.start();
                    recording = true;
                    status.textContent = '🔴 Recording...';
                    btn.textContent = 'Stop Recording';

                    // Show waveform bars
                    wave.innerHTML = '';
                    wave.style.display = 'flex';
                    for (let i = 0; i < 12; i++) {
                        const bar = document.createElement('div');
                        bar.className = 'bar'; // Matching index.html CSS class
                        bar.style.animationDelay = (i * 0.07) + 's';
                        wave.appendChild(bar);
                    }
                } catch (e) {
                    status.textContent = 'Mic denied';
                    console.error(e);
                }
            } else {
                if (recorder && recorder.state === 'recording') {
                    recorder.stop();
                }
            }
        });
    }

    return { init: init };
}());
