window.Phase2 = (function () {
    'use strict';

    var _onClickBox = null;
    var _onClickPrompt = null;
    var _styleEl = null;

    function createStyle() {
        var el = document.createElement('style');
        el.id = 'phase2-styles';
        el.textContent = [
            '#gift-box {',
            '  position:relative; width:300px; height:300px; cursor:pointer;',
            '  display:flex; align-items:center; justify-content:center;',
            '  perspective: 1200px;',
            '  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);',
            '}',
            '#gift-box:hover { transform: scale(1.1); }',

            '.cube-world {',
            '  width: 160px; height: 160px;',
            '  position: relative;',
            '  transform-style: preserve-3d;',
            '  animation: orbitalRotate 12s linear infinite;',
            '}',

            '.face {',
            '  position: absolute;',
            '  width: 160px; height: 160px;',
            '  background: rgba(124, 58, 237, 0.15);',
            '  backdrop-filter: blur(12px);',
            '  border: 1.5px solid rgba(255, 255, 255, 0.25);',
            '  box-shadow: inset 0 0 30px rgba(124, 58, 237, 0.3);',
            '  display: flex; align-items: center; justify-content: center;',
            '  color: white; font-family: "Playfair Display", serif;',
            '  font-size: 24px; font-weight: 700; letter-spacing: 2px;',
            '  pointer-events: none;',
            '  overflow: hidden;',
            '}',

            '.face.front  { transform: rotateY(0deg)   translateZ(80px); }',
            '.face.back   { transform: rotateY(180deg) translateZ(80px); }',
            '.face.right  { transform: rotateY(90deg)  translateZ(80px); }',
            '.face.left   { transform: rotateY(-90deg) translateZ(80px); }',
            '.face.top    { transform: rotateX(90deg)  translateZ(80px); }',
            '.face.bottom { transform: rotateX(-90deg) translateZ(80px); }',

            '/* Shimmer effect on faces */',
            '.face::after {',
            '  content: ""; position: absolute; inset: -50%;',
            '  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);',
            '  transform: rotate(45deg); animation: shimmer 4s infinite;',
            '}',

            '.magic-core {',
            '  position: absolute; top: 50%; left: 50%;',
            '  width: 60px; height: 60px;',
            '  background: radial-gradient(circle, #fff 0%, #fcd34d 30%, #f59e0b 60%, transparent 100%);',
            '  border-radius: 50%;',
            '  transform: translate3d(-50%, -50%, 0);',
            '  filter: blur(8px);',
            '  box-shadow: 0 0 60px 20px rgba(245, 158, 11, 0.6);',
            '  animation: corePulse 3s ease-in-out infinite;',
            '  z-index: 2;',
            '}',

            '.cube-ribbon-v, .cube-ribbon-h {',
            '  position: absolute; top: 0; left: 0; width: 100%; height: 100%;',
            '  transform-style: preserve-3d;',
            '  pointer-events: none;',
            '}',

            '.ribbon-face {',
            '  position: absolute; background: linear-gradient(90deg, #7C3AED, #a855f7, #7C3AED);',
            '  border: 1px solid rgba(255,255,255,0.2);',
            '}',
            '/* Vertical Ribbon Wrapper Round */',
            '.rv-f { width: 30px; height: 160px; left: 65px; transform: rotateY(0deg) translateZ(81px); }',
            '.rv-b { width: 30px; height: 160px; left: 65px; transform: rotateY(180deg) translateZ(81px); }',
            '.rv-t { width: 30px; height: 160px; left: 65px; transform: rotateX(90deg) translateZ(81px); }',
            '.rv-bm { width: 30px; height: 160px; left: 65px; transform: rotateX(-90deg) translateZ(81px); }',

            '/* Horizontal Ribbon Wrapper Round */',
            '.rh-f { width: 160px; height: 30px; top: 65px; transform: rotateY(0deg) translateZ(81px); }',
            '.rh-b { width: 160px; height: 30px; top: 65px; transform: rotateY(180deg) translateZ(81px); }',
            '.rh-l { width: 160px; height: 30px; top: 65px; transform: rotateY(-90deg) translateZ(81px); }',
            '.rh-r { width: 160px; height: 30px; top: 65px; transform: rotateY(90deg) translateZ(81px); }',

            '#gift-prompt {',
            '  margin-top: 40px; font-family: "Playfair Display", serif;',
            '  font-size: 18px; color: rgba(255,255,255,0.6);',
            '  animation: textPulse 2s infinite;',
            '  text-transform: lowercase; letter-spacing: 2px;',
            '}',

            '@keyframes orbitalRotate {',
            '  0% { transform: rotateX(-20deg) rotateY(0deg); }',
            '  100% { transform: rotateX(-20deg) rotateY(360deg); }',
            '}',

            '@keyframes corePulse {',
            '  0%, 100% { transform: translate3d(-50%, -50%, 0) scale(1); opacity: 0.8; }',
            '  50% { transform: translate3d(-50%, -50%, 0) scale(1.2); opacity: 1; }',
            '}',

            '@keyframes shimmer {',
            '  0% { transform: translateX(-150%) rotate(45deg); }',
            '  100% { transform: translateX(150%) rotate(45deg); }',
            '}',

            '@keyframes textPulse { 0%, 100% { opacity:0.4; transform: scale(0.98); } 50% { opacity:1; transform: scale(1.02); } }'
        ].join('\n');

        document.head.appendChild(el);
        return el;
    }

    function init() {
        _styleEl = createStyle();

        var box = document.getElementById('gift-box');
        var prompt = document.getElementById('gift-prompt');

        if (!box || !prompt) return;

        // Build 3D Structure
        box.innerHTML = [
            '<div class="cube-world">',
            '  <!-- Faces -->',
            '  <div class="face front">13 / 03</div>',
            '  <div class="face back"></div>',
            '  <div class="face left"></div>',
            '  <div class="face right"></div>',
            '  <div class="face top"></div>',
            '  <div class="face bottom"></div>',
            '  ',
            '  <!-- Magical Core -->',
            '  <div class="magic-core"></div>',
            '  ',
            '  <!-- Ribbons -->',
            '  <div class="ribbon-face rv-f"></div>',
            '  <div class="ribbon-face rv-b"></div>',
            '  <div class="ribbon-face rv-t"></div>',
            '  <div class="ribbon-face rv-bm"></div>',
            '  <div class="ribbon-face rh-f"></div>',
            '  <div class="ribbon-face rh-b"></div>',
            '  <div class="ribbon-face rh-l"></div>',
            '  <div class="ribbon-face rh-r"></div>',
            '</div>'
        ].join('');

        box.style.opacity = '0';
        prompt.style.opacity = '0';

        box.style.transition = 'opacity 1s ease, transform 0.5s ease';
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                box.style.opacity = '1';
            });
        });

        setTimeout(function () {
            prompt.style.transition = 'opacity 1s ease';
            prompt.style.opacity = '1';
        }, 500);

        _onClickBox = handleClick;
        box.addEventListener('click', _onClickBox);
    }

    function handleClick(e) {
        var clickX = e.clientX;
        var clickY = e.clientY;
        Phase2.destroy();
        if (window.Phase3 && typeof Phase3.init === 'function') {
            Phase3.init(clickX, clickY);
        }
    }

    function destroy() {
        var box = document.getElementById('gift-box');
        if (box && _onClickBox) { box.removeEventListener('click', _onClickBox); }
        if (_styleEl && _styleEl.parentNode) {
            _styleEl.parentNode.removeChild(_styleEl);
            _styleEl = null;
        }
        _onClickBox = null;
    }

    return { init: init, destroy: destroy };
}());
