// landing/final-overlay.js
// Exposes: window.FinalOverlay = { init, show }
// Responsibility: full-screen transition to game/index.html.

window.FinalOverlay = (function () {
    'use strict';

    var overlay = null;
    var btn = null;

    /**
     * Injects the required pulse animation for the final YES button.
     */
    function createStyle() {
        var style = document.createElement('style');
        style.textContent = [
            '@keyframes finalPulse {',
            '  0% { transform: scale(1); }',
            '  50% { transform: scale(1.1); }',
            '  100% { transform: scale(1); }',
            '}',
            '.final-overlay.show { opacity: 1; pointer-events: all; }'
        ].join('\n');
        document.head.appendChild(style);
    }

    function init() {
        createStyle();

        overlay = document.getElementById('final-overlay');
        btn = document.getElementById('btn-yes');

        if (!overlay || !btn) {
            console.warn('FinalOverlay: required elements not found');
            return;
        }

        btn.addEventListener('click', function () {
            var C = window.KKU_CONFIG;
            if (C && C.GAME_URL) {
                window.location.href = C.GAME_URL;
            } else {
                console.error('FinalOverlay: GAME_URL not found in config');
            }
        });
    }

    function show() {
        if (!overlay || !btn) return;

        // Add the show class (CSS transitions opacity to 1)
        overlay.classList.add('show');

        // Add pulse to YES button
        btn.style.animation = 'finalPulse 1.5s ease-in-out infinite';
    }

    return {
        init: init,
        show: show
    };
}());
