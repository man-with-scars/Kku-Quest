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
            var w = video.videoWidth;
            var h = video.videoHeight;
            if (!w || !h) {
                // Fallback to default if video not ready
                w = 640;
                h = 480;
            }
            var cv = document.createElement('canvas');
            cv.width = w;
            cv.height = h;
            var ctx = cv.getContext('2d');
            ctx.drawImage(video, 0, 0, w, h);
            return cv.toDataURL('image/jpeg', 0.85).split(',')[1];
        }

        // ── Gemini vision verify ─────────────────────────────────
        async function verifyWithGemini(b64) {
            var C = window.KKU_CONFIG;
            var url = C.GEMINI_URL + '?key=' + C.GEMINI_KEY;

            try {
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

                if (!res.ok) {
                    var errText = await res.text();
                    console.error('Gemini API Error:', res.status, errText);
                    throw new Error('API_ERROR_' + res.status);
                }

                var data = await res.json();
                console.log('Gemini Analysis:', data);

                if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                    var answer = data.candidates[0].content.parts[0].text.trim().toUpperCase();
                    return answer;
                } else {
                    console.error('Unexpected Gemini Response Format:', data);
                    throw new Error('FORMAT_ERROR');
                }
            } catch (err) {
                console.error('verifyWithGemini failed:', err);
                throw err;
            }
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
                    if (e.message.startsWith('API_ERROR_')) {
                        status.textContent = 'System Error: ' + e.message.split('_').pop();
                    } else if (e.message === 'FORMAT_ERROR') {
                        status.textContent = 'System Error: INVALID_RESP';
                    } else {
                        status.textContent = 'Verify failed: NETWORK_ERR';
                    }
                    btn.disabled = false;
                }
            }
        });
    }

    return { init: init };
}());
