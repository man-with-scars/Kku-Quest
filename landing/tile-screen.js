// landing/tile-screen.js
// Exposes: window.TileScreen = { init, isDone, hasPermission }
// Responsibility: screen record initialization.

window.TileScreen = (function () {
    'use strict';

    let isDone = false;
    let permissionGranted = false;

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
            if (isDone) return;

            if (!recording) {
                try {
                    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                    chunks = [];
                    recorder = new MediaRecorder(stream);
                    recorder.ondataavailable = e => chunks.push(e.data);

                    stream.getVideoTracks()[0].onended = () => {
                        // In the game end we will handle this, but for landing we just need the permission
                        isDone = false;
                    };

                    recorder.start();
                    recording = true;
                    status.textContent = '🔴 Recording...';
                    status.style.color = '#ff3250';
                    btn.textContent = 'Recording...';
                    btn.disabled = true;
                    permissionGranted = true;
                    isDone = true;
                    document.dispatchEvent(new CustomEvent('kku:task-completed', { detail: 'screen' }));
                } catch (e) {
                    status.textContent = 'Screen share denied';
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
