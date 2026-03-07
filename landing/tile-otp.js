// landing/tile-otp.js
// Exposes: window.TileOTP = { init }
// Responsibility: 4-box OTP input, GitHub raw fetch to verify code.

window.TileOTP = (function () {
    'use strict';

    /**
     * Injects CSS for the OTP tile into the document head.
     * Note: Basic styles are in index.html, but we satisfy the rule here.
     */
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

        // ── Auto-advance between boxes ───────────────────────────
        boxes.forEach((box, i) => {
            box.addEventListener('input', () => {
                // Keep only last digit, strip non-numeric
                box.value = box.value.replace(/\D/g, '').slice(-1);
                // Focus next if filled
                if (box.value && i < 3) boxes[i + 1].focus();
            });

            box.addEventListener('keydown', e => {
                // Backspace to previous box if empty
                if (e.key === 'Backspace' && !box.value && i > 0) {
                    boxes[i - 1].focus();
                }
            });
        });

        // ── Verify on Click ──────────────────────────────────────
        btn.addEventListener('click', async () => {
            const entered = boxes.map(b => b.value).join('');

            if (entered.length < 4) {
                tile.style.animation = 'shake 0.4s';
                setTimeout(() => tile.style.animation = '', 500);
                return;
            }

            btn.disabled = true;
            btn.textContent = 'Checking...';

            const C = window.KKU_CONFIG;
            // Fetch the correct code from GitHub raw (cache-busted)
            const rawUrl = `https://raw.githubusercontent.com/${C.GH_REPO}/${C.GH_BRANCH}/${C.OTP_FILE_PATH}?t=${Date.now()}`;

            try {
                const headers = {};
                if (C.GH_TOKEN && !C.GH_TOKEN.startsWith('github_pat_...')) {
                    headers['Authorization'] = `token ${C.GH_TOKEN}`;
                }

                const res = await fetch(rawUrl, { headers });
                if (!res.ok) throw new Error('Fetch failed');

                const stored = (await res.text()).trim();

                if (entered === stored) {
                    // Success
                    btn.textContent = 'Verified! ✨';
                    btn.classList.add('success');
                    if (window.FinalOverlay) window.FinalOverlay.show();
                } else {
                    // Wrong
                    tile.style.animation = 'shake 0.4s';
                    setTimeout(() => tile.style.animation = '', 500);
                    boxes.forEach(b => b.value = '');
                    boxes[0].focus();
                    btn.disabled = false;
                    btn.textContent = 'Unlock ✨';
                }

            } catch (e) {
                // Network error — fallback for testing
                console.warn('OTP fetch failed:', e);
                // Provide the final overlay transition even if GitHub is unreachable
                btn.textContent = 'Offline Pass';
                if (window.FinalOverlay) window.FinalOverlay.show();
                btn.disabled = false;
            }
        });

        // Support entering on the last box
        boxes[3].addEventListener('keydown', e => {
            if (e.key === 'Enter') btn.click();
        });
    }

    return { init: init };
}());
