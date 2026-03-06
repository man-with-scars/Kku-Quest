window.Phase2 = (function () {
    'use strict';

    var _onClickBox = null;
    var _styleEl = null;
    var _tapCount = 0;
    var _fireflies = [];
    var _mouse = { x: -9999, y: -9999 };
    var _rafId = null;
    var _isLocked = true;

    function createStyle() {
        var el = document.createElement('style');
        el.id = 'phase2-styles';
        el.textContent = [
            /* ─── Environment ─── */
            '#phase2 {',
            '  background: #000; overflow: hidden;',
            '  transition: background 2s ease;',
            '}',
            '#phase2.env-glow {',
            '  background: radial-gradient(circle at center, #1a0533 0%, #000 70%);',
            '  animation: envPulse 4s ease-in-out infinite;',
            '}',

            /* ─── Gift box wrapper: centred, single perspective source ─── */
            '#gift-box {',
            '  position: absolute; top: 50%; left: 50%;',
            '  transform: translate(-50%, -50%);',
            '  width: 300px; height: 300px;',
            '  cursor: pointer; z-index: 10;',
            '  display: flex; align-items: center; justify-content: center;',
            '  perspective: 900px;',
            '  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);',
            '}',
            '#gift-box.locked { cursor: default; }',
            '#gift-box.opening { pointer-events: none; }',

            /* ─── 3-D cube ─── */
            '.cube-world {',
            '  width: 160px; height: 160px; position: relative;',
            '  transform-style: preserve-3d;',
            '  animation: orbitalRotate 12s linear infinite;',
            '  transition: animation-play-state 0.5s, transform 1.5s ease;',
            '}',
            '#gift-box.opening .cube-world {',
            '  animation-play-state: paused;',
            '  transform: rotateX(-10deg) rotateY(20deg) scale(1.15);',
            '}',

            /* ─── Faces: all anchored at 0,0 inside cube-world ─── */
            '.face {',
            '  position: absolute; top: 0; left: 0;',
            '  width: 160px; height: 160px;',
            '  background: rgba(104, 38, 217, 0.18);',
            '  backdrop-filter: blur(10px);',
            '  border: 1.5px solid rgba(255,255,255,0.2);',
            '  box-shadow: inset 0 0 40px rgba(124,58,237,0.25);',
            '  display: flex; align-items: center; justify-content: center;',
            '  pointer-events: none; box-sizing: border-box;',
            '  transition: transform 1.5s cubic-bezier(0.4,0,0.2,1), opacity 1s ease;',
            '}',

            /*
             * Pure geometry – half-size = 80 px.
             * Top: first rotate the face flat, then push up 80 px in local-Z
             * (which after rotateX(90deg) becomes world-Y-up).
             * The face starts with its origin at (0,0) → geometric top of cube-world ✓
             */
            '.face.front  { transform: rotateY(  0deg) translateZ(80px); }',
            '.face.back   { transform: rotateY(180deg) translateZ(80px); }',
            '.face.right  { transform: rotateY( 90deg) translateZ(80px); }',
            '.face.left   { transform: rotateY(-90deg) translateZ(80px); }',
            '.face.top    { transform: rotateX( 90deg) translateZ(80px); transform-origin: 80px 80px; }',
            '.face.bottom { transform: rotateX(-90deg) translateZ(80px); transform-origin: 80px 80px; }',

            /* Lid slides up-and-out when opening */
            '#gift-box.opening .face.top {',
            '  transform: rotateX(90deg) translateZ(80px) translateY(-120px);',
            '  opacity: 0.25;',
            '}',

            /* ─── Engraved 13 ─── */
            '.engraved-13 {',
            '  font-family: "Poppins", sans-serif; font-weight: 800; font-size: 78px;',
            '  color: rgba(255,255,255,0.06);',
            '  text-shadow: -1px -1px 1px rgba(0,0,0,0.6), 1px 1px 1px rgba(255,255,255,0.18), 0 0 8px rgba(124,58,237,0.2);',
            '  user-select: none; letter-spacing: -5px;',
            '}',

            /* ─── Ribbons ─── */
            '.ribbon-face {',
            '  position: absolute; top: 0; left: 0;',
            '  background: linear-gradient(90deg, #7C3AED, #a855f7, #7C3AED);',
            '  border: 1px solid rgba(255,255,255,0.1);',
            '  opacity: 0.85; transition: opacity 1s ease;',
            '  pointer-events: none;',
            '}',
            '#gift-box.opening .ribbon-face { opacity: 0; }',
            /* Vertical strip wrapping front/back/top */
            '.rv-f { width:30px; height:160px; left:65px; transform: rotateY(  0deg) translateZ(81px); }',
            '.rv-b { width:30px; height:160px; left:65px; transform: rotateY(180deg) translateZ(81px); }',
            '.rv-t { width:30px; height:160px; left:65px; transform: rotateX( 90deg) translateZ(81px) rotateX(0deg); transform-origin: 80px 80px; }',
            /* Horizontal band wrapping all four sides */
            '.rh-f { width:160px; height:30px; top:65px; transform: rotateY(  0deg) translateZ(81px); }',
            '.rh-b { width:160px; height:30px; top:65px; transform: rotateY(180deg) translateZ(81px); }',
            '.rh-l { width:160px; height:30px; top:65px; transform: rotateY(-90deg) translateZ(81px); }',
            '.rh-r { width:160px; height:30px; top:65px; transform: rotateY( 90deg) translateZ(81px); }',

            /* ─── 3-D Bow ─── */
            '.cube-bow {',
            '  position: absolute; top: -22px; left: 50%;',
            '  transform: translateX(-50%) translateZ(82px);',
            '  width: 100px; height: 42px; transform-style: preserve-3d;',
            '  transition: opacity 0.8s ease, transform 0.8s ease; z-index: 20;',
            '}',
            '#gift-box.opening .cube-bow { opacity: 0; transform: translateX(-50%) translateZ(82px) translateY(-40px) rotateX(30deg); }',
            '.bow-loop {',
            '  position: absolute; width: 48px; height: 36px;',
            '  background: linear-gradient(135deg, #a855f7, #7C3AED);',
            '  border-radius: 50% 50% 0 50%; border: 1.5px solid rgba(255,255,255,0.28);',
            '}',
            '.bow-loop.left  { left:0;  transform: rotateZ(-12deg); }',
            '.bow-loop.right { right:0; transform: rotateZ(12deg) scaleX(-1); }',
            '.bow-center {',
            '  position: absolute; left:50%; top:50%; width:18px; height:18px;',
            '  background: #6D28D9; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.4);',
            '  transform: translate(-50%,-50%);',
            '  box-shadow: 0 0 8px rgba(168,85,247,0.6);',
            '}',

            /* ─── Volumetric Flame: 3 intersecting planes ─── */
            '.magic-flame-container {',
            '  position: absolute; top: 50%; left: 50%;',
            '  transform: translate3d(-50%, -50%, 0);',
            '  transform-style: preserve-3d;',
            '  transition: transform 2.2s cubic-bezier(0.4,0,0.2,1);',
            '}',
            '.flame-plane {',
            '  position: absolute; width: 48px; height: 76px;',
            '  background: radial-gradient(ellipse at 50% 100%, #fff 0%, #fcd34d 28%, #f59e0b 55%, rgba(245,158,11,0) 82%);',
            '  border-radius: 55% 55% 15% 15%;',
            '  transform-origin: 50% 100%;',
            '  filter: blur(3px);',
            '  mix-blend-mode: screen;',
            '  transform-style: preserve-3d;',
            '}',
            '.f-p1 { transform: translate(-50%, -100%) rotateY(  0deg); animation: flameA 0.18s ease-in-out infinite alternate; }',
            '.f-p2 { transform: translate(-50%, -100%) rotateY( 60deg); animation: flameA 0.22s ease-in-out infinite alternate-reverse; }',
            '.f-p3 { transform: translate(-50%, -100%) rotateY(120deg); animation: flameA 0.25s ease-in-out infinite alternate; }',

            '@keyframes flameA {',
            '  from { transform: translate(-50%,-100%) rotateY(var(--r,0deg)) scaleX(0.9) scaleY(0.95); opacity:.8; }',
            '  to   { transform: translate(-50%,-100%) rotateY(var(--r,0deg)) scaleX(1.1) scaleY(1.06); opacity:1; }',
            '}',
            /* Make CSS custom prop work for each plane */
            '.f-p1 { --r:  0deg; }',
            '.f-p2 { --r: 60deg; }',
            '.f-p3 { --r:120deg; }',

            /* opening: flame rises out of box */
            '#gift-box.opening .magic-flame-container {',
            '  transform: translate3d(-50%, -220%, 0) scale(1.6);',
            '}',
            /* final: flame expands to fill viewport */
            '#gift-box.final-expand .magic-flame-container {',
            '  transform: translate3d(-50%, -50%, 0) scale(80);',
            '}',
            '#gift-box.final-expand::after {',
            '  content:""; position:fixed; inset:0; background:#fff; z-index:1000;',
            '  opacity:0; animation:whiteOut 2s forwards;',
            '}',
            '@keyframes whiteOut { 0%{opacity:0} 55%{opacity:1} 100%{opacity:1} }',

            /* ─── Fireflies: fixed so their translate origin is screen (0,0) ─── */
            '.firefly {',
            '  position: fixed; top: 0; left: 0;',
            '  border-radius: 50%; pointer-events: none;',
            '  box-shadow: 0 0 6px 1px rgba(252,211,77,0.8);',
            '  background: #fcd34d; opacity: 0;',
            '  transition: opacity 1s ease;',
            '  will-change: transform;',
            '}',

            /* ─── Prompt ─── */
            '#gift-prompt {',
            '  position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%);',
            '  font-family: "Playfair Display", serif; font-size: 15px;',
            '  color: rgba(255,255,255,0.4); animation: textGlow 2.5s ease-in-out infinite;',
            '  letter-spacing: 2px; white-space: nowrap; transition: all 0.6s ease;',
            '}',
            '#gift-prompt.active { color: rgba(245,158,11,0.9); letter-spacing: 4px; }',

            '@keyframes orbitalRotate {',
            '  0%   { transform: rotateX(-15deg) rotateY(  0deg); }',
            '  100% { transform: rotateX(-15deg) rotateY(360deg); }',
            '}',
            '@keyframes envPulse  { 0%,100%{opacity:.7} 50%{opacity:1} }',
            '@keyframes textGlow  { 0%,100%{opacity:.3; transform: translateX(-50%) scale(1)} 50%{opacity:.85; transform: translateX(-50%) scale(1.04)} }'
        ].join('\n');
        document.head.appendChild(el);
        return el;
    }

    /* ─── Firefly system ─── */
    function initFireflies() {
        var phase2 = document.getElementById('phase2');
        var W = window.innerWidth, H = window.innerHeight;
        var COUNT = 55;

        for (var i = 0; i < COUNT; i++) {
            var roll = Math.random();
            var size = (roll < 0.1) ? (4 + Math.random() * 3) : (2 + Math.random() * 2.5);
            var el = document.createElement('div');
            el.className = 'firefly';
            el.style.width = size + 'px';
            el.style.height = size + 'px';
            phase2.appendChild(el);

            var vBase = (roll < 0.05) ? 2.5 : 0.8; // scouts vs normal
            _fireflies.push({
                el: el,
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * vBase * 2,
                vy: (Math.random() - 0.5) * vBase * 2,
                type: roll,             // 0-0.05 scout, 0.05-0.15 orbit, else drift
                angle: Math.random() * Math.PI * 2,
                radius: 30 + Math.random() * 60,
                cx: Math.random() * W,
                cy: Math.random() * H
            });
        }

        /* Reveal gradually */
        setTimeout(function () {
            _fireflies.forEach(function (f) {
                f.el.style.opacity = (Math.random() * 0.6 + 0.2).toFixed(2);
            });
        }, 800);
    }

    function updateFireflies() {
        var W = window.innerWidth, H = window.innerHeight;
        var t = Date.now() * 0.001;

        for (var i = 0; i < _fireflies.length; i++) {
            var f = _fireflies[i];

            if (f.type >= 0.05 && f.type < 0.18) {
                /* Orbit type – circles around its own reference point */
                f.angle += f.type * 0.04;
                f.x = f.cx + Math.cos(f.angle) * f.radius;
                f.y = f.cy + Math.sin(f.angle) * f.radius;
            } else {
                /* Drift + tiny wander */
                f.vx += (Math.random() - 0.5) * 0.04;
                f.vy += (Math.random() - 0.5) * 0.04;
                f.x += f.vx;
                f.y += f.vy;
            }

            /* Subtle mouse repulsion */
            var dx = f.x - _mouse.x;
            var dy = f.y - _mouse.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0 && dist < 130) {
                var force = ((130 - dist) / 130) * 0.18;
                f.vx += (dx / dist) * force;
                f.vy += (dy / dist) * force;
            }

            /* Speed cap */
            var spd = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
            if (spd > 3) { f.vx = f.vx / spd * 3; f.vy = f.vy / spd * 3; }
            f.vx *= 0.97; f.vy *= 0.97;

            /* Wrap around edges */
            if (f.x < -10) { f.x = W + 10; f.cx = f.x; }
            if (f.x > W + 10) { f.x = -10; f.cx = f.x; }
            if (f.y < -10) { f.y = H + 10; f.cy = f.y; }
            if (f.y > H + 10) { f.y = -10; f.cy = f.y; }

            f.el.style.transform = 'translate3d(' + (f.x | 0) + 'px,' + (f.y | 0) + 'px,0)';
        }
        _rafId = requestAnimationFrame(updateFireflies);
    }

    /* ─── HTML builder ─── */
    function buildHTML() {
        return [
            '<div class="cube-world">',
            '  <!-- Faces -->',
            '  <div class="face front"><div class="engraved-13">13</div></div>',
            '  <div class="face back"></div>',
            '  <div class="face left"></div>',
            '  <div class="face right"></div>',
            '  <div class="face top"></div>',
            '  <div class="face bottom"></div>',
            '  <!-- Volumetric flame -->',
            '  <div class="magic-flame-container">',
            '    <div class="flame-plane f-p1"></div>',
            '    <div class="flame-plane f-p2"></div>',
            '    <div class="flame-plane f-p3"></div>',
            '  </div>',
            '  <!-- Bow -->',
            '  <div class="cube-bow">',
            '    <div class="bow-loop left"></div>',
            '    <div class="bow-loop right"></div>',
            '    <div class="bow-center"></div>',
            '  </div>',
            '  <!-- Ribbons vertical -->',
            '  <div class="ribbon-face rv-f"></div>',
            '  <div class="ribbon-face rv-b"></div>',
            '  <div class="ribbon-face rv-t"></div>',
            '  <!-- Ribbons horizontal -->',
            '  <div class="ribbon-face rh-f"></div>',
            '  <div class="ribbon-face rh-b"></div>',
            '  <div class="ribbon-face rh-l"></div>',
            '  <div class="ribbon-face rh-r"></div>',
            '</div>'
        ].join('');
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

        phase2.classList.add('env-glow');
        box.classList.add('locked');
        box.innerHTML = buildHTML();

        prompt.textContent = 'Wait\u2026 Chu has planned a gift for you.';

        /* Fade in */
        box.style.opacity = '0';
        box.style.transition = 'opacity 1s ease';
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { box.style.opacity = '1'; });
        });
        setTimeout(function () {
            prompt.style.transition = 'opacity 1s ease';
            prompt.style.opacity = '1';
        }, 400);

        initFireflies();
        updateFireflies();

        /* Unlock after 7 s */
        setTimeout(function () {
            _isLocked = false;
            box.classList.remove('locked');
            prompt.textContent = 'tap to open \u2728';
            prompt.classList.add('active');
        }, 7000);

        window.addEventListener('mousemove', onMouseMove);

        _onClickBox = onBoxClick;
        box.addEventListener('click', _onClickBox);
    }

    function onMouseMove(e) { _mouse.x = e.clientX; _mouse.y = e.clientY; }

    function onBoxClick() {
        if (_isLocked) return;
        _tapCount++;
        var box = document.getElementById('gift-box');
        if (_tapCount >= 3) {
            triggerOpening();
        } else {
            var deg = (Math.random() * 10 - 5).toFixed(1);
            box.style.transform = 'translate(-50%,-50%) scale(1.08) rotate(' + deg + 'deg)';
            setTimeout(function () { box.style.transform = 'translate(-50%,-50%)'; }, 220);
        }
    }

    function triggerOpening() {
        var box = document.getElementById('gift-box');
        var prompt = document.getElementById('gift-prompt');
        box.classList.add('opening');
        if (prompt) { prompt.style.opacity = '0'; }

        /* Flame rise then white-out */
        setTimeout(function () {
            box.classList.add('final-expand');
            setTimeout(function () {
                Phase2.destroy();
                if (window.Phase3) window.Phase3.init(window.innerWidth / 2, window.innerHeight / 2);
            }, 2500);
        }, 2200);
    }

    function destroy() {
        window.removeEventListener('mousemove', onMouseMove);
        var box = document.getElementById('gift-box');
        if (box && _onClickBox) box.removeEventListener('click', _onClickBox);
        if (_styleEl && _styleEl.parentNode) _styleEl.parentNode.removeChild(_styleEl);
        if (_rafId) cancelAnimationFrame(_rafId);
        _fireflies.forEach(function (f) { if (f.el && f.el.parentNode) f.el.parentNode.removeChild(f.el); });
        _fireflies = [];
        _styleEl = null; _onClickBox = null;
        var phase2 = document.getElementById('phase2');
        if (phase2) phase2.classList.remove('env-glow');
    }

    return { init: init, destroy: destroy };
}());
