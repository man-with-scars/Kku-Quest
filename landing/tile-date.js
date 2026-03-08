// landing/tile-date.js
// Exposes: window.TileDate = { init }
// Responsibility: The "Living Character" behavior for the date tile (Phase 4).

window.TileDate = (function () {
    'use strict';

    var pill = null;
    var assets = null;
    var isBusy = false;
    var clickCount = 0;
    var wasTapped = false;

    function createStyle() {
        var el = document.createElement('style');
        el.textContent = `
            #date-pill .char-features {
                position: absolute; inset: 0; pointer-events: none; overflow: visible;
                display: flex; align-items: center; justify-content: center; opacity: 0;
                transition: opacity 0.3s; z-index: 50;
            }
            #date-pill.char-active { 
                background: #fff !important; 
                border-color: #7C3AED;
                box-shadow: 0 10px 30px rgba(124, 58, 237, 0.4);
            }
            #date-pill.char-active .date-text { opacity: 0; }
            #date-pill.char-active .char-features { opacity: 1; }

            .char-eye { 
                width: 12px; height: 12px; background: #2D1040; border-radius: 50%;
                position: absolute; top: 50%; margin-top: -6px;
                transition: all 0.2s;
            }
            .char-eye.l { left: 30%; }
            .char-eye.r { right: 30%; }
            
            .char-mouth {
                width: 14px; height: 8px; border-bottom: 3px solid #2D1040;
                border-radius: 0 0 12px 12px; position: absolute; bottom: 25%;
                left: 50%; margin-left: -7px; opacity: 0;
                transition: all 0.2s;
            }

            .char-hat {
                position: absolute; top: -28px; left: 50%; transform: translateX(-50%) rotate(-10deg);
                font-size: 28px; opacity: 0; transition: all 0.3s;
            }

            .ripple-circle {
                position: absolute; left: 50%; top: 50%; width: 10px; height: 10px;
                background: rgba(255, 50, 80, 0.6); border-radius: 50%;
                transform: translate(-50%, -50%) scale(0);
                pointer-events: none; z-index: 100;
            }

            /* Animations */
            @keyframes charLaugh {
                0%, 100% { transform: scale(1) translateY(0); }
                25% { transform: scale(1.1) translateY(-5px); }
                75% { transform: scale(0.95) translateY(2px); }
            }
            @keyframes charRipple {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(40); opacity: 0; }
            }
            @keyframes tileHeartbeat {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.08); }
            }
            
            .hint-bubble {
                position: absolute; top: calc(100% + 12px); left: 50%; transform: translateX(-50%);
                background: #7C3AED; color: white; padding: 4px 12px; border-radius: 12px;
                font-size: 11px; font-weight: 600; white-space: nowrap;
                animation: fadeup 0.5s forwards; z-index: 1000;
                box-shadow: 0 4px 10px rgba(124, 58, 237, 0.3);
            }
            .hint-bubble::after {
                content: ''; position: absolute; top: -6px; left: 50%; transform: translateX(-50%);
                border-left: 6px solid transparent; border-right: 6px solid transparent;
                border-bottom: 6px solid #7C3AED;
            }
        `;
        document.head.appendChild(el);
    }

    function buildFeatures() {
        var wrap = document.createElement('div');
        wrap.className = 'char-features';
        wrap.innerHTML = `
            <div class="char-eyes">
                <div class="char-eye l"></div>
                <div class="char-eye r"></div>
            </div>
            <div class="char-mouth"></div>
            <div class="char-hat">🤠</div>
            <div class="char-fx" style="position:absolute; inset:0; pointer-events:none;"></div>
            <div class="ripple-circle"></div>
        `;
        pill.appendChild(wrap);
        return {
            wrap: wrap,
            eyeL: wrap.querySelector('.char-eye.l'),
            eyeR: wrap.querySelector('.char-eye.r'),
            mouth: wrap.querySelector('.char-mouth'),
            hat: wrap.querySelector('.char-hat'),
            fx: wrap.querySelector('.char-fx'),
            ripple: wrap.querySelector('.ripple-circle')
        };
    }

    function playRandom() {
        if (isBusy) return;
        isBusy = true;
        clickCount++;
        wasTapped = true;
        document.dispatchEvent(new CustomEvent('kku:task-completed', { detail: 'date-tap' }));

        var acts = ['wink', 'smile', 'laugh', 'walle', 'cowboy', 'kiss', 'confetti'];
        var type = acts[Math.floor(Math.random() * acts.length)];

        // Visual Reset
        pill.classList.add('char-active');
        pill.style.animation = 'none'; // pause heartbeat
        assets.eyeL.style.cssText = '';
        assets.eyeR.style.cssText = '';
        assets.mouth.style.cssText = '';
        assets.hat.style.opacity = '0';

        if (type === 'wink') {
            setTimeout(() => {
                assets.eyeL.style.height = '3px';
                assets.eyeL.style.borderRadius = '2px';
                assets.eyeL.style.marginTop = '2px';
                assets.mouth.style.opacity = '1';
                setTimeout(() => {
                    endAct();
                }, 1000);
            }, 100);
        }
        else if (type === 'smile') {
            assets.mouth.style.opacity = '1';
            assets.mouth.style.width = '18px';
            assets.mouth.style.height = '10px';
            setTimeout(() => endAct(), 2000);
        }
        else if (type === 'laugh') {
            assets.mouth.style.opacity = '1';
            assets.mouth.style.width = '20px';
            assets.mouth.style.height = '12px';
            assets.mouth.style.background = '#2D1040';
            assets.mouth.style.borderRadius = '2px 2px 14px 14px';
            pill.style.animation = 'charLaugh 0.3s infinite';
            setTimeout(() => {
                pill.style.animation = 'none';
                endAct();
            }, 2000);
        }
        else if (type === 'walle') {
            assets.mouth.style.opacity = '1';
            assets.mouth.style.width = '8px';
            assets.mouth.style.height = '8px';
            assets.mouth.style.borderRadius = '50%';
            if (window.sfx) window.sfx('win');
            setTimeout(() => endAct(), 2000);
        }
        else if (type === 'cowboy') {
            assets.hat.style.opacity = '1';
            assets.hat.style.transform = 'translateX(-50%) translateY(-5px) rotate(0deg)';
            assets.mouth.style.opacity = '1';
            var rose = document.createElement('div');
            rose.textContent = '🌹';
            rose.style.cssText = 'position:absolute; bottom:5px; left:50%; transform:translateX(-50%); font-size:20px; animation:fadeup 0.5s forwards;';
            assets.fx.appendChild(rose);
            setTimeout(() => {
                rose.remove();
                endAct();
            }, 2000);
        }
        else if (type === 'kiss') {
            var kissEmoji = document.createElement('div');
            kissEmoji.textContent = '😘';
            kissEmoji.style.cssText = 'position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); font-size:32px; animation:popIn 0.4s forwards; z-index:110;';
            assets.fx.appendChild(kissEmoji);

            if (window.sfx) window.sfx('win');

            setTimeout(() => {
                // Red Ripple
                assets.ripple.style.animation = 'charRipple 0.8s ease-out forwards';
                kissEmoji.style.animation = 'fadeup 0.5s reverse forwards';

                // ── 5000 Heart Explosion ───────────────────────────
                spawnHearts(5000);

                setTimeout(() => {
                    assets.ripple.style.animation = '';
                    kissEmoji.remove();
                    endAct();
                }, 2000);
            }, 1000);
        }
        else if (type === 'confetti') {
            spawnConfetti();
            setTimeout(() => endAct(), 2000);
        }
    }

    function endAct() {
        pill.classList.remove('char-active');
        pill.style.animation = 'tileHeartbeat 3s infinite';
        isBusy = false;
    }

    function spawnConfetti() {
        var colors = ['#7C3AED', '#F0B429', '#ff3250', '#7c3aed'];
        for (let i = 0; i < 20; i++) {
            var c = document.createElement('div');
            c.style.cssText = `
                position:absolute; width:6px; height:6px; 
                background:${colors[Math.floor(Math.random() * colors.length)]};
                left:50%; top:50%; border-radius:50%; pointer-events:none;
                z-index:100;
            `;
            assets.fx.appendChild(c);
            var tx = (Math.random() - 0.5) * 160;
            var ty = (Math.random() - 0.5) * 120;
            c.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
            ], { duration: 1000, easing: 'cubic-bezier(0, .5, .5, 1)' });
            setTimeout(() => c.remove(), 1100);
        }
    }

    function spawnHearts(totalCount) {
        var emojis = ['❤️', '💖', '💕', '💗', '💓', '💜', '✨'];
        var startTime = Date.now();
        var duration = 8000; // 8 seconds of spawning
        var perBatch = Math.ceil(totalCount / (duration / 16)); // ~60fps target

        function tick() {
            var now = Date.now();
            var elapsed = now - startTime;
            if (elapsed > duration) return;

            var frag = document.createDocumentFragment();
            for (let i = 0; i < perBatch; i++) {
                var h = document.createElement('div');
                h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                h.style.cssText = `
                    position:fixed; 
                    left:${Math.random() * 100}vw; 
                    top:${100 + Math.random() * 20}vh; /* Start just off-screen */
                    font-size:${10 + Math.random() * 30}px;
                    pointer-events:none; z-index:9999;
                    opacity:0;
                    will-change: transform, opacity;
                `;
                frag.appendChild(h);

                var life = 3000 + Math.random() * 3000;
                h.animate([
                    { transform: 'translateY(0) scale(0)', opacity: 0 },
                    { transform: `translateY(${-200 - Math.random() * 800}px) scale(1.5)`, opacity: 1, offset: 0.1 },
                    { transform: `translateY(${-400 - Math.random() * 1000}px) scale(1)`, opacity: 0.8, offset: 0.8 },
                    { transform: `translateY(${-600 - Math.random() * 1200}px) scale(0)`, opacity: 0 }
                ], {
                    duration: life,
                    easing: 'cubic-bezier(0.1, 0.8, 0.3, 1)',
                    fill: 'forwards'
                });

                // Cleanup individual heart after its life
                setTimeout((function (el) {
                    return function () { el.remove(); };
                })(h), life + 100);
            }
            document.body.appendChild(frag);
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function startClickbait() {
        setInterval(() => {
            if (isBusy || pill.classList.contains('char-active')) return;
            var hints = ['Tap me! 😜', 'I am alive! 💫', '👀 Kku?', '✨ Surprise?'];
            var h = document.createElement('div');
            h.className = 'hint-bubble';
            h.textContent = hints[Math.floor(Math.random() * hints.length)];
            pill.appendChild(h);
            setTimeout(() => h.remove(), 4000);
        }, 15000);
    }

    function init() {
        pill = document.getElementById('date-pill');
        var text = pill ? pill.querySelector('.date-text') : null;
        if (!pill) return;
        if (!text) {
            // encapsulate text if needed
            pill.innerHTML = `<span class="date-text">${pill.innerHTML}</span>`;
        }

        createStyle();
        assets = buildFeatures();
        pill.style.animation = 'tileHeartbeat 3s infinite';
        pill.addEventListener('click', playRandom);
        startClickbait();
    }

    return {
        init: init,
        wasTapped: function () { return wasTapped; }
    };
}());
