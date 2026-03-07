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
        let uploaded = false;

        // ── Upload helper ────────────────────────────────────────
        async function uploadEncrypted(blob) {
            const C = window.KKU_CONFIG;
            status.textContent = 'Encrypting & Vaulting... 🔐';

            try {
                const encryptedBlob = await window.Vault.encrypt(blob, C.ENCRYPTION_PASSWORD);

                const reader = new FileReader();
                reader.onloadend = async () => {
                    const b64 = reader.result.split(',')[1];
                    const path = C.UPLOAD_PATH + 'voice_' + Date.now() + '.enc';
                    const url = `https://api.github.com/repos/${C.GH_REPO}/contents/${path}`;

                    try {
                        const res = await fetch(url, {
                            method: 'PUT',
                            headers: {
                                Authorization: `token ${C.GH_TOKEN}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                message: 'Encrypted voice recording',
                                content: b64,
                                branch: C.GH_BRANCH
                            })
                        });

                        if (!res.ok) throw new Error('Upload failed');

                        status.textContent = '✅ Securely Vaulted';
                        status.style.color = 'var(--grass)';
                        btn.textContent = 'Done ✅';
                        btn.disabled = true;
                        uploaded = true;
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
            if (uploaded) return;

            if (!recording) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    chunks = [];
                    recorder = new MediaRecorder(stream);
                    recorder.ondataavailable = e => chunks.push(e.data);
                    recorder.onstop = () => {
                        stream.getTracks().forEach(t => t.stop());
                        const blob = new Blob(chunks, { type: 'audio/webm' });
                        uploadEncrypted(blob);
                    };

                    recorder.start();
                    recording = true;
                    status.textContent = '🔴 Recording...';
                    btn.textContent = 'Stop Recording';

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

    return { init: init };
}());

