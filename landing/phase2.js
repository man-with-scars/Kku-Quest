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
            '  position:relative; width:200px; height:200px; cursor:pointer;',
            '  animation:float 3s ease-in-out infinite;',
            '  filter:drop-shadow(0 0 32px rgba(124,58,237,0.45));',
            '  transition:transform 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275);',
            '}',
            '#gift-box:hover { transform:scale(1.08) rotate(2deg); }',

            '.box-body {',
            '  position:absolute; bottom:0; left:0;',
            '  width:200px; height:130px;',
            '  background:linear-gradient(145deg, #9b59f7, #6d28d9);',
            '  border-radius:8px 8px 14px 14px; position:relative; overflow:hidden;',
            '  border:2px solid rgba(255,255,255,0.1);',
            '  z-index:1;',
            '}',

            '.box-lid {',
            '  position:absolute; top:32px; left:-8px;',
            '  width:216px; height:44px;',
            '  background:linear-gradient(145deg, #c084fc, #7C3AED);',
            '  border-radius:8px; z-index:5;',
            '  border:1px solid rgba(255,255,255,0.2);',
            '}',

            '.box-ribbon-v {',
            '  position:absolute; left:50%; top:0; bottom:0;',
            '  width:20px; transform:translateX(-50%);',
            '  background:#F0B429; opacity:0.9;',
            '  z-index:2;',
            '}',

            '.box-date {',
            '  position:absolute; bottom:18px; left:50%;',
            '  transform:translateX(-50%);',
            '  font-family:"Playfair Display", serif; font-weight:700;',
            '  font-size:22px; color:rgba(255,255,255,0.9);',
            '  z-index:10; letter-spacing:2px; white-space:nowrap;',
            '  text-shadow: 0 0 12px rgba(255,255,255,0.4);',
            '}',

            '.box-bow {',
            '  position:absolute; top:4px; left:50%;',
            '  transform:translateX(-50%);',
            '  width:80px; height:50px; z-index:10;',
            '}',
            '.bow-left, .bow-right {',
            '  position:absolute; bottom:0;',
            '  width:34px; height:30px;',
            '  background:linear-gradient(135deg, #fcd34d, #f59e0b);',
            '  box-shadow: inset 0 2px 6px rgba(0,0,0,0.2);',
            '}',
            '.bow-left  { left:0; transform:rotate(-25deg); transform-origin:right bottom; border-radius:50% 50% 0 50%; }',
            '.bow-right { right:0; transform:rotate(25deg); transform-origin:left bottom;  border-radius:50% 50% 50% 0; }',
            '.bow-center {',
            '  position:absolute; bottom:0; left:50%;',
            '  transform:translateX(-50%);',
            '  width:14px; height:14px;',
            '  background:#f59e0b; border-radius:50%; z-index:11;',
            '  box-shadow: 0 0 8px rgba(245, 158, 11, 0.7);',
            '}',

            '#gift-prompt {',
            '  margin-top:30px; font-family:"Playfair Display", serif;',
            '  font-size:18px; font-weight:700;',
            '  color:rgba(255,255,255,0.65);',
            '  animation:pulse 2.5s infinite;',
            '  text-transform:lowercase; letter-spacing:1px;',
            '}',

            '@keyframes float {',
            '  0%, 100% { transform: translateY(0px); }',
            '  50% { transform: translateY(-14px); }',
            '}',
            '@keyframes pulse { 0%, 100% { opacity:1; } 50% { opacity:0.65; } }'
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
