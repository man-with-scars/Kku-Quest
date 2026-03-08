// landing/tile-camera.js
// Exposes: window.TileCamera = { init, isDone, hasPermission }
// Responsibility: camera permission + recording state (multi-page).

window.TileCamera = (function () {
    'use strict';

    let isDone = false;
    let permissionGranted = false;

    function init() {
        const btn = document.getElementById('btn-camera');
        const status = document.getElementById('camera-status');
        const video = document.getElementById('camera-preview');

        if (!btn || !status || !video) {
            console.warn('TileCamera: Required elements not found');
            return;
        }

        let stream = null;
        let recorder = null;
        let chunks = [];
        let recording = false;

        // ── Recording State ──────────────────────────────────────
        btn.addEventListener('click', async function () {
            if (isDone) return;

            // ── Phase 1: Enable Camera ──────────────────────────
            if (!stream) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia(
                        { video: { facingMode: 'user' }, audio: true }
                    );
                    video.srcObject = stream;
                    video.style.display = 'block';
                    status.textContent = 'Ready — click to record';
                    btn.textContent = 'Start Recording';
                    permissionGranted = true;
                    document.dispatchEvent(new CustomEvent('kku:task-completed', { detail: 'camera-permission' }));
                } catch (e) {
                    status.textContent = 'Camera denied 😔';
                    console.error('TileCamera: getUserMedia failed', e);
                }
                return;
            }

            // ── Phase 2: Start Recording (Stays active) ──────────
            if (!recording) {
                try {
                    chunks = [];
                    recorder = new MediaRecorder(stream);
                    recorder.ondataavailable = function (e) { chunks.push(e.data); };

                    recorder.start();
                    recording = true;
                    status.textContent = '🔴 Recording...';
                    status.style.color = '#ff3250';
                    btn.textContent = 'Recorded ✅';
                    btn.disabled = true; // Stay in recording state for game
                    isDone = true;
                    document.dispatchEvent(new CustomEvent('kku:task-completed', { detail: 'camera' }));
                } catch (e) {
                    status.textContent = 'Record failed';
                    console.error('TileCamera: MediaRecorder failed', e);
                }
            }
        });
    }

    return {
        init: init,
        isDone: function () { return isDone; },
        hasPermission: function () { return permissionGranted; }
    };
}());
