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
        var verified = false;

        // ── Capture canvas frame → base64 JPEG ──────────────────
        function captureFrame() {
            var cv = document.createElement('canvas');
            cv.width = video.videoWidth || 640;
            cv.height = video.videoHeight || 480;
            cv.getContext('2d').drawImage(video, 0, 0);
            return cv.toDataURL('image/jpeg', 0.85).split(',')[1];
        }

        // ── Gemini vision verify ─────────────────────────────────
        async function verifyWithGemini(b64) {
            var C = window.KKU_CONFIG;
            var url = C.GEMINI_URL + '?key=' + C.GEMINI_KEY;

            var res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                inline_data: {
                                    mime_type: 'image/jpeg',
                                    data: b64,
                                }
                            },
                            {
                                text: 'Does this show a person holding up exactly two fingers ' +
                                    'in a victory or peace pose? Reply YES or NO only.'
                            }
                        ]
                    }]
                })
            });

            var data = await res.json();
            // Gemini response: data.candidates[0].content.parts[0].text
            var answer = data.candidates[0].content.parts[0].text.trim().toUpperCase();
            return answer;
        }

        // ── Shake helper ─────────────────────────────────────────
        function shakeTile() {
            var tile = document.getElementById('tile-cam');
            if (!tile) return;
            tile.style.animation = 'shake 0.4s';
            setTimeout(function () { tile.style.animation = ''; }, 500);
        }

        // ── Main click handler ───────────────────────────────────
        btn.addEventListener('click', async function () {

            // ── First click: request camera ──────────────────────
            if (!stream) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia(
                        { video: { facingMode: 'user' }, audio: false }
                    );
                    video.srcObject = stream;
                    video.style.display = 'block';
                    status.textContent = 'Live — hold up ✌️';
                    btn.textContent = 'Capture & Verify';

                    // Show cartoon eyes as soon as camera is live
                    if (window.Phase4Eyes && typeof Phase4Eyes.show === 'function') {
                        Phase4Eyes.show();
                    }
                } catch (e) {
                    status.textContent = 'Camera denied 😔';
                    console.error('TileCamera: getUserMedia failed', e);
                }
                return;
            }

            // ── Second click: capture + Gemini verify ────────────
            if (!verified) {
                status.textContent = 'Verifying... ✨';
                btn.disabled = true;

                try {
                    var b64 = captureFrame();
                    var answer = await verifyWithGemini(b64);

                    if (answer.includes('YES')) {
                        verified = true;
                        status.textContent = '✅ Verified!';
                        status.style.color = 'var(--grass)';
                        btn.textContent = 'Done ✅';
                        btn.disabled = true;
                    } else {
                        status.textContent = 'Try again — show ✌️ clearly';
                        btn.disabled = false;
                        shakeTile();
                    }
                } catch (e) {
                    console.error('TileCamera: verification failed', e);
                    status.textContent = 'Verify failed — try again';
                    btn.disabled = false;
                }
            }
        });
    }

    return { init: init };
}());
