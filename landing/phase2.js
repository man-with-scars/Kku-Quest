window.Phase2 = (function () {
    'use strict';

    var _onClickBox = null;
    var _styleEl = null;
    var _tapCount = 0;
    var _hintTimer = null;
    var _fireflies = [];
    var _mouse = { x: -1000, y: -1000 };
    var _rafId = null;

    function createStyle() {
        var el = document.createElement('style');
        el.id = 'phase2-styles';
        el.textContent = [
            '#phase2 {',
            '  background: #000;',
            '  overflow: hidden;',
            '  perspective: 1500px;',
            '  transition: background 2s ease;',
            '}',
            '#phase2.env-glow {',
            '  background: radial-gradient(circle at center, #1a0533 0%, #000 70%);',
            '  animation: envPulse 4s ease-in-out infinite;',
            '}',

            '#gift-box {',
            '  position:relative; width:300px; height:300px; cursor:pointer;',
            '  display:flex; align-items:center; justify-content:center;',
            '  perspective: 1200px;',
            '  z-index: 10;',
            '  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);',
            '}',
            '#gift-box:hover { transform: scale(1.05); }',
            '#gift-box.opening { pointer-events: none; }',

            '.cube-world {',
            '  width: 160px; height: 160px; position: relative;',
            '  transform-style: preserve-3d;',
            '  animation: orbitalRotate 12s linear infinite;',
            '  transition: animation-play-state 1s ease, transform 1s ease;',
            '}',
            '#gift-box.opening .cube-world { animation-play-state: paused; transform: rotateX(-10deg) rotateY(20deg) scale(1.2); }',

            '.face {',
            '  position: absolute; width: 160px; height: 160px;',
            '  background: rgba(124, 58, 237, 0.15);',
            '  backdrop-filter: blur(12px);',
            '  border: 1.5px solid rgba(255, 255, 255, 0.2);',
            '  box-shadow: inset 0 0 40px rgba(124, 58, 237, 0.3);',
            '  display: flex; align-items: center; justify-content: center;',
            '  pointer-events: none;',
            '  transition: transform 1.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 1s ease;',
            '}',

            '.face.front  { transform: rotateY(0deg) translateZ(80px); }',
            '.face.back   { transform: rotateY(180deg) translateZ(80px); }',
            '.face.right  { transform: rotateY(90deg) translateZ(80px); }',
            '.face.left   { transform: rotateY(-90deg) translateZ(80px); }',
            '.face.top    { transform: rotateX(90deg) translateZ(80px); transform-origin: top; }',
            '.face.bottom { transform: rotateX(-90deg) translateZ(80px); }',

            '/* Engraved 13 */',
            '.engraved-13 {',
            '  font-family: "Poppins", sans-serif; font-weight: 800; font-size: 80px;',
            '  color: rgba(255, 255, 255, 0.05);',
            '  text-shadow: ',
            '    -1px -1px 1px rgba(0,0,0,0.5),',
            '     1px  1px 1px rgba(255,255,255,0.2),',
            '     0 0 10px rgba(124,58,237,0.2);',
            '  user-select: none;',
            '  letter-spacing: -5px;',
            '}',

            '#gift-box.opening .face.top { transform: rotateX(110deg) translateZ(80px) translateY(-20px); opacity: 0.5; }',

            '/* 3D Bow */',
            '.cube-bow {',
            '  position: absolute; top: -20px; left: 50%; transform: translateX(-50%) translateZ(85px);',
            '  width: 100px; height: 40px; transform-style: preserve-3d; transition: all 1s ease;',
            '  z-index: 20;',
            '}',
            '#gift-box.opening .cube-bow { opacity: 0; transform: translateX(-50%) translateZ(100px) rotateX(45deg); }',

            '.bow-loop {',
            '  position: absolute; width: 50px; height: 35px;',
            '  background: linear-gradient(135deg, #a855f7, #7C3AED);',
            '  border-radius: 50% 50% 0 50%; border: 1.5px solid rgba(255,255,255,0.3);',
            '  transform-style: preserve-3d;',
            '}',
            '.bow-loop.left  { left: 0; transform: rotateY(-20deg) rotateZ(-10deg); }',
            '.bow-loop.right { right: 0; transform: rotateY(20deg) rotateZ(10deg) scaleX(-1); }',
            '.bow-center {',
            '  position: absolute; left: 50%; top: 50%; width: 20px; height: 20px;',
            '  background: #7C3AED; border-radius: 50%; border: 1.5px solid #fff;',
            '  transform: translate(-50%, -50%) translateZ(10px);',
            '  box-shadow: 0 4px 10px rgba(0,0,0,0.3);',
            '}',

            '.magic-core {',
            '  position: absolute; top: 50%; left: 50%; width: 60px; height: 60px;',
            '  background: radial-gradient(circle, #fff 0%, #fcd34d 40%, #f59e0b 70%, transparent 100%);',
            '  border-radius: 50%; transform: translate3d(-50%, -50%, 0);',
            '  filter: blur(10px); box-shadow: 0 0 60px 20px rgba(245, 158, 11, 0.6);',
            '  animation: corePulse 3s ease-in-out infinite;',
            '  transition: all 2s cubic-bezier(0.4, 0, 0.2, 1);',
            '}',
            '#gift-box.opening .magic-core { width: 100px; height: 100px; filter: blur(20px); box-shadow: 0 0 150px 80px rgba(245, 158, 11, 0.8); }',
            '#gift-box.final-expand .magic-core { transform: translate3d(-50%, -50%, 0) scale(40); opacity: 1; filter: blur(0); }',

            '.ribbon-face {',
            '  position: absolute; background: linear-gradient(90deg, #7C3AED, #a855f7, #7C3AED);',
            '  border: 1px solid rgba(255,255,255,0.1); opacity: 0.9; transition: opacity 1s ease;',
            '}',
            '#gift-box.opening .ribbon-face { opacity: 0; }',
            '.rv-f { width: 32px; height: 160px; left: 64px; transform: rotateY(0deg) translateZ(80.5px); }',
            '.rv-b { width: 32px; height: 160px; left: 64px; transform: rotateY(180deg) translateZ(80.5px); }',
            '.rv-t { width: 32px; height: 160px; left: 64px; transform: rotateX(90deg) translateZ(80.5px); }',
            '.rh-f { width: 160px; height: 32px; top: 64px; transform: rotateY(0deg) translateZ(80.5px); }',
            '.rh-l { width: 160px; height: 32px; top: 64px; transform: rotateY(-90deg) translateZ(80.5px); }',
            '.rh-r { width: 160px; height: 32px; top: 64px; transform: rotateY(90deg) translateZ(80.5px); }',

            '.firefly {',
            '  position: absolute; width: 4px; height: 4px; background: #fcd34d;',
            '  border-radius: 50%; filter: blur(1px); pointer-events: none;',
            '  box-shadow: 0 0 8px #f59e0b; opacity: 0; transition: opacity 0.5s ease;',
            '}',

            '#gift-prompt {',
            '  margin-top: 50px; font-family: "Playfair Display", serif;',
            '  font-size: 16px; color: rgba(255,255,255,0.5);',
            '  animation: textPulse 2.5s infinite; letter-spacing: 3px;',
            '  transition: transform 0.5s ease, opacity 0.5s ease;',
            '}',
            '#gift-prompt.hint { transform: scale(1.2); color: #fcd34d; text-shadow: 0 0 10px rgba(252,211,77,0.5); }',

            '@keyframes orbitalRotate { 0% { transform: rotateX(-15deg) rotateY(0deg); } 100% { transform: rotateX(-15deg) rotateY(360deg); } }',
            '@keyframes envPulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }',
            '@keyframes corePulse { 0%, 100% { transform: translate3d(-50%, -50%, 0) scale(1); } 50% { transform: translate3d(-50%, -50%, 0) scale(1.15); } }',
            '@keyframes textPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }'
        ].join('\n');
        document.head.appendChild(el);
        return el;
    }

    function initFireflies() {
        var count = 40;
        var container = document.getElementById('phase2');
        for (var i = 0; i < count; i++) {
            var el = document.createElement('div');
            el.className = 'firefly';
            container.appendChild(el);
            _fireflies.push({
                el: el,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                size: 2 + Math.random() * 3
            });
        }
        setTimeout(function () {
            _fireflies.forEach(function (f) { f.el.style.opacity = Math.random() * 0.8 + 0.2; });
        }, 1000);
    }

    function updateFireflies() {
        var w = window.innerWidth, h = window.innerHeight;
        _fireflies.forEach(function (f) {
            f.x += f.vx; f.y += f.vy;

            // Subtle Repulsion
            var dx = f.x - _mouse.x;
            var dy = f.y - _mouse.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                var force = (150 - dist) / 150;
                f.vx += (dx / dist) * force * 0.2;
                f.vy += (dy / dist) * force * 0.2;
            }

            // Boundary & friction
            if (f.x < 0 || f.x > w) f.vx *= -1;
            if (f.y < 0 || f.y > h) f.vy *= -1;
            f.vx *= 0.99; f.vy *= 0.99;
            f.vx += (Math.random() - 0.5) * 0.1;
            f.vy += (Math.random() - 0.5) * 0.1;

            f.el.style.transform = 'translate3d(' + f.x + 'px,' + f.y + 'px, 0)';
        });
        _rafId = requestAnimationFrame(updateFireflies);
    }

    function startHintTimer() {
        if (_hintTimer) clearTimeout(_hintTimer);
        _hintTimer = setTimeout(function () {
            var p = document.getElementById('gift-prompt');
            if (p) p.classList.add('hint');
        }, 7000);
    }

    function init() {
        _styleEl = createStyle();
        var phase2 = document.getElementById('phase2');
        var box = document.getElementById('gift-box');
        var prompt = document.getElementById('gift-prompt');
        if (!phase2 || !box || !prompt) return;

        phase2.classList.add('env-glow');
        box.innerHTML = [
            '<div class="cube-world">',
            '  <div class="face front"><div class="engraved-13">13</div></div>',
            '  <div class="face back"></div> <div class="face left"></div> <div class="face right"></div>',
            '  <div class="face top"></div> <div class="face bottom"></div>',
            '  <div class="magic-core"></div>',
            '  <div class="cube-bow">',
            '    <div class="bow-loop left"></div> <div class="bow-loop right"></div>',
            '    <div class="bow-center"></div>',
            '  </div>',
            '  <div class="ribbon-face rv-f"></div> <div class="ribbon-face rv-b"></div> <div class="ribbon-face rv-t"></div>',
            '  <div class="ribbon-face rh-f"></div> <div class="ribbon-face rh-l"></div> <div class="ribbon-face rh-r"></div>',
            '</div>'
        ].join('');

        initFireflies();
        updateFireflies();
        startHintTimer();

        window.addEventListener('mousemove', function (e) { _mouse.x = e.clientX; _mouse.y = e.clientY; });

        _onClickBox = function () {
            _tapCount++;
            var p = document.getElementById('gift-prompt');
            if (p) p.classList.remove('hint');
            startHintTimer();

            if (_tapCount === 3) {
                triggerOpening();
            } else {
                box.style.transform = 'scale(1.1) rotate(' + (Math.random() * 10 - 5) + 'deg)';
                setTimeout(function () { box.style.transform = 'scale(1)'; }, 200);
            }
        };
        box.addEventListener('click', _onClickBox);
    }

    function triggerOpening() {
        var box = document.getElementById('gift-box');
        var world = box.querySelector('.cube-world');
        var prompt = document.getElementById('gift-prompt');
        box.classList.add('opening');
        if (prompt) prompt.style.opacity = '0';

        setTimeout(function () {
            box.classList.add('final-expand');
            setTimeout(function () {
                // Glitch & Phase 3
                Phase2.destroy();
                if (window.Phase3) Phase3.init(window.innerWidth / 2, window.innerHeight / 2);
            }, 2000);
        }, 2500);
    }

    function destroy() {
        var box = document.getElementById('gift-box');
        if (box && _onClickBox) { box.removeEventListener('click', _onClickBox); }
        if (_styleEl && _styleEl.parentNode) _styleEl.parentNode.removeChild(_styleEl);
        if (_rafId) cancelAnimationFrame(_rafId);
        _fireflies.forEach(function (f) { if (f.el.parentNode) f.el.parentNode.removeChild(f.el); });
        _fireflies = [];
        if (_hintTimer) clearTimeout(_hintTimer);
        _styleEl = null; _onClickBox = null;
    }

    return { init: init, destroy: destroy };
}());
