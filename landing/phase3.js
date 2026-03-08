// landing/phase3.js
// Exposes: window.Phase3 = { init, destroy }
// Responsibility: spreading darkness overlay + voice monologue + glitch + reveal Phase 4.
// Plays ONCE only (localStorage guard).

window.Phase3 = (function () {
    'use strict';

    // ── Private state ──────────────────────────────────────────
    var overlay = null;
    var synth = window.speechSynthesis;

    var LINES = [
        { text: 'Kku.....', pause: 2000 },
        { text: 'Kku.....', pause: 1500 },
        { text: 'I knew you would come.', pause: 400 },
        { text: 'Like I happened to come into your life.', pause: 400 },
        { text: 'Do you know how happy I became after you came into my life...', pause: 400 },
        { text: 'All the laughs we shared...', pause: 350 },
        { text: 'All the nights we spent talking...', pause: 350 },
        { text: 'All the days we fought but never quit...', pause: 400 },
        { text: 'I knew you would come looking for me.', pause: 500 },
        { text: 'I was going to get you a surprise...', pause: 400 },
        { text: "Don't you wanna see what I've planned for you?", pause: 0 },
    ];

    // ── Step 4 — Audio glitch burst ────────────────────────────
    function triggerGlitch() {
        synth.cancel();

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
            // AudioContext might be blocked; swallow silently
        }

        // CSS glitch flash on overlay
        if (overlay) {
            overlay.style.animation = 'glitch 80ms steps(1) 8';
        }

        setTimeout(function () {
            if (overlay) { overlay.style.animation = ''; }
            showPhase4();
        }, 700);
    }

    // ── Step 3 — Voice monologue ───────────────────────────────
    function speakNext(idx) {
        if (idx >= LINES.length) {
            triggerGlitch();
            return;
        }

        var line = LINES[idx];
        var u = new SpeechSynthesisUtterance(line.text);
        u.rate = 0.82;
        u.pitch = 0.88;
        u.volume = 1.0;

        u.onend = function () {
            setTimeout(function () { speakNext(idx + 1); }, line.pause);
        };

        // Guard against synth dying mid-session
        u.onerror = function () {
            setTimeout(function () { speakNext(idx + 1); }, line.pause);
        };

        synth.speak(u);
    }

    function startVoice() {
        // Some browsers suspend speechSynthesis — cancel first to reset
        synth.cancel();
        speakNext(0);
    }

    // ── Step 5 — Reveal Phase 4 ────────────────────────────────
    function showPhase4() {
        var C = window.KKU_CONFIG;
        try { localStorage.setItem(C.INTRO_KEY, '1'); } catch (e) { }

        if (overlay) {
            overlay.style.transition = 'opacity 2500ms ease-out';
            overlay.style.opacity = '0';
        }

        // Activate Phase 4 simultaneously with the fade-out
        var phases = document.querySelectorAll('.phase');
        for (var i = 0; i < phases.length; i++) {
            phases[i].classList.remove('active');
        }

        var p4 = document.getElementById('phase4');
        if (p4) { p4.classList.add('active'); }

        setTimeout(function () {
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
                overlay = null;
            }
            if (window.Phase4Shell && typeof Phase4Shell.init === 'function') {
                Phase4Shell.init();
            }
        }, 2500);
    }

    // ── Public API ─────────────────────────────────────────────
    function init(clickX, clickY) {
        var C = window.KKU_CONFIG;

        // ── STEP 1: localStorage guard ──
        try {
            if (localStorage.getItem(C.INTRO_KEY)) {
                showPhase4();
                return;
            }
        } catch (e) {
            // Private browsing may block localStorage — proceed normally
        }

        // ── STEP 2: Spreading darkness overlay ──
        overlay = document.createElement('div');
        overlay.id = 'spread-overlay';
        overlay.style.cssText = [
            'position:fixed',
            'inset:0',
            'z-index:150',
            'background:#f59e0b', // warm light color matching phase2's pop
            'pointer-events:all',
            'clip-path:circle(0px at ' + clickX + 'px ' + clickY + 'px)',
            'transition:clip-path 1200ms ease-in, background 1500ms ease-out 1200ms',
        ].join(';');

        document.body.appendChild(overlay);

        // Force reflow so the clip-path transition fires from 0 → full
        overlay.getBoundingClientRect();
        overlay.style.clipPath = 'circle(150vmax at ' + clickX + 'px ' + clickY + 'px)';

        // After expansion starts, schedule the background fade to white
        setTimeout(function () {
            if (overlay) overlay.style.background = '#fff';
        }, 1200);

        // After spread complete, start voice
        setTimeout(startVoice, 1400);
    }

    function destroy() {
        if (synth) { try { synth.cancel(); } catch (e) { } }
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
            overlay = null;
        }
    }

    return { init: init, destroy: destroy };
}());
