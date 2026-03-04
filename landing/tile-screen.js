// landing/tile-screen.js
// Exposes: window.TileScreen = { init }
// Responsibility: screen record + auto-download.

window.TileScreen = (function () {
    'use strict';

    function init() {
        const btn = document.getElementById('btn-screen');
        const status = document.getElementById('screen-status');

        if (!btn || !status) {
            console.warn('TileScreen: Required elements not found');
            return;
        }

        let recorder = null;
        let chunks = [];
        let recording = false;

        btn.addEventListener('click', async () => {
            if (!recording) {
                try {
                    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                    chunks = [];
                    recorder = new MediaRecorder(stream);
                    recorder.ondataavailable = e => chunks.push(e.data);
                    recorder.onstop = () => {
                        const blob = new Blob(chunks, { type: 'video/webm' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'kku-verification.webm';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);

                        status.textContent = '✅ Saved to downloads';
                        status.classList.add('ok');
                        recording = false;
                        btn.textContent = 'Start Screen Rec';
                    };
                    stream.getVideoTracks()[0].onended = () => {
                        if (recorder && recorder.state === 'recording') recorder.stop();
                    };
                    recorder.start();
                    recording = true;
                    status.textContent = '🔴 Recording...';
                    btn.textContent = 'Stop Recording';
                } catch (e) {
                    status.textContent = 'Screen share denied';
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
