// game/engine.js
// Exposes: window.Game, window.G, window.STATE, window.levelDone, etc.
// Responsibility: Master game state, level loader, navigation, and utilities.

(function () {
    'use strict';

    // ── Mutable Game State ─────────────────────────────────────
    window.STATE = {
        lives: 3,
        completed: new Set(),
        fragments: {},          // {fragId: value}
        uploads: [],
        devTaps: 0,
        devMode: false,
        spsElf: false,
        currentLevel: null,
        currentView: null,
        storyDone: false,
        notifyIndex: 0,
        assetStore: { bg: {}, char: {}, music: {}, story: {} }
    };

    /**
     * Injects local CSS for the engine (HUD, particles, overlays).
     */
    function createStyle() {
        const css = `
      #fragments-popup {
        display: none;
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: var(--parchment);
        border: 4px solid var(--gold);
        border-radius: 20px;
        padding: 40px;
        flex-direction: column;
        align-items: center;
        z-index: 70;
        box-shadow: 0 0 50px rgba(0,0,0,0.3);
        animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      #particles {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
      }
      .particle {
        position: absolute;
        bottom: -50px;
        font-size: 20px;
        opacity: 0.6;
        animation: riseup 5s linear infinite;
      }

      #bh-msg {
        color: white;
        font-family: 'Fredoka', cursive;
        font-size: 32px;
        text-align: center;
        animation: popIn 0.6s ease-out;
      }

      #btn-yes.pulse {
        animation: pulse 1.5s ease-in-out infinite;
      }
    `;
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ── HUD Utilities ───────────────────────────────────────────
    function updateHUD(lv, title, hint) {
        const elLv = document.getElementById('hud-lv');
        const elHint = document.getElementById('hint-text');
        const elTitle = document.getElementById('hud-title');

        if (elLv) elLv.textContent = lv;
        if (elHint) elHint.textContent = hint || '';
        // Optional: title update
    }

    function renderHearts() {
        const el = document.getElementById('hud-hearts');
        if (!el) return;
        el.innerHTML = '❤️'.repeat(window.STATE.lives) + '🖤'.repeat(3 - window.STATE.lives);

        // Add recording indicator if active
        if (window.MediaStorage && window.MediaStorage.hasActiveRecordings()) {
            const indicator = document.createElement('span');
            indicator.id = 'rec-indicator';
            indicator.style.cssText = 'color:#ff3250; font-size:10px; margin-left:10px; animation:blink 1s infinite;';
            indicator.textContent = '🔴 REC';
            el.appendChild(indicator);
        }
    }

    // ── Navigation ──────────────────────────────────────────────
    window.G = {
        go: function (viewId) {
            document.querySelectorAll('#stage .view').forEach(v => v.classList.remove('active'));
            let v = document.getElementById(viewId);
            if (!v) {
                v = document.createElement('div');
                v.id = viewId;
                v.className = 'view';
                document.getElementById('stage').appendChild(v);
            }
            v.classList.add('active');
            window.STATE.currentView = viewId;

            // Render the map whenever we navigate to it
            if (viewId === 'v-map' && window.Map && window.Map.init) {
                window.Map.init(v);
            }

            // Hide God Mode pass button if not in a level
            if (window.DevMode && window.DevMode.togglePassButton) {
                const isLevel = viewId.startsWith('v-L') || viewId === 'v-sps' || viewId === 'v-word' || viewId === 'v-marry' || viewId === 'v-keylock';
                if (!isLevel) window.DevMode.togglePassButton(false);
            }
        },

        loseLife: function () {
            window.STATE.lives--;
            renderHearts();
            window.sfx('bad');
            if (window.STATE.lives <= 0) {
                // Game over: reset and kick to map
                window.STATE.lives = 3;
                renderHearts();
                window.G.go('v-map');
            }
        },

        updateHUD: updateHUD
    };

    // ── Global Actions ──────────────────────────────────────────
    window.levelDone = function (id) {
        window.STATE.completed.add(id);
        window.sfx('up');

        // Assign fragment if applicable
        const frag = window.GAME_CONFIG.FRAGMENTS.find(f => f.level == id);
        if (frag) {
            window.STATE.fragments[frag.id] = frag.value;
            showFragmentPopup(frag);
        }

        // Web notification if available
        if (window.GameNotifications && window.GameNotifications.send) {
            window.GameNotifications.send();
        }

        if (window.DevMode && window.DevMode.togglePassButton) {
            window.DevMode.togglePassButton(false);
        }

        // Save progress
        if (window.SessionManager) {
            const stateToSave = { ...window.STATE, completed: Array.from(window.STATE.completed) };
            SessionManager.save({ phase: 'game', gameState: stateToSave });
        }

        setTimeout(() => window.G.go('v-map'), 800);
    };

    window.launchLevel = function (id) {
        const reg = (window.LEVEL_REGISTRY || []).find(r =>
            String(r.id).toLowerCase() === String(id).toLowerCase() ||
            Number(r.id) === Number(id)
        );
        if (!reg) return;
        window.STATE.currentLevel = id;

        // Save progress to SessionManager
        if (window.SessionManager) {
            const stateToSave = { ...window.STATE, completed: Array.from(window.STATE.completed) };
            SessionManager.save({ phase: 'game', level: id, gameState: stateToSave });
            SessionManager.pushState('game', id);
        }

        updateHUD('LV ' + id, reg.title, reg.hint || '');
        window.G.go(reg.view);

        if (window.DevMode && window.DevMode.togglePassButton) {
            window.DevMode.togglePassButton(true);
        }
    };

    window.showHint = function (levelId) {
        const text = window.GAME_CONFIG.LEVEL_HINTS[levelId];
        if (!text) return;

        const el = document.getElementById('hint-overlay');
        if (!el) return;

        // Ensure structure
        if (!el.innerHTML) {
            el.innerHTML = `
        <div style="background:var(--parchment); padding:20px; border-top:4px solid var(--amber); width:100%; pointer-events:auto;">
          <div id="hint-overlay-text" style="font-size:16px; margin-bottom:10px;"></div>
          <button id="hint-overlay-close" style="background:var(--amber); color:white; border:none; padding:5px 15px; border-radius:5px; cursor:pointer;">DISMISS</button>
        </div>
      `;
        }

        el.querySelector('#hint-overlay-text').textContent = text;
        el.style.display = 'flex';

        const timer = setTimeout(() => { el.style.display = 'none'; }, 12000);
        el.querySelector('#hint-overlay-close').onclick = () => {
            clearTimeout(timer);
            el.style.display = 'none';
        };
    };

    window.blackHole = function (msg, cb) {
        const el = document.getElementById('blackhole-overlay');
        if (!el) return;

        if (!el.innerHTML) {
            el.innerHTML = '<div id="bh-msg"></div>';
        }

        el.querySelector('#bh-msg').textContent = msg || 'The void claims you...';
        el.style.display = 'flex';
        window.sfx('bh');

        setTimeout(() => {
            el.style.display = 'none';
            if (cb) cb();
        }, 3800);
    };

    window.sfx = function (key) {
        try {
            if (window.GAME_CONFIG.SFX[key]) {
                new Audio(window.GAME_CONFIG.SFX[key]).play();
            }
        } catch (e) { }
    };

    window.triggerFinalSequence = function () {
        window.sfx('win');

        // 1. Create black fade overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position:fixed; inset:0; background:black; z-index:9000;
            opacity:0; transition:opacity 2.5s ease-in; pointer-events:all;
            display:flex; flex-direction:column; align-items:center; justify-content:center;
        `;
        document.body.appendChild(overlay);

        // Force reflow
        overlay.getBoundingClientRect();
        overlay.style.opacity = '1';

        // 2. Play Web Speech API voice (same as landing phase 3)
        setTimeout(() => {
            if ('speechSynthesis' in window) {
                const voiceText = "In the silence, I found your heart. Through the binary, I saw our world. You are my most beautiful glitch. I love you, now and always.";
                const utter = new SpeechSynthesisUtterance(voiceText);
                utter.rate = 0.85; utter.pitch = 0.95;
                utter.onend = () => {
                    setTimeout(() => {
                        overlay.style.transition = 'opacity 1s ease-out';
                        overlay.style.opacity = '0';
                        setTimeout(() => {
                            overlay.remove();

                            // Trigger final recording export
                            if (window.MediaStorage) {
                                window.MediaStorage.stopAllAndExport();
                            }

                            if (window.Ending && window.Ending.buildEnding) {
                                window.Ending.buildEnding();
                            } else {
                                window.levelDone('keylock');
                            }
                        }, 1000);
                    }, 1000);
                };
                window.speechSynthesis.speak(utter);
            } else {
                // Fallback if no speech
                setTimeout(() => {
                    overlay.remove();
                    window.levelDone('keylock');
                }, 3000);
            }
        }, 2000);
    };

    window.uploadGH = async function (file, filename) {
        console.log('GitHub upload disabled. Media saved locally via MediaStorage.');
    };

    // ── Audio Recording Skeleton ───────────────────────────────
    window._recorders = {};
    window.startRec = function (id) {
        console.log('Recording started for:', id);
        // Implementation would go here if needed per level
    };
    window.stopRec = function (id, cb) {
        console.log('Recording stopped for:', id);
        if (cb) cb(null);
    };

    // ── Private Helpers ─────────────────────────────────────────
    function showFragmentPopup(frag) {
        let el = document.getElementById('fragment-popup');
        if (!el) return;

        el.innerHTML = `
      <div style="background:var(--parchment); padding:20px; border:4px solid var(--gold); border-radius:15px; text-align:center;">
        <div style="font-size:48px;color:var(--gold);font-family:'Fredoka', cursive">${frag.value}</div>
        <div style="font-size:13px;color:var(--sub);font-family:'Nunito'">${frag.hint}</div>
      </div>
    `;
        el.style.display = 'flex';
        setTimeout(() => { el.style.display = 'none'; }, 3000);
    }

    function setupParticles() {
        const container = document.createElement('div');
        container.id = 'particles';
        document.body.appendChild(container);

        const emojis = ['❤️', '✨', '🌸', '💭'];
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            p.style.left = Math.random() * 100 + 'vw';
            p.style.animationDelay = Math.random() * 5 + 's';
            p.style.animationDuration = (3 + Math.random() * 4) + 's';
            container.appendChild(p);
        }
    }

    function setupDevTaps() {
        const hearts = document.getElementById('hud-hearts');
        if (!hearts) return;

        let devTimer = null;
        hearts.addEventListener('click', () => {
            window.STATE.devTaps++;
            if (devTimer) clearTimeout(devTimer);

            if (window.STATE.devTaps >= 5) {
                window.STATE.devTaps = 0;
                if (window.DevMode && window.DevMode.promptLogin) {
                    window.DevMode.promptLogin();
                } else if (window.DevMode && window.DevMode.toggle) {
                    window.DevMode.toggle(); // Fallback to toggle
                }
            }

            devTimer = setTimeout(() => {
                window.STATE.devTaps = 0;
            }, 350);
        });
    }

    // ── Engine Main Initialization ──────────────────────────────
    window.Game = {
        init: async function () {
            try {
                // Sync STATE with SessionManager if it exists
                if (window.SessionManager) {
                    const session = SessionManager.load();
                    if (session && session.gameState) {
                        console.log("Syncing Game STATE with session...");
                        window.STATE = { ...window.STATE, ...session.gameState };
                        // Note: completed Set might need re-hydration
                        if (session.gameState.completed) {
                            window.STATE.completed = new Set(session.gameState.completed);
                        }
                    }
                }

                createStyle();
                setupParticles();

                const log = document.getElementById('boot-log');
                if (log) log.textContent = "Loading assets...";

                const loadingView = document.getElementById('v-loading');
                if (loadingView) {
                    loadingView.innerHTML = `
                        <div style="width:200px; height:10px; background:rgba(0,0,0,0.1); border-radius:5px; position:relative;">
                            <div id="load-bar" style="height:100%; background:var(--purple); width:0%; border-radius:5px; transition:width 0.2s;"></div>
                        </div>
                        <div style="margin-top:10px; font-size:12px; color:var(--sub);">Gathering fragments...</div>
                    `;
                }
                const elBar = document.getElementById('load-bar');

                window.LEVEL_REGISTRY = [];
                const files = window.GAME_CONFIG.LEVEL_FILES;

                for (let i = 0; i < files.length; i++) {
                    const url = window.GAME_CONFIG.GH_RAW + files[i];
                    const res = await fetch(url);
                    if (!res.ok) throw new Error('Level load failed: ' + files[i]);
                    const content = await res.text();

                    const s = document.createElement('script');
                    s.textContent = content;
                    document.head.appendChild(s);

                    if (elBar) elBar.style.width = ((i + 1) / files.length * 100) + '%';
                }

                setTimeout(() => {
                    window.LEVEL_REGISTRY.sort((a, b) => {
                        const idA = parseFloat(a.id);
                        const idB = parseFloat(b.id);
                        if (!isNaN(idA) && !isNaN(idB)) return idA - idB;
                        return String(a.id).localeCompare(String(b.id));
                    });

                    const stage = document.getElementById('stage');
                    window.LEVEL_REGISTRY.forEach(reg => {
                        let v = document.getElementById(reg.view);
                        if (!v) {
                            v = document.createElement('div');
                            v.id = reg.view;
                            v.className = 'view';
                            stage.appendChild(v);
                        }
                        if (typeof reg.build === 'function') {
                            try { reg.build(v); } catch (e) { console.error('Build fail for', reg.id, e); }
                        }
                    });

                    renderHearts();
                    setupDevTaps();

                    const titleView = document.getElementById('v-title');
                    titleView.innerHTML = `
                        <h1 style="font-family:'Fredoka', cursive; font-size:48px; color:var(--purple); margin-bottom:20px; animation:popIn 0.8s;">Kku's Quest 💕</h1>
                        <button id="btn-start-game" style="padding:15px 40px; background:var(--gold); border:none; border-radius:30px; color:white; font-size:24px; font-family:'Fredoka', cursive; cursor:pointer; box-shadow:0 5px 15px rgba(240,180,41,0.4);">START</button>
                    `;

                    const startBtn = document.getElementById('btn-start-game');
                    if (startBtn) {
                        startBtn.onclick = () => {
                            window.G.go('v-story');
                            if (window.Story && window.Story.init) {
                                window.Story.init(document.getElementById('v-story'));
                            }
                        };
                    }

                    window.G.go('v-title');
                    if (log) log.style.display = 'none';

                }, 500);

            } catch (err) {
                console.error("Game.init failed:", err);
                const log = document.getElementById('boot-log');
                if (log) {
                    log.style.display = 'block';
                    log.style.background = 'rgba(255,0,0,0.9)';
                    log.textContent = "BOOT ERROR: " + err.message;
                }
            }
        }
    };

    // Sync devMode from session on load
    if (sessionStorage.getItem('kku_dev_unlocked') === '1') {
        window.STATE.devMode = true;
    }

    // ── Global Dev Skip (Ctrl+M) ──────────────────────────────
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && (e.key === 'm' || e.key === 'M')) {
            e.preventDefault();

            const isUnlocked = sessionStorage.getItem('kku_dev_unlocked') === '1';
            if (!isUnlocked) {
                const code = prompt("Dev Access Code:");
                if (code === "00365") {
                    sessionStorage.setItem('kku_dev_unlocked', '1');
                    window.STATE.devMode = true;
                } else {
                    return; // Wrong code
                }
            } else {
                window.STATE.devMode = true;
            }

            if (window.STATE.currentLevel) {
                window.levelDone(window.STATE.currentLevel);
            } else if (window.DevMode && window.DevMode.openPanel) {
                window.DevMode.openPanel();
            }
        }
    });

}());
