window.Phase2 = (function () {
    'use strict';

    /* ─── State ─── */
    var _onClickBox = null;
    var _onKeyDown = null;
    var _styleEl = null;
    var _tapCount = 0;
    var _fireflies = [];
    var _mouse = { x: -9999, y: -9999 };
    var _rafId = null;
    var _isLocked = true;
    var _unlockTimer = null;

    /* Dev-mode: persisted in sessionStorage so it survives hot-reload but resets on new session */
    var _DEV_CODE = '00365';
    var _devUnlocked = (sessionStorage.getItem('devMode') === '1');

    /* ─── Styles ─── */
    function createStyle() {
        var el = document.createElement('style');
        el.id = 'phase2-styles';
        el.textContent = [
            /*
             * #phase2 is already: display:flex; flex-direction:column;
             * align-items:center; justify-content:center  (from index.html)
             * So we do NOT use position:absolute here – let flex do the centering.
             */
            '#phase2 {',
            '  background: radial-gradient(circle at center, #130223 0%, #000 70%) !important;',
            '  animation: envPulse 4s ease-in-out infinite;',
            '  overflow: hidden; position: relative;',
            '}',

            /* Gift-box: a normal flex child – width/height/cursor override */
            '#gift-box {',
            '  position: relative;',
            '  width: 220px; height: 220px;',
            '  cursor: pointer; z-index: 10;',
            '  display: flex; align-items: center; justify-content: center;',
            '  perspective: 900px;',
            '  animation: boxFloat 3.5s ease-in-out infinite;',
            '  filter: drop-shadow(0 0 28px rgba(124,58,237,0.45));',
            '  transition: transform 0.5s cubic-bezier(0.175,0.885,0.32,1.275), filter 0.5s;',
            '}',
            '#gift-box.locked { cursor: not-allowed; }',
            '#gift-box.opening { pointer-events: none; animation: none; }',
            '#gift-box:not(.locked):hover { filter: drop-shadow(0 0 44px rgba(168,85,247,0.7)); }',

            /* 3-D World */
            '.cube-world {',
            '  width: 160px; height: 160px; position: relative;',
            '  transform-style: preserve-3d;',
            '  animation: orbitalRotate 12s linear infinite;',
            '  transition: transform 1.2s ease, animation-play-state 0.3s;',
            '}',
            '#gift-box.opening .cube-world {',
            '  animation-play-state: paused;',
            '  transform: rotateX(-12deg) rotateY(25deg) scale(1.1);',
            '}',

            /* Faces – every face anchored at top:0 left:0 within cube-world */
            '.face {',
            '  position: absolute; top: 0; left: 0;',
            '  width: 160px; height: 160px;',
            '  background: rgba(104,38,217,0.16);',
            '  backdrop-filter: blur(10px);',
            '  border: 1.5px solid rgba(255,255,255,0.18);',
            '  box-shadow: inset 0 0 40px rgba(124,58,237,0.22);',
            '  pointer-events: none; box-sizing: border-box;',
            '  display: flex; align-items: center; justify-content: center;',
            '  transition: transform 1.4s cubic-bezier(0.4,0,0.2,1), opacity 1s;',
            '}',

            /* Cube half-size = 80 px */
            '.face.front  { transform: rotateY(  0deg) translateZ(80px); }',
            '.face.back   { transform: rotateY(180deg) translateZ(80px); }',
            '.face.right  { transform: rotateY( 90deg) translateZ(80px); }',
            '.face.left   { transform: rotateY(-90deg) translateZ(80px); }',
            /* Lid – pivot at the midpoint of the face */
            '.face.top    { transform: rotateX( 90deg) translateZ(80px); transform-origin: center center; }',
            '.face.bottom { transform: rotateX(-90deg) translateZ(80px); }',

            /* Lid opens: rotates further back and slides upward */
            '#gift-box.opening .face.top {',
            '  transform: rotateX(130deg) translateZ(80px) translateY(-60px);',
            '  opacity: 0.2;',
            '}',

            /* Engraved 13 */
            '.engraved-13 {',
            '  font-family: "Poppins", sans-serif; font-weight: 800; font-size: 76px;',
            '  color: rgba(255,255,255,0.05);',
            '  text-shadow: -1px -1px 1px rgba(0,0,0,0.6), 1px 1px 1px rgba(255,255,255,0.18);',
            '  user-select: none; letter-spacing: -5px;',
            '}',

            /* Ribbons */
            '.ribbon-face {',
            '  position: absolute; top: 0; left: 0;',
            '  background: linear-gradient(90deg,#7C3AED,#a855f7,#7C3AED);',
            '  border: 1px solid rgba(255,255,255,0.1); opacity: 0.82;',
            '  pointer-events: none; transition: opacity 0.9s;',
            '}',
            '#gift-box.opening .ribbon-face { opacity: 0; }',
            '.rv-f { width:28px; height:160px; left:66px; transform: rotateY(  0deg) translateZ(81px); }',
            '.rv-b { width:28px; height:160px; left:66px; transform: rotateY(180deg) translateZ(81px); }',
            '.rv-t { width:28px; height:160px; left:66px; transform: rotateX(90deg) translateZ(81px); }',
            '.rh-f { width:160px; height:28px; top:66px;  transform: rotateY(  0deg) translateZ(81px); }',
            '.rh-b { width:160px; height:28px; top:66px;  transform: rotateY(180deg) translateZ(81px); }',
            '.rh-l { width:160px; height:28px; top:66px;  transform: rotateY(-90deg) translateZ(81px); }',
            '.rh-r { width:160px; height:28px; top:66px;  transform: rotateY( 90deg) translateZ(81px); }',

            /* 3-D Bow */
            '.cube-bow {',
            '  position: absolute; top: -22px; left: 50%;',
            '  transform: translateX(-50%) translateZ(82px);',
            '  width: 100px; height: 42px;',
            '  transform-style: preserve-3d;',
            '  transition: opacity 0.7s, transform 0.7s;',
            '}',
            '#gift-box.opening .cube-bow { opacity: 0; transform: translateX(-50%) translateZ(82px) translateY(-50px) rotateX(40deg); }',
            '.bow-loop {',
            '  position: absolute; width: 46px; height: 34px;',
            '  background: linear-gradient(135deg,#a855f7,#7C3AED);',
            '  border-radius: 50% 50% 0 50%;',
            '  border: 1.5px solid rgba(255,255,255,0.25);',
            '}',
            '.bow-loop.left  { left:  0; transform: rotateZ(-12deg); }',
            '.bow-loop.right { right: 0; transform: rotateZ(12deg) scaleX(-1); }',
            '.bow-center {',
            '  position: absolute; left:50%; top:50%;',
            '  width: 17px; height: 17px; background: #6D28D9;',
            '  border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.4);',
            '  transform: translate(-50%,-50%);',
            '  box-shadow: 0 0 8px rgba(168,85,247,0.6);',
            '}',

            /* ── Volumetric 3D Flame ──
             * Three teardrop planes at 0 / 60 / 120 degrees.
             * The container lives inside the cube and uses position:absolute.
             * During opening we switch the container to position:fixed and
             * grow it to 120vmax so it really fills the screen.
             */
            '.magic-flame-container {',
            '  position: absolute; top: 50%; left: 50%;',
            '  width: 0; height: 0;',   /* zero-size anchor */
            '  transform-style: preserve-3d;',
            '  transition: none;',
            '}',
            '.flame-plane {',
            '  position: absolute;',
            '  width: 46px; height: 74px;',
            '  margin-left: -23px; margin-top: -74px;', /* anchor bottom-center at origin */
            '  background: radial-gradient(ellipse at 50% 95%, #fff 0%, #fcd34d 28%, #f59e0b 55%, rgba(245,158,11,0) 80%);',
            '  border-radius: 55% 55% 15% 15%;',
            '  filter: blur(3px);',
            '  mix-blend-mode: screen;',
            '}',
            '.f-p1 { transform: rotateY(  0deg); animation: flameA 0.18s ease-in-out infinite alternate; }',
            '.f-p2 { transform: rotateY( 60deg); animation: flameA 0.22s ease-in-out infinite alternate-reverse; }',
            '.f-p3 { transform: rotateY(120deg); animation: flameA 0.26s ease-in-out infinite alternate; }',

            '@keyframes flameA {',
            '  from { transform: rotateY(var(--fry,0deg)) scaleX(0.88) scaleY(0.94); opacity:.82; }',
            '  to   { transform: rotateY(var(--fry,0deg)) scaleX(1.12) scaleY(1.07); opacity:1;   }',
            '}',
            '.f-p1 { --fry:  0deg; }',
            '.f-p2 { --fry: 60deg; }',
            '.f-p3 { --fry:120deg; }',

            /*
             * Opening ─ step 1: flame rises out of the box.
             * We do this in JS by switching to position:fixed and animating
             * a growing radial glow overlay instead of scaling the tiny planes,
             * which avoids the "stops midway" artefact.
             */
            '.flame-overlay {',
            '  position: fixed; inset: 0; pointer-events: none; z-index: 900;',
            '  background: radial-gradient(circle at var(--ox, 50%) var(--oy, 40%),',
            '     #fff 0%, #fcd34d 15%, #f59e0b 35%, transparent 65%);',
            '  opacity: 0; transition: opacity 0.15s ease;',
            '}',

            /* Fireflies – fixed so translate starts at true screen (0,0) */
            '.firefly {',
            '  position: fixed; top: 0; left: 0;',
            '  border-radius: 50%; pointer-events: none;',
            '  background: #fcd34d; opacity: 0;',
            '  box-shadow: 0 0 6px 1px rgba(252,211,77,0.8);',
            '  transition: opacity 1s ease; will-change: transform;',
            '}',

            /* Prompt – flex child of #phase2, appears directly below box */
            '#gift-prompt {',
            '  font-family: "Playfair Display", serif; font-size: 15px;',
            '  color: rgba(255,255,255,0.35); letter-spacing: 2px;',
            '  animation: textGlow 2.5s ease-in-out infinite;',
            '  text-align: center; max-width: 90vw;',
            '  transition: color 0.6s, letter-spacing 0.6s;',
            '}',
            '#gift-prompt.active { color: rgba(245,158,11,0.9); letter-spacing: 4px; }',

            /* Tap feedback ring */
            '.tap-ring {',
            '  position: fixed; border-radius: 50%;',
            '  border: 2px solid rgba(168,85,247,0.6);',
            '  pointer-events: none; z-index: 50;',
            '  animation: ringOut 0.5s ease-out forwards;',
            '}',
            '@keyframes ringOut { from{width:0;height:0;opacity:.9} to{width:120px;height:120px;opacity:0;margin:-60px} }',

            /* Keyframes */
            '@keyframes orbitalRotate { from{transform:rotateX(-15deg) rotateY(0deg)} to{transform:rotateX(-15deg) rotateY(360deg)} }',
            '@keyframes boxFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }',
            '@keyframes envPulse  { 0%,100%{background-size:100% 100%} 50%{background-size:110% 110%} }',
            '@keyframes textGlow  { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:.85;transform:scale(1.04)} }',

            /* Dev-mode toast */
            '#dev-toast {',
            '  position: fixed; bottom: 20px; right: 20px; z-index: 9999;',
            '  background: rgba(124,58,237,0.85); color:#fff;',
            '  font-family:"Poppins",sans-serif; font-size:12px; padding:8px 14px;',
            '  border-radius: 8px; pointer-events:none; opacity:0;',
            '  transition: opacity 0.4s;',
            '}'
        ].join('\n');
        document.head.appendChild(el);
        return el;
    }

    /* ─── Fireflies ─── */
    function initFireflies() {
        var phase2 = document.getElementById('phase2');
        var W = window.innerWidth, H = window.innerHeight;
        for (var i = 0; i < 55; i++) {
            var roll = Math.random();
            var size = (roll < 0.10) ? (4.5 + Math.random() * 2.5) : (2 + Math.random() * 2);
            var el = document.createElement('div');
            el.className = 'firefly';
            el.style.width = el.style.height = size + 'px';
            phase2.appendChild(el);
            var scout = (roll < 0.05);
            _fireflies.push({
                el: el,
                x: Math.random() * W, y: Math.random() * H,
                vx: (Math.random() - 0.5) * (scout ? 3.5 : 1.2),
                vy: (Math.random() - 0.5) * (scout ? 3.5 : 1.2),
                type: roll,
                angle: Math.random() * Math.PI * 2,
                radius: 30 + Math.random() * 70,
                cx: Math.random() * W, cy: Math.random() * H
            });
        }
        setTimeout(function () {
            _fireflies.forEach(function (f) { f.el.style.opacity = (Math.random() * 0.55 + 0.2).toFixed(2); });
        }, 900);
    }

    function updateFireflies() {
        var W = window.innerWidth, H = window.innerHeight;
        for (var i = 0; i < _fireflies.length; i++) {
            var f = _fireflies[i];
            if (f.type >= 0.05 && f.type < 0.18) {
                f.angle += 0.018 + f.type * 0.01;
                f.x = f.cx + Math.cos(f.angle) * f.radius;
                f.y = f.cy + Math.sin(f.angle) * f.radius;
            } else {
                f.vx += (Math.random() - 0.5) * 0.04;
                f.vy += (Math.random() - 0.5) * 0.04;
                var spd = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
                var cap = (f.type < 0.05) ? 3.5 : 1.5;
                if (spd > cap) { f.vx = f.vx / spd * cap; f.vy = f.vy / spd * cap; }
                f.vx *= 0.97; f.vy *= 0.97;
                f.x += f.vx; f.y += f.vy;
            }
            /* Mouse repulsion */
            var dx = f.x - _mouse.x, dy = f.y - _mouse.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0 && dist < 130) {
                var force = (130 - dist) / 130 * 0.18;
                f.vx += dx / dist * force; f.vy += dy / dist * force;
            }
            /* Wrap */
            if (f.x < -10) { f.x = W + 10; f.cx = f.x; }
            if (f.x > W + 10) { f.x = -10; f.cx = f.x; }
            if (f.y < -10) { f.y = H + 10; f.cy = f.y; }
            if (f.y > H + 10) { f.y = -10; f.cy = f.y; }
            f.el.style.transform = 'translate3d(' + (f.x | 0) + 'px,' + (f.y | 0) + 'px,0)';
        }
        _rafId = requestAnimationFrame(updateFireflies);
    }

    /* ─── HTML ─── */
    function buildHTML() {
        return [
            '<div class="cube-world">',
            '  <div class="face front"><div class="engraved-13">13</div></div>',
            '  <div class="face back"></div>',
            '  <div class="face left"></div>',
            '  <div class="face right"></div>',
            '  <div class="face top"></div>',
            '  <div class="face bottom"></div>',
            '  <div class="magic-flame-container">',
            '    <div class="flame-plane f-p1"></div>',
            '    <div class="flame-plane f-p2"></div>',
            '    <div class="flame-plane f-p3"></div>',
            '  </div>',
            '  <div class="cube-bow">',
            '    <div class="bow-loop left"></div>',
            '    <div class="bow-loop right"></div>',
            '    <div class="bow-center"></div>',
            '  </div>',
            '  <div class="ribbon-face rv-f"></div>',
            '  <div class="ribbon-face rv-b"></div>',
            '  <div class="ribbon-face rv-t"></div>',
            '  <div class="ribbon-face rh-f"></div>',
            '  <div class="ribbon-face rh-b"></div>',
            '  <div class="ribbon-face rh-l"></div>',
            '  <div class="ribbon-face rh-r"></div>',
            '</div>'
        ].join('');
    }

    /* ─── Dev toast helper ─── */
    function showToast(msg) {
        var t = document.getElementById('dev-toast') || (function () {
            var el = document.createElement('div'); el.id = 'dev-toast';
            document.body.appendChild(el); return el;
        }());
        t.textContent = msg; t.style.opacity = '1';
        setTimeout(function () { t.style.opacity = '0'; }, 2000);
    }

    /* ─── Init ─── */
    function init() {
        _styleEl = createStyle();
        _tapCount = 0;
        _isLocked = true;

        var phase2 = document.getElementById('phase2');
        var box = document.getElementById('gift-box');
        var prompt = document.getElementById('gift-prompt');
        if (!phase2 || !box || !prompt) return;

        /* Reset */
        box.className = 'locked';
        box.innerHTML = buildHTML();
        prompt.textContent = 'Wait\u2026 Chu has planned a gift for you.';
        prompt.className = '';

        initFireflies();
        updateFireflies();

        /* Unlock after exactly 7 seconds – hard lock in click handler */
        _unlockTimer = setTimeout(function () {
            _isLocked = false;
            box.classList.remove('locked');
            prompt.textContent = 'tap to open \u2728';
            prompt.classList.add('active');
        }, 7000);

        /* Mouse tracking for firefly repulsion */
        window.addEventListener('mousemove', onMouseMove);

        /* Box click */
        _onClickBox = onBoxClick;
        box.addEventListener('click', _onClickBox);

        /* Dev / God-mode: Alt key */
        _onKeyDown = onKeyDown;
        window.addEventListener('keydown', _onKeyDown);
    }

    /* ─── Mouse ─── */
    function onMouseMove(e) { _mouse.x = e.clientX; _mouse.y = e.clientY; }

    /* ─── Click ─── */
    function onBoxClick(e) {
        if (_isLocked) return; /* Hard 7-s block */

        /* Visual tap ring */
        spawnRing(e.clientX, e.clientY);

        _tapCount++;
        if (_tapCount >= 3) {
            triggerOpening();
        } else {
            var deg = (Math.random() * 10 - 5).toFixed(1);
            var box = document.getElementById('gift-box');
            box.style.transform = 'translateY(-12px) scale(1.08) rotate(' + deg + 'deg)';
            setTimeout(function () { box.style.transform = ''; }, 230);
        }
    }

    function spawnRing(x, y) {
        var r = document.createElement('div');
        r.className = 'tap-ring';
        r.style.left = x + 'px'; r.style.top = y + 'px';
        document.body.appendChild(r);
        setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r); }, 600);
    }

    /* ─── Opening Cinematic ─── */
    function triggerOpening() {
        var box = document.getElementById('gift-box');
        var prompt = document.getElementById('gift-prompt');
        if (!box) return;

        box.classList.add('opening');
        if (prompt) prompt.style.opacity = '0';

        /* Build flame overlay anchored to box center in viewport */
        var overlay = document.createElement('div');
        overlay.className = 'flame-overlay';
        var rect = box.getBoundingClientRect();
        var cx = ((rect.left + rect.right) / 2 / window.innerWidth * 100).toFixed(1) + '%';
        var cy = ((rect.top + rect.bottom) / 2 / window.innerHeight * 100).toFixed(1) + '%';
        overlay.style.setProperty('--ox', cx);
        overlay.style.setProperty('--oy', cy);
        document.body.appendChild(overlay);

        /* Ramp opacity: 0 → 0.4 (rise), then 0.4 → 1 (overwhelm) */
        var start = null;
        var RISE_MS = 2000, FILL_MS = 1500;
        function animOverlay(ts) {
            if (!start) start = ts;
            var elapsed = ts - start;
            if (elapsed < RISE_MS) {
                overlay.style.opacity = (elapsed / RISE_MS * 0.5).toFixed(3);
                requestAnimationFrame(animOverlay);
            } else if (elapsed < RISE_MS + FILL_MS) {
                var t2 = (elapsed - RISE_MS) / FILL_MS;
                overlay.style.opacity = (0.5 + t2 * 0.5).toFixed(3);
                requestAnimationFrame(animOverlay);
            } else {
                overlay.style.opacity = '1';
                /* Hand off to Phase 3 */
                setTimeout(function () {
                    Phase2.destroy();
                    if (window.Phase3) window.Phase3.init(window.innerWidth / 2, window.innerHeight / 2);
                }, 300);
            }
        }
        requestAnimationFrame(animOverlay);
    }

    /* ─── Dev / God mode ─── */
    function onKeyDown(e) {
        if (e.key !== 'Alt') return;
        e.preventDefault();

        if (!_devUnlocked) {
            /* First-time verification */
            var code = window.prompt('Dev Access Code:');
            if (code === null) return;
            if (code.trim() === _DEV_CODE) {
                _devUnlocked = true;
                sessionStorage.setItem('devMode', '1');
                showToast('\uD83D\uDD13 Dev Mode Unlocked');
            } else {
                showToast('\u274C Wrong code');
            }
            return;
        }

        /* Already unlocked – skip to next phase */
        showToast('\u23E9 Skipping to next phase\u2026');
        clearTimeout(_unlockTimer);
        _isLocked = false;
        triggerOpening();
    }

    /* ─── Destroy ─── */
    function destroy() {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('keydown', _onKeyDown);
        var box = document.getElementById('gift-box');
        if (box && _onClickBox) box.removeEventListener('click', _onClickBox);
        if (_styleEl && _styleEl.parentNode) _styleEl.parentNode.removeChild(_styleEl);
        if (_rafId) cancelAnimationFrame(_rafId);
        if (_unlockTimer) clearTimeout(_unlockTimer);
        _fireflies.forEach(function (f) { if (f.el && f.el.parentNode) f.el.parentNode.removeChild(f.el); });
        _fireflies = [];
        _styleEl = null;
        _onClickBox = null;
        _onKeyDown = null;
        var phase2 = document.getElementById('phase2');
        if (phase2) phase2.style.background = '';
        /* Remove lingering overlays */
        var ov = document.querySelector('.flame-overlay');
        if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    }

    return { init: init, destroy: destroy };
}());
