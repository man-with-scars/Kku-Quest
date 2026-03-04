// landing/phase1.js
// Exposes: window.Phase1 = { init, destroy }
// Responsibility: black void + neon mouse trails. Auto-advances to Phase 2 after 7500ms.

window.Phase1 = (function () {
    'use strict';

    // ── Private state ──────────────────────────────────────────
    var canvas = null;
    var ctx = null;
    var rafId = null;
    var hue = 0;
    var advTimer = null;

    // Bound listener references (so we can remove them cleanly)
    var _onMouseMove = null;
    var _onResize = null;

    // ── Helpers ────────────────────────────────────────────────
    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function drawTrail(x, y) {
        if (!ctx) return;
        var grad = ctx.createRadialGradient(x, y, 0, x, y, 65);
        var color = 'hsl(' + hue + ', 100%, 55%)';
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'transparent');
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 65, 0, Math.PI * 2);
        ctx.fill();
        hue = (hue + 2) % 360;
    }

    function tick() {
        if (!ctx) return;
        // Fade prior frame gently
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        rafId = requestAnimationFrame(tick);
    }

    function advanceToPhase2() {
        var phase1El = document.getElementById('phase1');
        var phase2El = document.getElementById('phase2');
        if (!phase1El || !phase2El) return;

        // Fade out Phase 1 over 500ms
        phase1El.style.transition = 'opacity 500ms ease';
        phase1El.style.opacity = '0';

        setTimeout(function () {
            phase1El.classList.remove('active');
            phase1El.style.opacity = '';
            phase1El.style.transition = '';
            phase2El.classList.add('active');

            Phase1.destroy();

            if (window.Phase2 && typeof Phase2.init === 'function') {
                Phase2.init();
            }
        }, 500);
    }

    // ── Public API ─────────────────────────────────────────────
    function init() {
        canvas = document.getElementById('trail-canvas');
        if (!canvas) { console.warn('Phase1: #trail-canvas not found'); return; }
        ctx = canvas.getContext('2d');

        resizeCanvas();

        // Fill black immediately so there's no flash
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Listeners
        _onMouseMove = function (e) { drawTrail(e.clientX, e.clientY); };
        _onResize = function () { resizeCanvas(); };

        window.addEventListener('mousemove', _onMouseMove);
        window.addEventListener('resize', _onResize);

        // Start render loop
        rafId = requestAnimationFrame(tick);

        // Auto-advance after 7500ms
        advTimer = setTimeout(advanceToPhase2, 7500);
    }

    function destroy() {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        if (advTimer) { clearTimeout(advTimer); advTimer = null; }
        if (_onMouseMove) { window.removeEventListener('mousemove', _onMouseMove); _onMouseMove = null; }
        if (_onResize) { window.removeEventListener('resize', _onResize); _onResize = null; }
        canvas = null;
        ctx = null;
    }

    return { init: init, destroy: destroy };
}());
