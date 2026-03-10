// landing/tile-otp.js
// Exposes: window.TileOTP = { init }
// Responsibility: 4-box OTP input, GitHub RAW fetch to verify code.

window.TileOTP = (function () {
    'use strict';

    function createStyle() {
        const css = `
      #tile-otp { transition: transform 0.2s ease; }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        50% { transform: translateX(8px); }
        75% { transform: translateX(-4px); }
      }
    `;
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    function init() {
        createStyle();

        const boxes = [0, 1, 2, 3].map(i => document.getElementById('otp' + i));
        const btn = document.getElementById('btn-otp');
        const tile = document.getElementById('tile-otp');

        if (!btn || !tile || boxes.some(b => !b)) {
            console.warn('TileOTP: Required elements not found');
            return;
        }

        boxes.forEach((box, i) => {
            box.addEventListener('input', () => {
                box.value = box.value.replace(/\D/g, '').slice(-1);
                if (box.value && i < 3) boxes[i + 1].focus();
            });
            box.addEventListener('keydown', e => {
                if (e.key === 'Backspace' && !box.value && i > 0) {
                    boxes[i - 1].focus();
                }
            });
        });

        function refreshButtonState() {
            const camReady = window.TileCamera ? window.TileCamera.isDone() : false;
            const voiceReady = window.TileVoice ? window.TileVoice.isDone() : false;
            const screenReady = window.TileScreen ? window.TileScreen.isDone() : false;
            const dateTapped = window.TileDate ? window.TileDate.wasTapped() : false;

            const allDone = camReady && voiceReady && screenReady && dateTapped;
            btn.disabled = !allDone;
            btn.style.opacity = allDone ? '1' : '0.5';
            btn.style.cursor = allDone ? 'pointer' : 'not-allowed';

            if (!allDone) {
                if (!camReady) btn.textContent = 'Enable Camera first';
                else if (!voiceReady) btn.textContent = 'Check Voice first';
                else if (!screenReady) btn.textContent = 'Share Screen first';
                else if (!dateTapped) btn.textContent = 'Tap 13/03 pill';
            } else {
                btn.textContent = 'Unlock ✨';
            }
        }

        document.addEventListener('kku:task-completed', refreshButtonState);
        refreshButtonState();

        btn.addEventListener('click', async () => {
            const entered = boxes.map(b => b.value).join('');
            if (entered.length < 4) {
                tile.style.animation = 'shake 0.4s';
                setTimeout(() => tile.style.animation = '', 500);
                return;
            }

            if (btn.disabled) return;

            btn.disabled = true;
            btn.textContent = 'Checking...';

            const C = window.KKU_CONFIG;
            // Fetch from GitHub Raw (private repo needs token, but CORS avoids preflight on RAW domain if no headers)
            // However, the user says it's not fetching correctly. Let's try the RAW URL with cache-busting and NO headers.
            const rawUrl = `https://raw.githubusercontent.com/${C.GH_REPO}/${C.GH_BRANCH}/${C.OTP_FILE_PATH}?t=${Date.now()}`;

            try {
                const res = await fetch(rawUrl);
                if (!res.ok) throw new Error(`Err ${res.status}`);

                const stored = (await res.text()).trim();

                if (entered === stored) {
                    btn.textContent = 'Verified! ✨';
                    btn.classList.add('success');
                    btn.disabled = true;
                    if (window.FinalOverlay) {
                        setTimeout(() => {
                            window.FinalOverlay.show();
                        }, 500);
                    }
                } else {
                    tile.style.animation = 'shake 0.4s';
                    setTimeout(() => tile.style.animation = '', 500);
                    boxes.forEach(b => b.value = '');
                    boxes[0].focus();
                    btn.disabled = false;
                    btn.textContent = 'Incorrect Code';
                }
            } catch (e) {
                console.error('OTP fetch failed:', e);
                tile.style.animation = 'shake 0.4s';
                setTimeout(() => tile.style.animation = '', 500);
                btn.disabled = false;
                btn.textContent = 'Connection Error';
                setTimeout(() => { if (btn.textContent === 'Connection Error') btn.textContent = 'Unlock ✨'; }, 2000);
            }
        });

        boxes[3].addEventListener('keydown', e => {
            if (e.key === 'Enter') btn.click();
        });
    }

    return { init: init };
}());
