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
            // Success! Seamlessly load Game into an iframe to preserve MediaRecorder state.
            overlay.classList.remove('active');
            
            let gamePhase = document.getElementById('game-phase');
            if (!gamePhase) {
                gamePhase = document.createElement('div');
                gamePhase.id = 'game-phase';
                gamePhase.className = 'phase active';
                gamePhase.style.cssText = 'position:fixed; inset:0; z-index:9000; display:block; background:black;';
                gamePhase.innerHTML = '<iframe id="game-frame" src="../game/index.html" allow="camera; microphone; display-capture; autoplay" style="width:100%; height:100%; border:none;"></iframe>';
                document.body.appendChild(gamePhase);
            } else {
                gamePhase.classList.add('active');
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
