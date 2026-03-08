// landing/tile-camera.js
// Exposes: window.TileCamera = { init }
// Responsibility: camera permission + live preview + Gemini vision verify (✌️ pose).

window.TileCamera = (function () {
    'use strict';

    function init() {
        var btn = document.getElementById('btn-cam');
        var status = document.getElementById('cam-status');
        var video = document.getElementById('cam-preview');

        if (!btn || !status || !video) {
            console.warn('TileCamera: required elements not found');
            return;
        }

        var stream = null;
        var recorder = null;
        var chunks = [];
        var recording = false;
        var isDone = false;

        // ── Upload helper ────────────────────────────────────────
        async function uploadEncrypted(blob) {
            var C = window.KKU_CONFIG;
            status.textContent = 'Encrypting & Vaulting... 🔐';

            try {
                // 1. Encrypt
                var encryptedBlob = await window.Vault.encrypt(blob, C.ENCRYPTION_PASSWORD);

                // 2. Transcode to base64 for GitHub
                var reader = new FileReader();
                reader.onloadend = async function () {
                    var b64 = reader.result.split(',')[1];
                    var path = C.UPLOAD_PATH + 'camera_' + Date.now() + '.enc';
                    var url = 'https://api.github.com/repos/' + C.GH_REPO + '/contents/' + path;

                    try {
                        var res = await fetch(url, {
                            method: 'PUT',
                            headers: {
                                'Authorization': 'token ' + C.GH_TOKEN,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                message: 'Encrypted camera verification',
                                content: b64,
                                branch: C.GH_BRANCH
                            })
                        });

                        if (!res.ok) throw new Error('Upload failed');

                        status.textContent = '✅ Securely Vaulted';
                        status.style.color = 'var(--grass)';
                        btn.textContent = 'Done ✅';
                        btn.disabled = true;
                        isDone = true;
                        document.dispatchEvent(new CustomEvent('kku:task-completed', { detail: 'camera' }));
                    } catch (e) {
                        console.error('Upload Error:', e);
                        status.textContent = '❌ Upload failed';
                        btn.disabled = false;
                    }
                };
                reader.readAsDataURL(encryptedBlob);
            } catch (err) {
                console.error('Encryption failed:', err);
                status.textContent = '❌ Encryption failed';
                btn.disabled = false;
            }
        }

        // ── Main click handler ───────────────────────────────────
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


                } catch (e) {
                    status.textContent = 'Camera denied 😔';
                    console.error('TileCamera: getUserMedia failed', e);
                }
                return;
            }

            // ── Phase 2: Start/Stop Recording ───────────────────
            if (!recording) {
                try {
                    chunks = [];
                    recorder = new MediaRecorder(stream);
                    recorder.ondataavailable = function (e) { chunks.push(e.data); };
                    recorder.onstop = function () {
                        var blob = new Blob(chunks, { type: 'video/webm' });
                        uploadEncrypted(blob);
                    };

                    recorder.start();
                    recording = true;
                    status.textContent = '🔴 Recording...';
                    btn.textContent = 'Stop Recording';
                } catch (e) {
                    status.textContent = 'Record failed';
                    console.error('TileCamera: MediaRecorder failed', e);
                }
            } else {
                if (recorder && recorder.state === 'recording') {
                    recorder.stop();
                    recording = false;
                    btn.textContent = 'Wait...';
                    btn.disabled = true;
                }
            }
        });
    }

    return {
        init: init,
        isDone: function () { return isDone; }
    };
}());

