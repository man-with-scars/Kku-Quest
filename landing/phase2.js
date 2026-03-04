// landing/phase2.js
// Exposes: window.Phase2 = { init, destroy }
// Responsibility: gift box on black background. Click → Phase3.init(x, y).

window.Phase2 = (function () {
    'use strict';

    // ── Private state ──────────────────────────────────────────
    var _onClickBox = null;
    var _onClickPrompt = null;
    var _styleEl = null;

    // ── Style injection ────────────────────────────────────────
    function createStyle() {
        var el = document.createElement('style');
        el.id = 'phase2-styles';
        el.textContent = [
            '#gift-box {',
            '  position:relative; width:220px; height:240px; cursor:pointer;',
            '  animation:livingHeartbeat 3s ease-in-out infinite;',
            '  filter:drop-shadow(0 16px 40px rgba(124,58,237,0.3));',
            '  transition:transform 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275);',
            '  display:flex; flex-direction:column; align-items:center; justify-content:flex-end;',
            '}',
            '#gift-box:hover { transform:scale(1.08) rotate(2deg); }',

            '.box-body {',
            '  width:200px; height:140px;',
            '  background:linear-gradient(135deg,#FFF8F0,#F5E6C8);',
            '  border-radius:0 0 12px 12px; position:relative; overflow:hidden;',
            '  border:3px solid #7C3AED;',
            '  box-shadow: inset 0 -10px 20px rgba(0,0,0,0.05);',
            '  z-index:1;',
            '}',

            '.box-lid {',
            '  width:216px; height:45px;',
            '  background:linear-gradient(135deg,#F5E6C8,#FFF8F0);',
            '  border-radius:10px; z-index:5;',
            '  border:3px solid #7C3AED;',
            '  margin-bottom:-6px;',
            '  position:relative;',
            '}',

            '.box-ribbon-v {',
            '  position:absolute; left:50%; top:0; bottom:0;',
            '  width:32px; margin-left:-16px;',
            '  background:linear-gradient(90deg,#7C3AED,#a855f7);',
            '  border-left:2px solid rgba(255,255,255,0.2);',
            '  border-right:2px solid rgba(0,0,0,0.1);',
            '  z-index:2;',
            '}',

            '.box-date {',
            '  position:absolute; inset:0;',
            '  display:flex; align-items:center; justify-content:center;',
            '  font-family:sans-serif; font-weight:900;',
            '  font-size:32px; color:#7C3AED;',
            '  z-index:10; letter-spacing:2px;',
            '}',

            '.box-bow {',
            '  position:absolute; top:-30px; left:50%;',
            '  transform:translateX(-50%);',
            '  width:90px; height:50px; z-index:10;',
            '}',
            '.bow-left, .bow-right {',
            '  position:absolute; bottom:0;',
            '  width:45px; height:35px;',
            '  background:linear-gradient(135deg,#a855f7,#7C3AED);',
            '  border-radius:50%; border:2px solid #fff;',
            '}',
            '.bow-left  { left:0;  transform:rotate(-35deg); transform-origin:right bottom; }',
            '.bow-right { right:0; transform:rotate(35deg);  transform-origin:left bottom; }',
            '.bow-center {',
            '  position:absolute; bottom:5px; left:50%;',
            '  transform:translateX(-50%);',
            '  width:22px; height:22px;',
            '  background:#7C3AED; border-radius:50%; z-index:11;',
            '  border:2px solid #fff; box-shadow:0 4px 10px rgba(0,0,0,0.2);',
            '}',

            '#gift-prompt {',
            '  margin-top:30px; font-family:sans-serif;',
            '  font-size:18px; font-weight:700;',
            '  color:rgba(255,255,255,0.9);',
            '  animation:pulse 2s infinite;',
            '  text-transform:uppercase; letter-spacing:1px;',
            '}',

            '@keyframes livingHeartbeat {',
            '  0%, 100% { transform: scale(1); }',
            '  50% { transform: scale(1.05); }',
            '}'
        ].join('\n');

        document.head.appendChild(el);
        return el;
    }

    // ── Click handler ──────────────────────────────────────────
    function handleClick(e) {
        var clickX = e.clientX;
        var clickY = e.clientY;
        Phase2.destroy();
        if (window.Phase3 && typeof Phase3.init === 'function') {
            Phase3.init(clickX, clickY);
        }
    }

    // ── Public API ─────────────────────────────────────────────
    function init() {
        _styleEl = createStyle();

        var box = document.getElementById('gift-box');
        var prompt = document.getElementById('gift-prompt');

        if (!box || !prompt) {
            console.warn('Phase2: #gift-box or #gift-prompt not found');
            return;
        }

        // Start invisible
        box.style.opacity = '0';
        prompt.style.opacity = '0';

        // Fade in box after a short ramp
        box.style.transition = 'opacity 600ms ease';
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                box.style.opacity = '1';
            });
        });

        // Fade in prompt 400ms later
        setTimeout(function () {
            prompt.style.transition = 'opacity 600ms ease';
            prompt.style.opacity = '1';
        }, 400);

        // Attach click listeners
        _onClickBox = handleClick;
        _onClickPrompt = handleClick;
        box.addEventListener('click', _onClickBox);
        prompt.addEventListener('click', _onClickPrompt);
    }

    function destroy() {
        var box = document.getElementById('gift-box');
        var prompt = document.getElementById('gift-prompt');

        if (box && _onClickBox) { box.removeEventListener('click', _onClickBox); }
        if (prompt && _onClickPrompt) { prompt.removeEventListener('click', _onClickPrompt); }

        // Kill float animation
        if (box) { box.style.animation = 'none'; }

        _onClickBox = null;
        _onClickPrompt = null;

        // Remove injected styles
        if (_styleEl && _styleEl.parentNode) {
            _styleEl.parentNode.removeChild(_styleEl);
            _styleEl = null;
        }
    }

    return { init: init, destroy: destroy };
}());
