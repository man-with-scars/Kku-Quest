window.Phase2 = (function () {
    'use strict';

    var _onClickBox = null;
    var _styleEl = null;
    var _tapCount = 0;
    var _hintTimer = null;
    var _fireflies = [];
    var _mouse = { x: -1000, y: -1000 };
    var _rafId = null;
    var _isLocked = true;
    var _startTime = 0;

    function createStyle() {
        var el = document.createElement('style');
        el.id = 'phase2-styles';
        el.textContent = [
            '#phase2 {',
            '  background: #000; overflow: hidden; perspective: 1500px;',
            '  transition: background 2s ease;',
            '}',
            '#phase2.env-glow {',
            '  background: radial-gradient(circle at center, #1a0533 0%, #000 70%);',
            '  animation: envPulse 4s ease-in-out infinite;',
            '}',

            '#gift-box {',
            '  position:relative; width:300px; height:300px; cursor:pointer;',
            '  display:flex; align-items:center; justify-content:center;',
            '  perspective: 1200px; z-index: 10;',
            '  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);',
            '}',
            '#gift-box.locked { cursor: default; }',
            '#gift-box.opening { pointer-events: none; }',

            '.cube-world {',
            '  width: 160px; height: 160px; position: relative;',
            '  transform-style: preserve-3d;',
            '  animation: orbitalRotate 12s linear infinite;',
            '  transition: transform 1.5s ease;',
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

            '/* Perfect Alignment Fix */',
            '.face.front  { transform: rotateY(0deg) translateZ(80px); }',
            '.face.back   { transform: rotateY(180deg) translateZ(80px); }',
            '.face.right  { transform: rotateY(90deg) translateZ(80px); }',
            '.face.left   { transform: rotateY(-90deg) translateZ(80px); }',
            '.face.top    { transform: rotateX(90deg) translateZ(80px); transform-origin: top; top: -0.5px; }',
            '.face.bottom { transform: rotateX(-90deg) translateZ(80px); bottom: -0.5px; }',

            '.engraved-13 {',
            '  font-family: "Poppins", sans-serif; font-weight: 800; font-size: 80px;',
            '  color: rgba(255, 255, 255, 0.05);',
            '  text-shadow: -1px -1px 1px rgba(0,0,0,0.5), 1px 1px 1px rgba(255,255,255,0.2), 0 0 10px rgba(124,58,237,0.2);',
            '  user-select: none; letter-spacing: -5px; transform: translateZ(1px);',
            '}',

            '#gift-box.opening .face.top { transform: rotateX(120deg) translateZ(80px); opacity: 0.3; }',

            '/* 3D Flame Source */',
            '.magic-flame-container {',
            '  position: absolute; top: 50%; left: 50%; transform: translate3d(-50%, -50%, 0);',
            '  transform-style: preserve-3d; transition: transform 2.5s cubic-bezier(0.4, 0, 0.2, 1);',
            '}',
            '.flame-core {',
            '  position: relative; width: 40px; height: 60px;',
            '  background: radial-gradient(ellipse at bottom, #fff 0%, #fcd34d 40%, #f59e0b 70%, transparent 90%);',
            '  filter: blur(8px); border-radius: 50% 50% 20% 20%;',
            '  animation: flameFlicker 0.2s infinite alternate;',
            '}',
            '.flame-layer {',
            '  position: absolute; inset: -10px; background: inherit; filter: blur(15px); opacity: 0.6;',
            '  animation: flameFlicker 0.3s infinite alternate-reverse;',
            '}',
            '@keyframes flameFlicker {',
            '  0% { transform: scale(1) skewX(-2deg); opacity: 0.8; }',
            '  100% { transform: scale(1.1) skewX(2deg); opacity: 1; }',
            '}',
            '#gift-box.opening .magic-flame-container { transform: translate3d(-50%, -200%, 80px) scale(2); }',
            '#gift-box.final-expand .magic-flame-container { transform: translate3d(-50%, -50%, 500px) scale(100); }',
            '#gift-box.final-expand::after {',
            '  content: ""; position: fixed; inset: 0; background: #fff; z-index: 1000;',
            '  opacity: 0; animation: whiteOut 2s forwards;',
            '}',
            '@keyframes whiteOut { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 1; } }',

            '.firefly {',
            '  position: absolute; width: 4px; height: 4px; background: #fcd34d;',
            '  border-radius: 50%; filter: blur(1px); pointer-events: none;',
            '  box-shadow: 0 0 8px #f59e0b; opacity: 0; transition: opacity 0.5s ease;',
            '}',

            '#gift-prompt {',
            '  margin-top: 50px; font-family: "Playfair Display", serif;',
            '  font-size: 16px; color: rgba(255,255,255,0.4);',
            '  animation: textPulse 2.5s infinite; letter-spacing: 2px;',
            '  transition: all 0.5s ease; max-width: 80%; text-align: center;',
            '}',
            '#gift-prompt.active { color: rgba(255,255,255,0.8); letter-spacing: 4px; }',

            '@keyframes orbitalRotate { 0% { transform: rotateX(-15deg) rotateY(0deg); } 100% { transform: rotateX(-15deg) rotateY(360deg); } }',
            '@keyframes envPulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }',
            '@keyframes textPulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.05); } }'
        ].join('\n');
        document.head.appendChild(el);
        return el;
    }

    function initFireflies() {
        var count = 50;
        var container = document.getElementById('phase2');
        for (var i = 0; i < count; i++) {
            var el = document.createElement('div');
            el.className = 'firefly';
            var type = Math.random();
            var size = 3 + Math.random() * 3;
            if (type < 0.1) size *= 1.5; // Giants

            el.style.width = size + 'px';
            el.style.height = size + 'px';
            container.appendChild(el);

            _fireflies.push({
                el: el,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                type: type, // 0-0.1: Giant, 0.1-0.2: Alive (Circle), 0.2-0.25: Fast, else: Normal
                angle: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.03
            });
        }
        setTimeout(function () {
            _fireflies.forEach(function (f) { f.el.style.opacity = Math.random() * 0.6 + 0.2; });
        }, 1000);
    }

    function updateFireflies() {
        var w = window.innerWidth, h = window.innerHeight;
        var time = Date.now() * 0.001;

        _fireflies.forEach(function (f) {
            if (f.type >= 0.1 && f.type < 0.2) {
                // Alive (Circles)
                f.x += Math.cos(time + f.angle) * 1.2;
                f.y += Math.sin(time + f.angle) * 1.2;
            } else if (f.type >= 0.2 && f.type < 0.25) {
                // Fast
                f.x += f.vx * 3; f.y += f.vy * 3;
            } else {
                f.x += f.vx; f.y += f.vy;
            }

            // Repulsion
            var dx = f.x - _mouse.x;
            var dy = f.y - _mouse.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                var force = (120 - dist) / 120;
                f.vx += (dx / dist) * force * 0.15;
                f.vy += (dy / dist) * force * 0.15;
            }

            // Boundaries
            if (f.x < -50) f.x = w + 50; if (f.x > w + 50) f.x = -50;
            if (f.y < -50) f.y = h + 50; if (f.y > h + 50) f.y = -50;

            f.el.style.transform = 'translate3d(' + f.x + 'px,' + f.y + 'px, 0)';
        });
        _rafId = requestAnimationFrame(updateFireflies);
    }

    function init() {
        _styleEl = createStyle();
        _startTime = Date.now();
        var phase2 = document.getElementById('phase2');
        var box = document.getElementById('gift-box');
        var prompt = document.getElementById('gift-prompt');
        if (!phase2 || !box || !prompt) return;

        phase2.classList.add('env-glow');
        box.classList.add('locked');
        prompt.textContent = "Wait… Chu has planned a gift for you.";

        box.innerHTML = [
            '<div class="cube-world">',
            '  <div class="face front"><div class="engraved-13">13</div></div>',
            '  <div class="face back"></div> <div class="face left"></div> <div class="face right"></div>',
            '  <div class="face top"></div> <div class="face bottom"></div>',
            '  <div class="magic-flame-container"><div class="flame-core"><div class="flame-layer"></div></div></div>',
            '</div>'
        ].join('');

        initFireflies();
        updateFireflies();

        setTimeout(function () {
            _isLocked = false;
            box.classList.remove('locked');
            prompt.textContent = "tap to open ✨";
            prompt.classList.add('active');
        }, 7000);

        window.addEventListener('mousemove', function (e) { _mouse.x = e.clientX; _mouse.y = e.clientY; });

        _onClickBox = function () {
            if (_isLocked) return;
            _tapCount++;
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
        var prompt = document.getElementById('gift-prompt');
        box.classList.add('opening');
        if (prompt) prompt.style.opacity = '0';

        setTimeout(function () {
            box.classList.add('final-expand');
            setTimeout(function () {
                Phase2.destroy();
                if (window.Phase3) window.Phase3.init(window.innerWidth / 2, window.innerHeight / 2);
            }, 2500);
        }, 2000);
    }

    function destroy() {
        var box = document.getElementById('gift-box');
        if (box && _onClickBox) box.removeEventListener('click', _onClickBox);
        if (_styleEl && _styleEl.parentNode) _styleEl.parentNode.removeChild(_styleEl);
        if (_rafId) cancelAnimationFrame(_rafId);
        _fireflies.forEach(function (f) { if (f.el.parentNode) f.el.parentNode.removeChild(f.el); });
        _fireflies = [];
        _styleEl = null; _onClickBox = null;
    }

    return { init: init, destroy: destroy };
}());
