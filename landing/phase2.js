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

    var _DEV_CODE = '00365';
    var _devUnlocked = (sessionStorage.getItem('devMode') === '1');

    /* ─── Styles ─── */
    function createStyle() {
        var el = document.createElement('style');
        el.id = 'phase2-styles';
        el.textContent = [
            /* Environment — do NOT set position, let .phase handle it */
            '#phase2 {',
            '  background: radial-gradient(circle at center, #0d0020 0%, #000 75%) !important;',
            '  overflow: hidden;',
            '}',

            /* Box: flex child of #phase2 column-flex container */
            '#gift-box {',
            '  position: relative !important;',
            '  top: auto !important; left: auto !important;',
            '  width: 220px !important; height: 220px !important;',
            '  transform: none !important; cursor: pointer !important;',
            '  display: flex !important; align-items: center !important; justify-content: center !important;',
            '  perspective: 900px;',
            '  animation: boxFloat2 3.5s ease-in-out infinite !important;',
            '  filter: drop-shadow(0 0 32px rgba(124,58,237,0.55));',
            '  transition: filter 0.5s;',
            '}',
            '#gift-box.locked { cursor: not-allowed !important; }',
            '#gift-box.opening { pointer-events: none !important; animation: none !important; }',

            /* Rotating 3D cube */
            '.cube-world {',
            '  width: 160px; height: 160px; position: relative;',
            '  transform-style: preserve-3d;',
            '  animation: orbitalRotate2 12s linear infinite;',
            '  transition: transform 1.2s ease;',
            '}',
            '#gift-box.opening .cube-world {',
            '  animation-play-state: paused;',
            '  transform: rotateX(-12deg) rotateY(25deg) scale(1.1);',
            '}',

            /* Faces */
            '.face {',
            '  position: absolute; top: 0; left: 0;',
            '  width: 160px; height: 160px;',
            '  background: rgba(100,35,210,0.15);',
            '  backdrop-filter: blur(8px);',
            '  border: 1.5px solid rgba(255,255,255,0.22);',
            '  pointer-events: none; box-sizing: border-box;',
            '  display: flex; align-items: center; justify-content: center;',
            '  transition: transform 1.4s cubic-bezier(0.4,0,0.2,1), opacity 1s;',
            '}',

            /* Give each inner wall a warm inner-glow tint to simulate 3D ambient light */
            '.face::after {',
            '  content: ""; position: absolute; inset: 0;',
            '  background: radial-gradient(circle at center, rgba(240,160,20,0.12) 0%, rgba(124,58,237,0.05) 60%, transparent 100%);',
            '  animation: innerGlowFace 3s ease-in-out infinite alternate;',
            '}',
            '@keyframes innerGlowFace {',
            '  from { opacity:.5; } to { opacity:1; }',
            '}',

            '.face.front  { transform: rotateY(  0deg) translateZ(80px); }',
            '.face.back   { transform: rotateY(180deg) translateZ(80px); }',
            '.face.right  { transform: rotateY( 90deg) translateZ(80px); }',
            '.face.left   { transform: rotateY(-90deg) translateZ(80px); }',
            '.face.top    { transform: rotateX( 90deg) translateZ(80px); }',
            '.face.bottom { transform: rotateX(-90deg) translateZ(80px); }',
            '#gift-box.opening .face.top {',
            '  transform: rotateX(130deg) translateZ(80px) translateY(-55px);',
            '  opacity: 0.2;',
            '}',

            /* ── Prominent golden "13" on the front face ── */
            '.golden-13 {',
            '  font-family: "Poppins", sans-serif; font-weight: 900;',
            '  font-size: 88px; line-height: 1;',
            '  color: #F0B429;',
            '  text-shadow:',
            '    0 0 8px  rgba(240,180,41,1),',
            '    0 0 24px rgba(245,158,11,0.9),',
            '    0 0 60px rgba(245,100,0,0.5),',
            '    2px 2px 0px rgba(0,0,0,0.4);',
            '  user-select: none; letter-spacing: -4px;',
            '  animation: goldenPulse 2.8s ease-in-out infinite;',
            '  position: relative; z-index: 2;',
            '}',
            '@keyframes goldenPulse {',
            '  0%,100% { text-shadow: 0 0 8px rgba(240,180,41,1), 0 0 24px rgba(245,158,11,0.9), 0 0 60px rgba(245,100,0,0.5), 2px 2px 0 rgba(0,0,0,0.4); }',
            '  50%     { text-shadow: 0 0 14px rgba(255,200,80,1), 0 0 40px rgba(245,158,11,1), 0 0 90px rgba(245,120,0,0.7), 2px 2px 0 rgba(0,0,0,0.4); }',
            '}',

            /* ── Volumetric 3D ambient glow inside the cube ──
               A central sphere element that radiates in ALL directions.
               Because the faces are translucent, this light bleeds through
               and illuminates each glass wall from inside — creating the
               illusion of a 3D light source.
            */
            '.glow-core {',
            '  position: absolute; top: 50%; left: 50%;',
            '  width: 70px; height: 70px;',
            '  transform: translate(-50%, -50%);',
            '  border-radius: 50%;',
            '  background: radial-gradient(circle,',
            '    rgba(255,220,100,0.95) 0%,',
            '    rgba(245,158,11,0.7)   35%,',
            '    rgba(220,80,0,0.3)     65%,',
            '    transparent 100%);',
            '  filter: blur(14px);',
            /* Box-shadow radiates glow toward every inner face */
            '  box-shadow:',
            '    0   0  60px 30px rgba(245,158,11,0.55),',
            '    0   0 100px 50px rgba(240,130, 10,0.3);',
            '  animation: glowPulse 2.8s ease-in-out infinite;',
            '  z-index: 1;',
            '}',
            '@keyframes glowPulse {',
            '  0%,100% { transform: translate(-50%,-50%) scale(1);   opacity:.85; }',
            '  50%     { transform: translate(-50%,-50%) scale(1.18); opacity:1;   }',
            '}',

            /* Ribbons */
            '.ribbon-face {',
            '  position: absolute; top: 0; left: 0;',
            '  background: linear-gradient(90deg,#7C3AED,#a855f7,#7C3AED);',
            '  border: 1px solid rgba(255,255,255,0.1); opacity: 0.8;',
            '  pointer-events: none; transition: opacity 0.9s;',
            '}',
            '#gift-box.opening .ribbon-face { opacity: 0; }',
            '.rv-f { width:26px; height:160px; left:67px; transform: rotateY(  0deg) translateZ(81px); }',
            '.rv-b { width:26px; height:160px; left:67px; transform: rotateY(180deg) translateZ(81px); }',
            '.rv-t { width:26px; height:160px; left:67px; transform: rotateX( 90deg) translateZ(81px); }',
            '.rh-f { width:160px; height:26px; top:67px;  transform: rotateY(  0deg) translateZ(81px); }',
            '.rh-b { width:160px; height:26px; top:67px;  transform: rotateY(180deg) translateZ(81px); }',
            '.rh-l { width:160px; height:26px; top:67px;  transform: rotateY(-90deg) translateZ(81px); }',
            '.rh-r { width:160px; height:26px; top:67px;  transform: rotateY( 90deg) translateZ(81px); }',

            /* Bow */
            '.cube-bow {',
            '  position: absolute; top: -22px; left: 50%;',
            '  transform: translateX(-50%) translateZ(82px);',
            '  width: 104px; height: 44px;',
            '  transform-style: preserve-3d;',
            '  transition: opacity 0.7s, transform 0.7s;',
            '}',
            '#gift-box.opening .cube-bow { opacity: 0; transform: translateX(-50%) translateZ(82px) translateY(-50px) rotateX(40deg); }',
            '.bow-loop {',
            '  position: absolute; width: 48px; height: 36px;',
            '  background: linear-gradient(135deg,#c084fc,#7C3AED,#9333ea);',
            '  border-radius: 50% 50% 0 50%;',
            '  border: 1.5px solid rgba(255,255,255,0.3);',
            '}',
            '.bow-loop.left  { left:  0; transform: rotateZ(-12deg); }',
            '.bow-loop.right { right: 0; transform: rotateZ(12deg) scaleX(-1); }',
            '.bow-center {',
            '  position: absolute; left:50%; top:50%;',
            '  width: 18px; height: 18px; background: #7C3AED;',
            '  border-radius: 50%; border: 2px solid rgba(255,255,255,0.5);',
            '  transform: translate(-50%,-50%);',
            '  box-shadow: 0 0 10px rgba(168,85,247,0.8);',
            '}',

            /* Fullscreen overlay for the opening */
            '.flame-overlay {',
            '  position: fixed; inset: 0; pointer-events: none; z-index: 900;',
            '  background: radial-gradient(circle at var(--ox,50%) var(--oy,40%),',
            '    #fff 0%, #fcd34d 18%, #f59e0b 38%, rgba(0,0,0,0) 65%);',
            '  opacity: 0; transition: opacity 0.12s ease;',
            '}',

            /* Fireflies */
            '.firefly {',
            '  position: fixed; top: 0; left: 0;',
            '  border-radius: 50%; pointer-events: none;',
            '  background: #fcd34d; opacity: 0;',
            '  box-shadow: 0 0 6px 1px rgba(252,211,77,0.8);',
            '  transition: opacity 1s ease; will-change: transform;',
            '}',

            /* Prompt */
            '#gift-prompt {',
            '  font-family: "Playfair Display",serif; font-size: 15px;',
            '  color: rgba(255,255,255,0.35); letter-spacing: 2px;',
            '  animation: tGlow2 2.5s ease-in-out infinite;',
            '  text-align: center; max-width: 90vw;',
            '  transition: color 0.6s, letter-spacing 0.6s;',
            '}',
            '#gift-prompt.active { color: rgba(240,180,41,0.95); letter-spacing: 4px; }',

            /* Tap ring */
            '.tap-ring {',
            '  position: fixed; border-radius: 50%; pointer-events: none; z-index: 50;',
            '  border: 2px solid rgba(168,85,247,0.7);',
            '  animation: ringOut2 0.55s ease-out forwards;',
            '}',
            '@keyframes ringOut2 { from{width:0;height:0;margin:0;opacity:.9} to{width:110px;height:110px;margin:-55px;opacity:0} }',

            /* Dev toast */
            '#dev-toast2 {',
            '  position: fixed; bottom: 18px; right: 18px; z-index: 9999;',
            '  background: rgba(109,40,217,0.9); color:#fff;',
            '  font-family:"Poppins",sans-serif; font-size:12px; padding:7px 13px;',
            '  border-radius: 8px; pointer-events:none; opacity:0; transition: opacity 0.4s;',
            '}',

            /* Keyframes */
            '@keyframes orbitalRotate2 {',
            '  from { transform: rotateX(-15deg) rotateY(  0deg); }',
            '  to   { transform: rotateX(-15deg) rotateY(360deg); }',
            '}',
            '@keyframes boxFloat2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-11px)} }',
            '@keyframes tGlow2     { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:.85;transform:scale(1.04)} }'
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
            var scout = roll < 0.05;
            _fireflies.push({
                el: el,
                x: Math.random() * W, y: Math.random() * H,
                vx: (Math.random() - 0.5) * (scout ? 3.0 : 1.0),
                vy: (Math.random() - 0.5) * (scout ? 3.0 : 1.0),
                type: roll,
                angle: Math.random() * Math.PI * 2,
                radius: 30 + Math.random() * 70,
                cx: Math.random() * W, cy: Math.random() * H
            });
        }
        setTimeout(function () {
            _fireflies.forEach(function (f) {
                f.el.style.opacity = (Math.random() * 0.55 + 0.2).toFixed(2);
            });
        }, 900);
    }

    function updateFireflies() {
        var W = window.innerWidth, H = window.innerHeight;
        for (var i = 0; i < _fireflies.length; i++) {
            var f = _fireflies[i];
            if (f.type >= 0.05 && f.type < 0.18) {
                f.angle += 0.016 + f.type * 0.01;
                f.x = f.cx + Math.cos(f.angle) * f.radius;
                f.y = f.cy + Math.sin(f.angle) * f.radius;
            } else {
                f.vx += (Math.random() - 0.5) * 0.04;
                f.vy += (Math.random() - 0.5) * 0.04;
                var spd = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
                var cap = scout ? 3 : 1.4;
                if (spd > cap) { f.vx = f.vx / spd * cap; f.vy = f.vy / spd * cap; }
                f.vx *= 0.97; f.vy *= 0.97;
                f.x += f.vx; f.y += f.vy;
            }
            var dx = f.x - _mouse.x, dy = f.y - _mouse.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0 && dist < 130) {
                var force = (130 - dist) / 130 * 0.18;
                f.vx += dx / dist * force; f.vy += dy / dist * force;
            }
            if (f.x < -10) { f.x = W + 10; f.cx = f.x; } if (f.x > W + 10) { f.x = -10; f.cx = f.x; }
            if (f.y < -10) { f.y = H + 10; f.cy = f.y; } if (f.y > H + 10) { f.y = -10; f.cy = f.y; }
            f.el.style.transform = 'translate3d(' + (f.x | 0) + 'px,' + (f.y | 0) + 'px,0)';
        }
        _rafId = requestAnimationFrame(updateFireflies);
    }

    /* ─── HTML ─── */
    function buildHTML() {
        return [
            '<div class="cube-world">',
            '  <!-- Six glass faces -->',
            '  <div class="face front"><div class="golden-13">13</div></div>',
            '  <div class="face back"></div>',
            '  <div class="face left"></div>',
            '  <div class="face right"></div>',
            '  <div class="face top"></div>',
            '  <div class="face bottom"></div>',

            '  <!-- 3D Ambient Glow — illuminates all inner walls -->',
            '  <div class="glow-core"></div>',

            '  <!-- Bow -->',
            '  <div class="cube-bow">',
            '    <div class="bow-loop left"></div>',
            '    <div class="bow-loop right"></div>',
            '    <div class="bow-center"></div>',
            '  </div>',

            '  <!-- Ribbons -->',
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

    /* ─── Toast ─── */
    function showToast(msg) {
        var t = document.getElementById('dev-toast2');
        if (!t) { t = document.createElement('div'); t.id = 'dev-toast2'; document.body.appendChild(t); }
        t.textContent = msg; t.style.opacity = '1';
        setTimeout(function () { t.style.opacity = '0'; }, 2200);
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

        box.className = 'locked';
        box.innerHTML = buildHTML();
        prompt.textContent = 'Wait\u2026 Chu has planned a gift for you.';
        prompt.className = '';

        initFireflies();
        updateFireflies();

        _unlockTimer = setTimeout(function () {
            _isLocked = false;
            box.classList.remove('locked');
            prompt.textContent = 'tap to open \u2728';
            prompt.classList.add('active');
        }, 7000);

        window.addEventListener('mousemove', onMouseMove);
        _onClickBox = onBoxClick;
        box.addEventListener('click', _onClickBox);
        _onKeyDown = onKeyDown;
        window.addEventListener('keydown', _onKeyDown);
    }

    function onMouseMove(e) { _mouse.x = e.clientX; _mouse.y = e.clientY; }

    function onBoxClick(e) {
        if (_isLocked) return;
        spawnRing(e.clientX, e.clientY);
        _tapCount++;
        if (_tapCount >= 3) {
            triggerOpening();
        } else {
            var box = document.getElementById('gift-box');
            var deg = (Math.random() * 10 - 5).toFixed(1);
            box.style.transform = 'translateY(-10px) scale(1.07) rotate(' + deg + 'deg)';
            setTimeout(function () { box.style.transform = ''; }, 220);
        }
    }

    function spawnRing(x, y) {
        var r = document.createElement('div');
        r.className = 'tap-ring';
        r.style.left = x + 'px'; r.style.top = y + 'px';
        document.body.appendChild(r);
        setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r); }, 650);
    }

    /* ─── Opening ─── */
    function triggerOpening() {
        var box = document.getElementById('gift-box');
        var prompt = document.getElementById('gift-prompt');
        if (!box) return;

        box.classList.add('opening');
        if (prompt) prompt.style.opacity = '0';

        /* Intensify the glow core before overlay */
        var core = box.querySelector('.glow-core');
        if (core) { core.style.filter = 'blur(20px)'; core.style.transform = 'translate(-50%,-50%) scale(2)'; }

        /* Fullscreen radial overlay */
        var overlay = document.createElement('div');
        overlay.className = 'flame-overlay';
        var rect = box.getBoundingClientRect();
        overlay.style.setProperty('--ox', ((rect.left + rect.right) / 2 / window.innerWidth * 100).toFixed(1) + '%');
        overlay.style.setProperty('--oy', ((rect.top + rect.bottom) / 2 / window.innerHeight * 100).toFixed(1) + '%');
        document.body.appendChild(overlay);

        var start = null, RISE = 2000, FILL = 1500;
        function anim(ts) {
            if (!start) start = ts;
            var e = ts - start;
            if (e < RISE) {
                overlay.style.opacity = (e / RISE * 0.45).toFixed(3);
                requestAnimationFrame(anim);
            } else if (e < RISE + FILL) {
                overlay.style.opacity = (0.45 + (e - RISE) / FILL * 0.55).toFixed(3);
                requestAnimationFrame(anim);
            } else {
                overlay.style.opacity = '1';
                setTimeout(function () {
                    Phase2.destroy();
                    if (window.Phase3) window.Phase3.init(window.innerWidth / 2, window.innerHeight / 2);
                }, 280);
            }
        }
        requestAnimationFrame(anim);
    }

    /* ─── Dev mode: Ctrl+M ─── */
    function onKeyDown(e) {
        if (!(e.ctrlKey && (e.key === 'm' || e.key === 'M'))) return;
        e.preventDefault();
        if (!_devUnlocked) {
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
        showToast('\u23E9 Skipping\u2026');
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
        _fireflies = []; _styleEl = null; _onClickBox = null; _onKeyDown = null;
        var ov = document.querySelector('.flame-overlay');
        if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    }

    return { init: init, destroy: destroy };
}());
