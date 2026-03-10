// landing/phase4-shell.js
// Exposes: window.Phase4Shell = { init, destroy }
// Responsibility: animated blobs + floating bubbles + bootstrap all tiles & eyes.

window.Phase4Shell = (function () {
    'use strict';

    // ── Private state ──────────────────────────────────────────
    var rafId = null;
    var bubbles = [];       // declared before any listeners reference it
    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;

    var _onMouseMove = null;

    // ── Blob colors ────────────────────────────────────────────
    var BLOB_COLORS = [
        'rgba(196,181,253,0.55)',  // lavender
        'rgba(249,168,212,0.50)',  // pink
        'rgba(167,139,250,0.45)',  // indigo
        'rgba(147,197,253,0.45)',  // sky
        'rgba(216,180,254,0.50)',  // lilac
    ];

    // ── Helpers ────────────────────────────────────────────────
    function rand(min, max) { return min + Math.random() * (max - min); }

    // ── createBlobs ────────────────────────────────────────────
    function createBlobs() {
        var layer = document.getElementById('blob-layer');
        if (!layer) return;

        for (var i = 0; i < BLOB_COLORS.length; i++) {
            var blob = document.createElement('div');
            var size = rand(200, 400);
            var dur = rand(12, 18);

            blob.style.cssText = [
                'position:absolute',
                'border-radius:50%',
                'filter:blur(60px)',
                'width:' + size + 'px',
                'height:' + size + 'px',
                'top:' + rand(0, 80) + '%',
                'left:' + rand(-5, 85) + '%',
                'background:' + BLOB_COLORS[i],
                'animation:morphBlob ' + dur + 's ease-in-out infinite',
                'animation-delay:-' + rand(0, 12) + 's',
                'will-change:transform',
            ].join(';');

            layer.appendChild(blob);
        }
    }

    // ── createBubbles ──────────────────────────────────────────
    function createBubbles() {
        var layer = document.getElementById('bubble-layer');
        if (!layer) return;

        bubbles = [];   // reset in case init is called again

        for (var i = 0; i < 14; i++) {
            var b = {
                x: Math.random() * 100,
                y: 100 + Math.random() * 50,
                size: 20 + Math.random() * 40,
                vx: (Math.random() - 0.5) * 0.3,
                vy: -(0.08 + Math.random() * 0.12),
                el: null,
            };

            var div = document.createElement('div');
            div.style.cssText = [
                'position:absolute',
                'border-radius:50%',
                'pointer-events:none',
                'border:2px solid rgba(124,58,237,0.25)',
                'background:rgba(255,255,255,0.18)',
                'width:' + b.size + 'px',
                'height:' + b.size + 'px',
                'left:' + b.x + 'vw',
                'top:' + b.y + 'vh',
                'will-change:left,top',
            ].join(';');

            layer.appendChild(div);
            b.el = div;
            bubbles.push(b);
        }
    }

    // ── Mouse tracking (after bubbles array is declared) ───────
    function setupMouse() {
        _onMouseMove = function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        document.addEventListener('mousemove', _onMouseMove);
    }

    // ── Bubble rAF loop ────────────────────────────────────────
    function bubbleTick() {
        var ww = window.innerWidth;
        var wh = window.innerHeight;

        for (var i = 0; i < bubbles.length; i++) {
            var b = bubbles[i];
            var bx = b.x * ww / 100;
            var by = b.y * wh / 100;
            var dx = bx - mouseX;
            var dy = by - mouseY;
            var dist = Math.sqrt(dx * dx + dy * dy);

            // Mouse repel
            if (dist < 120 && dist > 0) {
                var force = (120 - dist) / 120;
                b.vx += (dx / dist) * force * 0.8;
                b.vy += (dy / dist) * force * 0.8;
            }

            // Damping
            b.vx *= 0.97;
            b.vy *= 0.97;

            // Move
            b.x += b.vx;
            b.y += b.vy;

            // Reset bubble if it drifts off the top
            if (b.y < -10) {
                b.y = 105 + Math.random() * 10;
                b.x = Math.random() * 100;
                b.vx = (Math.random() - 0.5) * 0.3;
                b.vy = -(0.08 + Math.random() * 0.12);
            }

            // Apply position
            b.el.style.left = b.x + 'vw';
            b.el.style.top = b.y + 'vh';
        }

        rafId = requestAnimationFrame(bubbleTick);
    }

    function startBubbleLoop() {
        rafId = requestAnimationFrame(bubbleTick);
    }

    // ── Bootstrap all tile modules ─────────────────────────────
    function initAllTiles() {
        if (window.TileDate) { TileDate.init(); }
        if (window.TileCamera) { TileCamera.init(); }
        if (window.TileVoice) { TileVoice.init(); }
        if (window.TileScreen) { TileScreen.init(); }
        if (window.TileOTP) { TileOTP.init(); }
        if (window.FinalOverlay) { FinalOverlay.init(); }
        // Phase4Eyes is initialised by TileCamera after camera is verified
    }

    // ── Public API ─────────────────────────────────────────────
    function init() {
        createBlobs();
        createBubbles();
        setupMouse();
        startBubbleLoop();
        initAllTiles();

        // Handle Media Destination Button
        const btnDest = document.getElementById('btn-set-dest');
        const statusDest = document.getElementById('dest-status');
        if (btnDest) {
            btnDest.onclick = async () => {
                const ok = await window.MediaStorage.setDestination();
                if (ok) {
                    statusDest.textContent = '✅ Destination Set!';
                    btnDest.style.background = '#10b981';
                }
            };
        }
    }

    function destroy() {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        if (_onMouseMove) {
            document.removeEventListener('mousemove', _onMouseMove);
            _onMouseMove = null;
        }

        // Clear blob layer
        var blobLayer = document.getElementById('blob-layer');
        if (blobLayer) { blobLayer.innerHTML = ''; }

        // Clear bubble layer
        var bubbleLayer = document.getElementById('bubble-layer');
        if (bubbleLayer) { bubbleLayer.innerHTML = ''; }

        bubbles = [];
    }

    return { init: init, destroy: destroy };
}());
