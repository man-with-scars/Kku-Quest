// landing/session-manager.js
// Responsibility: Persistence of game and phase state across refreshes.
// Exposes: window.SessionManager

window.SessionManager = (function () {
    'use strict';

    const STORAGE_KEY = 'kku_quest_session';

    function save(data) {
        const current = load() || {};
        const updated = { ...current, ...data, lastUpdate: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        console.log('Session saved:', updated);
    }

    function load() {
        const data = localStorage.getItem(STORAGE_KEY);
        try {
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to parse session data:', e);
            return null;
        }
    }

    function clear() {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Session cleared.');
    }

    /**
     * Updates navigation history to allow "Back" button to roll back levels/phases
     * instead of leaving the site.
     */
    function pushState(phase, level = null) {
        const state = { phase, level };
        const url = level ? `?level=${level}` : `?phase=${phase}`;
        history.pushState(state, '', url);
    }

    // Initialize popstate listener
    window.addEventListener('popstate', (e) => {
        if (e.state) {
            console.log('Rolling back to:', e.state);
            // Re-bootstrap based on state
            bootstrapFromSession(e.state);
        }
    });

    function bootstrapFromSession(session = null) {
        const s = session || load();
        if (!s) return;

        console.log('Bootstrapping from session:', s);

        // Hide all phases first
        document.querySelectorAll('.phase').forEach(p => p.classList.remove('active'));

        if (s.phase === 'game') {
            // Restore Game
            const gamePhase = document.getElementById('game-phase');
            if (gamePhase) {
                gamePhase.classList.add('active');
                document.getElementById('app').style.display = 'none';

                // If game engine is loaded, try to jump to level
                const gameObj = window.Game || (window.G && window.G.Game);
                if (gameObj && s.level) {
                    // Level jumping logic depends on engine state, 
                    // usually engine handles its own window.STATE restoration
                }
            }
        } else if (s.phase) {
            // Restore Phase 1-4
            const phaseEl = document.getElementById(s.phase);
            if (phaseEl) {
                phaseEl.classList.add('active');
            }
        }
    }

    return {
        save,
        load,
        clear,
        pushState,
        bootstrapFromSession
    };
})();
