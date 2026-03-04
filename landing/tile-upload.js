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

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            nameEl.textContent = 'Uploading ' + file.name + '...';

            const C = window.KKU_CONFIG;
            try {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const b64 = reader.result.split(',')[1];
                    const path = C.UPLOAD_PATH +
                        Date.now() + '_' +
                        file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                    const url = `https://api.github.com/repos/${C.GH_REPO}/contents/${path}`;

                    try {
                        const res = await fetch(url, {
                            method: 'PUT',
                            headers: {
                                Authorization: `token ${C.GH_TOKEN}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                message: 'Kku verification upload',
                                content: b64,
                                branch: C.GH_BRANCH
                            })
                        });

                        if (!res.ok) throw new Error('Upload failed');

                        nameEl.textContent = '✅ ' + file.name;
                        label.style.borderColor = 'rgba(22,163,74,0.5)';
                    } catch (fetchErr) {
                        nameEl.textContent = '❌ Upload failed — check config';
                        console.error(fetchErr);
                    }
                };
                reader.readAsDataURL(file);
            } catch (err) {
                nameEl.textContent = '❌ Upload failed — check config';
                console.error(err);
            }
        });
    }

    return { init: init };
}());
