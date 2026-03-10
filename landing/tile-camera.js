// landing/tile-camera.js
// Exposes: window.TileCamera = { init, isDone, hasPermission }
// Responsibility: camera permission + recording state (multi-page).

window.TileCamera = (function () {
    'use strict';

    let isDone = false;
    let permissionGranted = false;

    function init() {
        // Fix for ID mismatch: btn-camera/camera-status/camera-preview -> btn-cam/cam-status/cam-preview
        const btn = document.getElementById('btn-cam');
        const status = document.getElementById('cam-status');
        const video = document.getElementById('cam-preview');

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
                        { video: { width: 640, height: 480, facingMode: 'user' }, audio: true }
                    );
                    video.srcObject = stream;

                    // Also sync to the floating game preview
                    const gameVideo = document.getElementById('game-cam-preview');
                    const gameFloat = document.getElementById('floating-cam-container');
                    if (gameVideo) {
                        gameVideo.srcObject = stream;
                        if (gameFloat) gameFloat.style.display = 'block';
                    }

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

                    // Register with MediaStorage for persistent recording
                    if (window.MediaStorage) {
                        window.MediaStorage.registerRecorder(recorder, 'camera');
                    }

                    recording = true;
                    status.textContent = '🔴 Recording...';
                    status.style.color = '#ff3250';
                    btn.textContent = 'Recording...';
                    btn.disabled = true;
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
