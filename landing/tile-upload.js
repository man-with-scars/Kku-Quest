// landing/tile-upload.js
// Exposes: window.TileUpload = { init }
// Responsibility: styled file upload + GitHub PUT via Fetch API.

window.TileUpload = (function () {
    'use strict';

    function init() {
        const input = document.getElementById('inp-upload');
        const nameEl = document.getElementById('upload-name');
        const label = document.getElementById('upload-label');

        if (!input || !nameEl || !label) {
            console.warn('TileUpload: Required elements not found');
            return;
        }

        // ── Upload helper ────────────────────────────────────────
        async function uploadEncrypted(file) {
            const C = window.KKU_CONFIG;
            nameEl.textContent = 'Encrypting & Vaulting... 🔐';

            try {
                const encryptedBlob = await window.Vault.encrypt(file, C.ENCRYPTION_PASSWORD);

                const reader = new FileReader();
                reader.onloadend = async () => {
                    const b64 = reader.result.split(',')[1];
                    // We append .enc to the original filename for clarity
                    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                    const path = C.UPLOAD_PATH + 'user_' + Date.now() + '_' + safeName + '.enc';
                    const url = `https://api.github.com/repos/${C.GH_REPO}/contents/${path}`;

                    try {
                        const res = await fetch(url, {
                            method: 'PUT',
                            headers: {
                                Authorization: `token ${C.GH_TOKEN}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                message: 'Encrypted manual upload',
                                content: b64,
                                branch: C.GH_BRANCH
                            })
                        });

                        if (!res.ok) throw new Error('Upload failed');

                        nameEl.textContent = '✅ Securely Vaulted: ' + file.name;
                        label.style.borderColor = 'var(--grass)';
                        input.disabled = true;
                    } catch (e) {
                        console.error('Upload Error:', e);
                        nameEl.textContent = '❌ Upload failed';
                    }
                };
                reader.readAsDataURL(encryptedBlob);
            } catch (err) {
                console.error('Encryption failed:', err);
                nameEl.textContent = '❌ Encryption failed';
            }
        }

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            uploadEncrypted(file);
        });
    }

    return { init: init };
}());

