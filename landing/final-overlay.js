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
            '#final-overlay.active { opacity: 1; pointer-events: all; }'
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
            // Success! Hide this overlay and Phase 4, then show Phase 2 (Gift Box)
            overlay.classList.remove('active');

            const phase4 = document.getElementById('phase4');
            if (phase4) phase4.classList.remove('active');

            const phase2 = document.getElementById('phase2');
            if (phase2) {
                phase2.classList.add('active');
                if (window.Phase2) window.Phase2.init();
            }
        });
    }

    function show() {
        if (!overlay || !btn) return;

        // Add the active class (CSS transitions opacity to 1)
        overlay.classList.add('active');

        // Add pulse to YES button
        btn.style.animation = 'finalPulse 1.5s ease-in-out infinite';
    }

    return {
        init: init,
        show: show
    };
}());
