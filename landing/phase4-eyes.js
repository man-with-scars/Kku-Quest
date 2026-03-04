// landing/phase4-eyes.js
// Exposes: window.Phase4Eyes = { init, show, destroy }
// Responsibility: cartoon eyes on canvas. 10-state expression machine.
// Shown ONLY after camera permission granted — call Phase4Eyes.show() from tile-camera.js.

window.Phase4Eyes = (function () {
    'use strict';

    // ── Module-level refs (assigned inside init) ───────────────
    var canvas = null;
    var ctx = null;
    var raf = null;

    // Bound listener refs for cleanup
    var _onMouseMove = null;
    var _onMouseDown = null;

    // ── Expression table ───────────────────────────────────────
    var EXPR = {
        idle: { open: 0.85, browL: 0, browR: 0, browH: 2, blink: 4000 },
        slow: { open: 1.0, browL: 0, browR: 0, browH: 4, blink: 5000 },
        fast: { open: 1.3, browL: -0.3, browR: -0.3, browH: 8, blink: 6000 },
        zigzag: { open: 0.9, browL: -0.2, browR: 0.15, browH: 3, blink: 3500 },
        hover: { open: 0.95, browL: 0, browR: -0.25, browH: 5, blink: 5500 },
        center: { open: 1.0, browL: 0.1, browR: 0.1, browH: 3, blink: 4500 },
        click: { open: 0.1, browL: 0.2, browR: 0.2, browH: 6, blink: 0 },
        annoyed: { open: 0.6, browL: 0.4, browR: 0.4, browH: -2, blink: 3000 },
        corner: { open: 1.2, browL: -0.1, browR: -0.1, browH: 10, blink: 7000 },
        focus: { open: 0.75, browL: 0.15, browR: 0.15, browH: 0, blink: 6000 },
    };

    // ── Public API ─────────────────────────────────────────────
    function init() {
        canvas = document.getElementById('eyes-canvas');
        if (!canvas) { console.warn('Phase4Eyes: #eyes-canvas not found'); return; }
        ctx = canvas.getContext('2d');

        // ── State variables (all declared before any use) ─────────
        var mouseX = window.innerWidth / 2;
        var mouseY = window.innerHeight / 2;
        var prevMouseX = mouseX;
        var prevMouseY = mouseY;

        var pupilLX = 0, pupilLY = 0;
        var pupilRX = 0, pupilRY = 0;

        var blinkT = 3000;   // ms until next blink attempt
        var blinkDur = 180;
        var blinkPhase = 0;
        var isBlinking = false;
        var eyeOpen = 1.0;

        var state = 'idle';
        var lastMoveTime = Date.now();
        var clickCount = 0;

        var speedHistory = [];
        var dirChanges = 0;
        var lastDir = { x: 0, y: 0 };

        var lastTime = 0;

        // ── Mouse tracking ────────────────────────────────────────
        _onMouseMove = function (e) {
            var vx = e.clientX - prevMouseX;
            var vy = e.clientY - prevMouseY;
            var speed = Math.sqrt(vx * vx + vy * vy);

            speedHistory.push(speed);
            if (speedHistory.length > 10) { speedHistory.shift(); }

            // Direction-change detection (zigzag)
            if (speed > 3) {
                var newDirX = vx > 0 ? 1 : -1;
                var newDirY = vy > 0 ? 1 : -1;
                if (lastDir.x !== 0 && newDirX !== lastDir.x) { dirChanges++; }
                lastDir.x = newDirX;
                lastDir.y = newDirY;
                if (dirChanges > 5) { dirChanges = 0; }   // reset after detection
            }

            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
            mouseX = e.clientX;
            mouseY = e.clientY;
            lastMoveTime = Date.now();
        };

        _onMouseDown = function () {
            clickCount++;
            setTimeout(function () {
                clickCount = Math.max(0, clickCount - 1);
            }, 1000);
        };

        document.addEventListener('mousemove', _onMouseMove);
        document.addEventListener('mousedown', _onMouseDown);

        // OTP box focus/blur → expression state
        document.querySelectorAll('.otp-wrap input').forEach(function (b) {
            b.addEventListener('focus', function () { state = 'focus'; });
            b.addEventListener('blur', function () { if (state === 'focus') state = 'slow'; });
        });

        // Tile hover → expression state
        document.querySelectorAll('.tile').forEach(function (tile) {
            tile.addEventListener('mouseenter', function () {
                if (state !== 'focus') { state = 'hover'; }
            });
            tile.addEventListener('mouseleave', function () {
                if (state === 'hover') { state = 'slow'; }
            });
        });

        // ── State machine update ──────────────────────────────────
        function updateState() {
            var i;
            var total = 0;
            for (i = 0; i < speedHistory.length; i++) { total += speedHistory[i]; }
            var avgSpeed = total / (speedHistory.length || 1);
            var timeSinceMove = Date.now() - lastMoveTime;

            var cx = mouseX / window.innerWidth;
            var cy = mouseY / window.innerHeight;
            var inCorner = (cx < 0.08 || cx > 0.92) && (cy < 0.08 || cy > 0.92);
            var inCenter = Math.abs(cx - 0.5) < 0.1 && Math.abs(cy - 0.5) < 0.1;

            if (state === 'focus') { return; }
            if (clickCount >= 5) { state = 'annoyed'; return; }
            if (inCorner) { state = 'corner'; return; }
            if (dirChanges >= 5) { state = 'zigzag'; dirChanges = 0; return; }
            if (timeSinceMove > 3500) { state = 'idle'; return; }
            if (inCenter && timeSinceMove > 2000) { state = 'center'; return; }
            if (avgSpeed > 15) { state = 'fast'; return; }
            if (state !== 'hover') { state = 'slow'; }
        }

        // ── Pupil tracking ────────────────────────────────────────
        function updatePupils() {
            var rect = canvas.getBoundingClientRect();
            var canvasCX = rect.left + rect.width / 2;
            var canvasCY = rect.top + rect.height / 2;

            var dx = mouseX - canvasCX;
            var dy = mouseY - canvasCY;
            var targetX = Math.max(-1, Math.min(1, dx / 250));
            var targetY = Math.max(-1, Math.min(1, dy / 200));

            pupilLX += (targetX - pupilLX) * 0.1;
            pupilLY += (targetY - pupilLY) * 0.1;
            pupilRX += (targetX - pupilRX) * 0.1;
            pupilRY += (targetY - pupilRY) * 0.1;
        }

        // ── Blink logic ───────────────────────────────────────────
        function updateBlink(dt) {
            var expr = EXPR[state];

            blinkT -= dt;
            if (blinkT <= 0 && !isBlinking) {
                blinkT = expr.blink + Math.random() * 2000;
                if (expr.blink === 0) { return; }   // click state — no random blink
                isBlinking = true;
                blinkDur = 180;
                blinkPhase = 0;
            }

            if (isBlinking) {
                blinkPhase += dt;
                if (blinkPhase < 80) {
                    eyeOpen = 1.0 - (blinkPhase / 80) * (1 - expr.open * 0.1);
                } else {
                    eyeOpen = ((blinkPhase - 80) / 100) * expr.open;
                    if (blinkPhase >= blinkDur) {
                        isBlinking = false;
                        eyeOpen = expr.open;
                    }
                }
            } else {
                eyeOpen += (expr.open - eyeOpen) * 0.15;
            }
        }

        // ── Draw helpers ──────────────────────────────────────────
        function drawEye(ex, ey, px, py, side) {
            var expr = EXPR[state];
            var open = Math.max(0.05, eyeOpen);
            var rX = 26;
            var rY = 20 * open;

            // Eye white
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(ex, ey, rX, rY, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#FAFAF6';
            ctx.fill();
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 2.5;
            ctx.stroke();
            ctx.restore();

            // Clip future draws to eye white
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(ex, ey, rX, rY, 0, 0, Math.PI * 2);
            ctx.clip();

            // Pupil
            var rawPupilX = ex + px * 10;
            var rawPupilY = ey + py * 7;
            var pR = 11 * (state === 'fast' ? 1.15 : 1.0);

            ctx.beginPath();
            ctx.arc(rawPupilX, rawPupilY, pR, 0, Math.PI * 2);
            ctx.fillStyle = '#111';
            ctx.fill();

            // Highlight
            ctx.beginPath();
            ctx.arc(rawPupilX + 4, rawPupilY - 3, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.92)';
            ctx.fill();

            ctx.restore();   // end clip

            // Eyebrow (outside clip — sits above the eye)
            var bAngle = (side === 'left') ? expr.browL : expr.browR;
            var bH = ey - rY - 8 - expr.browH;

            ctx.save();
            ctx.translate(ex, bH);
            ctx.rotate(bAngle);
            ctx.beginPath();
            ctx.moveTo(-18, 0);
            ctx.quadraticCurveTo(0, -5, 18, 0);
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 3.5;
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.restore();
        }

        function draw() {
            ctx.clearRect(0, 0, 180, 90);
            drawEye(52, 45, pupilLX, pupilLY, 'left');
            drawEye(128, 45, pupilRX, pupilRY, 'right');
        }

        // ── rAF loop ──────────────────────────────────────────────
        function loop(ts) {
            var dt = lastTime ? (ts - lastTime) : 16;
            lastTime = ts;

            updateState();
            updatePupils();
            updateBlink(dt);
            draw();

            raf = requestAnimationFrame(loop);
        }

        raf = requestAnimationFrame(loop);
    }

    function show() {
        var eyesCanvas = document.getElementById('eyes-canvas');
        var placeholder = document.getElementById('eyes-placeholder');
        if (eyesCanvas) { eyesCanvas.style.display = 'block'; }
        if (placeholder) { placeholder.style.display = 'none'; }
    }

    function destroy() {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        if (_onMouseMove) { document.removeEventListener('mousemove', _onMouseMove); _onMouseMove = null; }
        if (_onMouseDown) { document.removeEventListener('mousedown', _onMouseDown); _onMouseDown = null; }
        canvas = null;
        ctx = null;
    }

    return { init: init, show: show, destroy: destroy };
}());
