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
    var _wiggleRaf = null;
    var _curTx = 0, _curTy = 0; /* smooth tilt target */

    var _DEV_CODE = '00365';
    var _devUnlocked = (sessionStorage.getItem('devMode') === '1');

    /* ─── Styles ─── */
    function createStyle() {
        var el = document.createElement('style');
        el.id = 'phase2-styles';
        el.textContent = [
            '#phase2 {',
            '  background: radial-gradient(circle at center, #0d0020 0%, #000 75%) !important;',
            '  overflow: hidden;',
            '}',

            /* Box: normal flex child — let parent column-flex centre it */
            '#gift-box {',
            '  position: relative !important;',
            '  top: auto !important; left: auto !important;',
            '  width: 220px !important; height: 240px !important;',
            '  cursor: pointer !important;',
            '  display: flex !important; align-items: center !important; justify-content: center !important;',
            '  perspective: 800px;',
            '  will-change: transform;',
            /* Springy elastic transition for the rubbery feel */
            '  transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.4s;',
            '  animation: boxFloat2 3.8s ease-in-out infinite !important;',
            '  filter: drop-shadow(0 0 30px rgba(124,58,237,0.5));',
            '}',
            '#gift-box.locked { cursor: not-allowed !important; }',
            '#gift-box.opening { pointer-events: none !important; animation: none !important;',
            '  transition: transform 1.2s ease !important; }',
            '#gift-box:not(.locked):hover { filter: drop-shadow(0 0 52px rgba(200,130,250,0.8)) !important; }',

            /* Fixed 3D angle — no rotation animation, just a natural isometric look */
            '.cube-world {',
            '  width: 160px; height: 160px; position: relative;',
            '  transform-style: preserve-3d;',
            '  transform: rotateX(-18deg) rotateY(-15deg);', /* fixed pleasant 3/4 angle */
            '  transition: transform 1.2s ease;',
            '}',
            '#gift-box.opening .cube-world {',
            '  transform: rotateX(-12deg) rotateY(25deg) scale(1.1);',
            '}',

            /* Faces */
            '.face {',
            '  position: absolute; top: 0; left: 0;',
            '  width: 160px; height: 160px;',
            '  background: rgba(100,35,210,0.14);',
            '  backdrop-filter: blur(10px);',
            '  border: 1.5px solid rgba(255,255,255,0.22);',
            '  box-shadow: inset 0 0 30px rgba(200,120,10,0.08);',
            '  pointer-events: none; box-sizing: border-box;',
            '  transition: transform 1.4s cubic-bezier(0.4,0,0.2,1), opacity 1s;',
            '}',
            '.face.front  { transform: rotateY(  0deg) translateZ(80px); }',
            '.face.back   { transform: rotateY(180deg) translateZ(80px); }',
            '.face.right  { transform: rotateY( 90deg) translateZ(80px); }',
            '.face.left   { transform: rotateY(-90deg) translateZ(80px); }',
            '.face.top    { transform: rotateX( 90deg) translateZ(80px); }',
            '.face.bottom { transform: rotateX(-90deg) translateZ(80px); }',
            '#gift-box.opening .face.top {',
            '  transform: rotateX(130deg) translateZ(80px) translateY(-55px);',
            '  opacity: 0.15;',
            '}',

            /* ── Golden "13" — Own 3D plane at z=84px, in FRONT of ribbons (z=81) ── */
            '.num-13-plane {',
            '  position: absolute; top: 0; left: 0;',
            '  width: 160px; height: 160px;',
            '  pointer-events: none; box-sizing: border-box;',
            '  display: flex; align-items: center; justify-content: center;',
            '  transform: rotateY(0deg) translateZ(84px);', /* 3px in front of ribbons */
            '  transition: transform 1.4s cubic-bezier(0.4,0,0.2,1);',
            '}',
            '#gift-box.opening .num-13-plane {',
            '  transform: rotateY(0deg) translateZ(84px) translateY(-40px);',
            '  opacity: 0;',
            '}',
            '.golden-13 {',
            '  font-family: "Poppins",sans-serif; font-weight: 900; font-size: 90px; line-height: 1;',
            '  color: #F0B429;',
            '  text-shadow:',
            '    0 0 6px  rgba(255,230,100,1),',
            '    0 0 22px rgba(245,158,11,0.95),',
            '    0 0 55px rgba(245,100, 0,0.6),',
            '    3px 3px 0 rgba(0,0,0,0.35);',
            '  user-select: none; letter-spacing: -4px;',
            '  animation: goldenPulse 3s ease-in-out infinite;',
            '}',
            '@keyframes goldenPulse {',
            '  0%,100% { text-shadow: 0 0 6px rgba(255,230,100,1), 0 0 22px rgba(245,158,11,.95), 0 0 55px rgba(245,100,0,.6), 3px 3px 0 rgba(0,0,0,0.35); }',
            '  50%     { text-shadow: 0 0 12px rgba(255,240,120,1), 0 0 40px rgba(245,180,40,1),  0 0 90px rgba(245,120,0,.8), 3px 3px 0 rgba(0,0,0,0.35); }',
            '}',

            /*
             * ── 3D Volumetric Ambient Glow ──
             * Three glow spheres placed at different Z depths inside the cube.
             * At the fixed isometric angle, they layer to create genuine visual depth.
             * - glow-far:  z=-40px  → large, warm, dim  (back of box)
             * - glow-mid:  z=  0px  → medium, amber core (centre)
             * - glow-near: z=+35px  → small, brighter, white-hot (front, near the "13")
             */
            '.glow-layer {',
            '  position: absolute; top: 50%; left: 50%;',
            '  border-radius: 50%;',
            '  pointer-events: none;',
            '}',
            '.glow-far {',
            '  width: 130px; height: 100px; margin: -50px 0 0 -65px;',
            '  transform: translateZ(-40px);',
            '  background: radial-gradient(circle, rgba(200,80,5,0.7) 0%, transparent 72%);',
            '  filter: blur(20px);',
            '  animation: glowPulse 3s ease-in-out infinite;',
            '}',
            '.glow-mid {',
            '  width: 90px; height: 75px; margin: -37px 0 0 -45px;',
            '  transform: translateZ(0px);',
            '  background: radial-gradient(circle, rgba(245,158,11,0.85) 0%, transparent 70%);',
            '  filter: blur(13px);',
            '  animation: glowPulse 3s ease-in-out infinite 0.4s;',
            '}',
            '.glow-near {',
            '  width: 55px; height: 48px; margin: -24px 0 0 -27px;',
            '  transform: translateZ(35px);',
            '  background: radial-gradient(circle, rgba(255,230,120,0.95) 0%, transparent 68%);',
            '  filter: blur(8px);',
            '  animation: glowPulse 3s ease-in-out infinite 0.8s;',
            '}',
            '@keyframes glowPulse {',
            '  0%,100% { transform: translateZ(var(--gz,0px)) scale(1);   opacity:.88; }',
            '  50%     { transform: translateZ(var(--gz,0px)) scale(1.18); opacity:1;   }',
            '}',
            '.glow-far  { --gz: -40px; }',
            '.glow-mid  { --gz:   0px; }',
            '.glow-near { --gz:  35px; }',

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
            '  width: 104px; height: 44px; transform-style: preserve-3d;',
            '  transition: opacity 0.7s, transform 0.7s;',
            '}',
            '#gift-box.opening .cube-bow { opacity: 0; transform: translateX(-50%) translateZ(82px) translateY(-50px); }',
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

            /* Wiggle animation for tap feedback */
            '@keyframes wiggleBox {',
            '  0%   { transform: rotate(0deg) scale(1); }',
            '  20%  { transform: rotate(-5deg) scale(1.06); }',
            '  40%  { transform: rotate(5deg) scale(1.04); }',
            '  60%  { transform: rotate(-3deg) scale(1.02); }',
            '  80%  { transform: rotate(2deg) scale(1.01); }',
            '  100% { transform: rotate(0deg) scale(1); }',
            '}',
            '#gift-box.wiggle { animation: wiggleBox 0.5s cubic-bezier(0.36,0.07,0.19,0.97) !important; }',

            /* Fullscreen overlay for opening */
            '.flame-overlay {',
            '  position: fixed; inset: 0; pointer-events: none; z-index: 900;',
            '    background: radial-gradient(circle at var(--ox,50%) var(--oy,40%),',
            '    #fff 0%, #fcd34d 18%, #f59e0b 38%, rgba(0,0,0,0) 65%);',
            '  opacity: 0; transition: opacity 0.1s ease;',
            '}',

            /* Fireflies */
            '.firefly {',
            '  position: fixed; top: 0; left: 0;',
            '  border-radius: 50%; pointer-events: none;',
            '  background: #fcd34d; opacity: 0;',
            '  box-shadow: 0 0 6px 1px rgba(252,211,77,0.85);',
            '  transition: opacity 1s ease; will-change: transform;',
            '}',

            /* Prompt */
            '#gift-prompt {',
            '  font-family:"Playfair Display",serif; font-size:15px;',
            '  color:rgba(255,255,255,0.35); letter-spacing:2px;',
            '  animation:tGlow2 2.5s ease-in-out infinite;',
            '  text-align:center; max-width:90vw; transition:color .6s,letter-spacing .6s;',
            '}',
            '#gift-prompt.active { color:rgba(240,180,41,0.95); letter-spacing:4px; }',

            /* Tap ring */
            '.tap-ring {',
            '  position:fixed; border-radius:50%; pointer-events:none; z-index:50;',
            '  border:2px solid rgba(168,85,247,0.75);',
            '  animation:ringOut2 0.55s ease-out forwards;',
            '}',
            '@keyframes ringOut2 {',
            '  from{width:0;height:0;margin:0;opacity:.9}',
            '  to{width:100px;height:100px;margin:-50px;opacity:0}',
            '}',

            /* Dev toast */
            '#dev-toast2 {',
            '  position:fixed; bottom:18px; right:18px; z-index:9999;',
            '  background:rgba(109,40,217,0.9); color:#fff;',
            '  font-family:"Poppins",sans-serif; font-size:12px; padding:7px 13px;',
            '  border-radius:8px; pointer-events:none; opacity:0; transition:opacity .4s;',
            '}',

            /* Keyframes */
            '@keyframes boxFloat2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }',
            '@keyframes tGlow2 { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:.85;transform:scale(1.04)} }'
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
            var isScout = roll < 0.05;
            var isOrbit = roll >= 0.05 && roll < 0.18;
            var isGiant = roll >= 0.18 && roll < 0.28;
            var size = isGiant ? (4.5 + Math.random() * 2.5) : (2 + Math.random() * 2);

            var el = document.createElement('div');
            el.className = 'firefly';
            el.style.width = el.style.height = size + 'px';
            phase2.appendChild(el);

            _fireflies.push({
                el: el,
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * (isScout ? 3.2 : 1.0),
                vy: (Math.random() - 0.5) * (isScout ? 3.2 : 1.0),
                isScout: isScout,
                isOrbit: isOrbit,
                angle: Math.random() * Math.PI * 2,
                radius: 30 + Math.random() * 70,
                cx: Math.random() * W,
                cy: Math.random() * H
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
        var mouseNear = (_mouse.x > -999); /* has mouse moved onto page */

        for (var i = 0; i < _fireflies.length; i++) {
            var f = _fireflies[i];

            /* Vector toward the mouse */
            var dx = _mouse.x - f.x;
            var dy = _mouse.y - f.y;
            var dist = Math.sqrt(dx * dx + dy * dy);

            if (f.isOrbit) {
                /* Orbit fireflies: keep circling but ALSO gradually pull the
                   orbit centre toward the cursor, so they spiral and swarm around it */
                f.angle += 0.016;
                if (mouseNear && dist > 0) {
                    var pull = Math.min(dist, 400) / 400 * 0.08; /* max 0.08 px/frame — very gentle */
                    f.cx += (dx / dist) * pull;
                    f.cy += (dy / dist) * pull;
                }
                f.x = f.cx + Math.cos(f.angle) * f.radius;
                f.y = f.cy + Math.sin(f.angle) * f.radius;
            } else {
                /* Drift / scout fireflies: steer toward mouse with a soft force */
                f.vx += (Math.random() - 0.5) * 0.04;
                f.vy += (Math.random() - 0.5) * 0.04;

                if (mouseNear && dist > 0 && dist < 500) {
                    /* Very weak attraction — moths drifting toward a distant candle */
                    var attract = (500 - dist) / 500;
                    var aStr = f.isScout ? 0.025 : 0.008;
                    f.vx += (dx / dist) * attract * aStr;
                    f.vy += (dy / dist) * attract * aStr;
                }

                var spd = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
                var cap = f.isScout ? 3.2 : 1.6;
                if (spd > cap) { f.vx = f.vx / spd * cap; f.vy = f.vy / spd * cap; }
                f.vx *= 0.97; f.vy *= 0.97;
                f.x += f.vx; f.y += f.vy;
            }

            /* Wrap */
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
            '  <div class="face front"></div>',
            '  <div class="face back"></div>',
            '  <div class="face left"></div>',
            '  <div class="face right"></div>',
            '  <div class="face top"></div>',
            '  <div class="face bottom"></div>',
            /* "13" on its own plane at z=84, in front of ribbons (z=81) */
            '  <div class="num-13-plane"><div class="golden-13">13</div></div>',
            /* 3D layered ambient glow */
            '  <div class="glow-layer glow-far"></div>',
            '  <div class="glow-layer glow-mid"></div>',
            '  <div class="glow-layer glow-near"></div>',
            /* Ribbons */
            '  <div class="ribbon-face rv-f"></div>',
            '  <div class="ribbon-face rv-b"></div>',
            '  <div class="ribbon-face rv-t"></div>',
            '  <div class="ribbon-face rh-f"></div>',
            '  <div class="ribbon-face rh-b"></div>',
            '  <div class="ribbon-face rh-l"></div>',
            '  <div class="ribbon-face rh-r"></div>',
            /* Bow */
            '  <div class="cube-bow">',
            '    <div class="bow-loop left"></div>',
            '    <div class="bow-loop right"></div>',
            '    <div class="bow-center"></div>',
            '  </div>',
            '</div>'
        ].join('');
    }

    /* ─── Rubbery parallax tilt on mouse ─── */
    function startWiggle(box) {
        /* Track mouse and tilt cube-world toward cursor for parallax depth feel */
        function onBoxMouseMove(e) {
            var rect = box.getBoundingClientRect();
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            var dx = (e.clientX - cx) / (rect.width / 2); /* -1..1 */
            var dy = (e.clientY - cy) / (rect.height / 2); /* -1..1 */
            var world = box.querySelector('.cube-world');
            if (world) {
                world.style.transition = 'transform 0.15s ease';
                world.style.transform = 'rotateX(' + (-18 + dy * -8) + 'deg) rotateY(' + (-15 + dx * 10) + 'deg)';
            }
        }
        function onBoxMouseLeave() {
            var world = box.querySelector('.cube-world');
            if (world) {
                world.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
                world.style.transform = 'rotateX(-18deg) rotateY(-15deg)';
            }
        }
        box._mmove = onBoxMouseMove;
        box._mleave = onBoxMouseLeave;
        box.addEventListener('mousemove', box._mmove);
        box.addEventListener('mouseleave', box._mleave);
    }

    function stopWiggle(box) {
        if (box._mmove) box.removeEventListener('mousemove', box._mmove);
        if (box._mleave) box.removeEventListener('mouseleave', box._mleave);
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
        startWiggle(box);

        // Lock the box until monologue ends
        _isLocked = true;
        box.classList.add('locked');
        box.style.opacity = '0.4'; // Dim box
        prompt.textContent = 'Wait for the signal… 🎙️';
        prompt.classList.add('active');

        var playBtn = document.getElementById('btn-play-monologue');
        var mono = document.getElementById('monologue-audio');
        var bgm = document.getElementById('gift-bgm');

        if (playBtn && mono) {
            playBtn.style.display = 'flex';
            playBtn.onclick = function () {
                playBtn.disabled = true;
                playBtn.innerHTML = '<span style="font-size: 20px;">🔊</span> Playing message...';

                mono.play().catch(function (e) {
                    console.warn('Monologue blocked');
                    unlock();
                });
            };

            mono.addEventListener('ended', unlock, { once: true });
            mono.addEventListener('error', function () {
                console.warn('Monologue audio error');
                unlock();
            }, { once: true });
        } else {
            unlock();
        }

        function unlock() {
            _isLocked = false;
            box.classList.remove('locked');
            box.style.opacity = '1';
            prompt.textContent = 'tap to open \u2728';
            if (playBtn) playBtn.style.display = 'none';
            if (bgm) {
                bgm.volume = 0.5;
                bgm.play().catch(function (e) { });
            }
        }

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

        /* Rubbery wiggle feedback */
        var box = document.getElementById('gift-box');
        box.classList.remove('wiggle');
        void box.offsetWidth; /* reflow to restart animation */
        box.classList.add('wiggle');
        setTimeout(function () { box.classList.remove('wiggle'); }, 520);

        _tapCount++;
        if (_tapCount >= 3) { triggerOpening(); }
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

        stopWiggle(box);
        box.classList.add('opening');
        if (prompt) prompt.style.opacity = '0';

        var overlay = document.createElement('div');
        overlay.className = 'flame-overlay';
        var rect = box.getBoundingClientRect();
        overlay.style.setProperty('--ox', ((rect.left + rect.right) / 2 / window.innerWidth * 100).toFixed(1) + '%');
        overlay.style.setProperty('--oy', ((rect.top + rect.bottom) / 2 / window.innerHeight * 100).toFixed(1) + '%');
        document.body.appendChild(overlay);

        var start = null, RISE = 2100, FILL = 1500;
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
                    // Stop BGM
                    var bgm = document.getElementById('gift-bgm');
                    if (bgm) {
                        bgm.pause();
                        bgm.currentTime = 0;
                    }

                    // Trigger glitch and show destiny screen
                    triggerGlitch(() => {
                        Phase2.destroy();
                        showDestinyScreen();
                    });
                }, 280);
            }
        }
        requestAnimationFrame(anim);
    }

    function triggerGlitch(callback) {
        var phase2 = document.getElementById('phase2');
        if (!phase2) return callback();

        // Web Audio static burst (0.3 s)
        try {
            var actx = new (window.AudioContext || window.webkitAudioContext)();
            var buf = actx.createBuffer(1, Math.floor(actx.sampleRate * 0.3), actx.sampleRate);
            var data = buf.getChannelData(0);
            for (var i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.3;
            }
            var src = actx.createBufferSource();
            src.buffer = buf;
            src.connect(actx.destination);
            src.start();
        } catch (e) {
            console.warn('Glitch audio blocked');
        }

        // CSS glitch flash
        phase2.style.animation = 'glitch 80ms steps(1) 8';

        setTimeout(function () {
            phase2.style.animation = '';
            if (callback) callback();
        }, 700);
    }

    function showDestinyScreen() {
        // Hide all phases
        document.querySelectorAll('.phase').forEach(p => p.classList.remove('active'));

        const destiny = document.getElementById('destiny-screen');
        if (!destiny) return;

        destiny.classList.add('active');

        // Sequence the reveal
        setTimeout(() => {
            const txt = document.getElementById('destiny-text');
            if (txt) txt.style.opacity = '1';
        }, 500);

        setTimeout(() => {
            const prompt = document.getElementById('adventure-prompt');
            if (prompt) prompt.style.opacity = '1';
        }, 2500);

        setTimeout(() => {
            const btn = document.getElementById('btn-begin-quest');
            if (btn) {
                btn.style.opacity = '1';
                btn.onclick = () => {
                    destiny.classList.remove('active');
                    startGame();
                };
            }
        }, 4000);
    }

    function startGame() {
        console.log("Redirecting to game...");

        // Save session
        if (window.SessionManager) {
            SessionManager.save({ phase: 'game', level: 1 });
        }

        // Redirect to game
        if (window.KKU_CONFIG && window.KKU_CONFIG.GAME_URL) {
            window.location.href = window.KKU_CONFIG.GAME_URL;
        } else {
            window.location.href = '../game/index.html';
        }
    }

    /* ─── Dev mode: Handled globally in index.html ─── */
    function onKeyDown(e) { }

    /* ─── Destroy ─── */
    function destroy() {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('keydown', _onKeyDown);
        var box = document.getElementById('gift-box');
        if (box) {
            stopWiggle(box);
            if (_onClickBox) box.removeEventListener('click', _onClickBox);
        }
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
