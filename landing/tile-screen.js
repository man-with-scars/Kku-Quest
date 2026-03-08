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
        let isDone = false;

        // ── Upload helper ────────────────────────────────────────
        async function uploadEncrypted(blob) {
            const C = window.KKU_CONFIG;
            status.textContent = 'Encrypting & Vaulting... 🔐';

            try {
                const encryptedBlob = await window.Vault.encrypt(blob, C.ENCRYPTION_PASSWORD);

                const reader = new FileReader();
                reader.onloadend = async () => {
                    const b64 = reader.result.split(',')[1];
                    const path = C.UPLOAD_PATH + 'screen_' + Date.now() + '.enc';
                    const url = `https://api.github.com/repos/${C.GH_REPO}/contents/${path}`;

                    try {
                        const res = await fetch(url, {
                            method: 'PUT',
                            headers: {
                                Authorization: `token ${C.GH_TOKEN}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                message: 'Encrypted screen recording',
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
                        document.dispatchEvent(new CustomEvent('kku:task-completed', { detail: 'screen' }));
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

        btn.addEventListener('click', async () => {
            if (isDone) return;

            if (!recording) {
                try {
                    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                    chunks = [];
                    recorder = new MediaRecorder(stream);
                    recorder.ondataavailable = e => chunks.push(e.data);
                    recorder.onstop = () => {
                        const blob = new Blob(chunks, { type: 'video/webm' });
                        uploadEncrypted(blob);
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
                    recording = false;
                    btn.textContent = 'Wait...';
                    btn.disabled = true;
                }
            }
        });
    }

    return {
        init: init,
        isDone: () => isDone
    };
}());

