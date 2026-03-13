// game/engine.js
// Exposes: window.Game, window.G, window.STATE, window.levelDone, etc.
// Responsibility: Master game state, level loader, navigation, and utilities.

(function () {
    'use strict';
    console.log("engine.js loading...");

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
        currentView: 'v-loading',
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

        // Update Fragments Display
        const elFrags = document.getElementById('hud-frags');
        if (elFrags) {
            const count = Object.keys(window.STATE.fragments).length;
            elFrags.textContent = `💎 Fragments Collected: ${count} / 5`;
        }

        // Sync XP Bar (Progress based on actual levels)
        const xpFill = document.getElementById('hud-xp-fill');
        if (xpFill && window.GAME_CONFIG) {
            const total = 12;
            const progress = (window.STATE.completed.size / total) * 100;
            xpFill.style.width = Math.min(progress, 100) + '%';
        }
    }

    // ── Navigation ──────────────────────────────────────────────
    window.G = {
        go: function (viewId) {
            console.log(`G.go('${viewId}')`);
            // Force hide ALL views regardless of location to prevent overlap
            document.querySelectorAll('.view').forEach(view => {
                view.classList.remove('active');
                view.style.display = 'none'; // Explicitly hide
                view.style.zIndex = '1';
                if (view.id !== viewId && view.id.startsWith('v-L')) {
                    view.innerHTML = ''; // completely tear down the DOM for levels
                }
            });

            let v = document.getElementById(viewId);
            if (!v) {
                v = document.createElement('div');
                v.id = viewId;
                v.className = 'view';
                document.getElementById('stage').appendChild(v);
            }
            v.style.display = 'flex'; // Use flex for active view
            v.classList.add('active');
            v.style.zIndex = '50'; // Bring active view to front
            window.STATE.currentView = viewId;

            // Render the map whenever we navigate to it
            if (viewId === 'v-map' && window.QuestMap && window.QuestMap.init) {
                window.QuestMap.init(v);
            }

            // Sync HUD visibility
            const hud = document.getElementById('hud');
            if (hud) {
                const hideHUD = ['v-title', 'v-loading', 'v-story', 'v-intro', 'v-fall', 'v-finding'];
                const shouldHide = hideHUD.includes(viewId);
                hud.style.opacity = shouldHide ? '0' : '1';
                hud.style.pointerEvents = shouldHide ? 'none' : 'auto';
            }

            // Hide God Mode pass button if not in a level
            if (window.DevMode && window.DevMode.togglePassButton) {
                const isLevel = viewId.startsWith('v-L') || viewId === 'v-sps' || viewId === 'v-word' || viewId === 'v-marry' || viewId === 'v-keylock';
                if (!isLevel) window.DevMode.togglePassButton(false);
            }

            // Sync BGM with the new view
            if (window.AudioManager) window.AudioManager.checkMedia();
        },

        loseLife: function () {
            window.STATE.lives--;
            renderHearts();
            window.sfx('bad');
            if (window.STATE.lives <= 0) {
                if (window.STATE.currentView === 'v-L11') {
                    window.G.go('v-death');
                } else if (window.SPS && window.SPS.launch) {
                    window.STATE.lives = 3;
                    renderHearts();
                    const currentLevelId = window.STATE.currentView.replace('v-L', '');
                    const randomPhase = Math.random() < 0.5 ? 1 : 2;
                    window.SPS.launch(randomPhase, () => {
                        if (window.launchLevel) window.launchLevel(currentLevelId);
                    });
                } else {
                    window.G.go('v-death');
                }
            }
        },

        isPaused: function () {
            return false;
        },

        updateHUD: updateHUD
    };

    // ── Global Actions ──────────────────────────────────────────
    window.levelDone = function (id) {
        // Normalize ID to string without leading zeros for robust set checking
        const normId = isNaN(id) ? id : String(parseInt(id));
        const isNewCompletion = !window.STATE.completed.has(normId);
        window.STATE.completed.add(normId);
        window.sfx('up');

        // Assign random fragment if this is a fragment-yielding level and not replayed
        const fragmentLevels = window.GAME_CONFIG.FRAGMENTS.map(f => String(f.level));
        if (fragmentLevels.includes(normId) && isNewCompletion) {
            const collectedIds = Object.keys(window.STATE.fragments).map(Number);
            const availableFrags = window.GAME_CONFIG.FRAGMENTS.filter(f => !collectedIds.includes(f.id));
            if (availableFrags.length > 0) {
                const randomFrag = availableFrags[Math.floor(Math.random() * availableFrags.length)];
                window.STATE.fragments[randomFrag.id] = randomFrag.value;
                window.STATE.lastFrag = randomFrag; // save for completion screen
                showFragmentPopup(randomFrag);
            }
        }

        // Web notification if available
        if (window.GameNotifications && window.GameNotifications.send) {
            window.GameNotifications.send();
        }

        // Save progress to SessionManager
        if (window.SessionManager) {
            const stateToSave = { ...window.STATE, completed: Array.from(window.STATE.completed) };
            SessionManager.save({ phase: 'game', level: id, gameState: stateToSave });
        }

        window.showLevelComplete(id);
    };

    window.showLevelComplete = function (id) {
        const frag = window.STATE.lastFrag;
        if (frag) {
            // Show toast and auto advance
            const overlay = document.createElement('div');
            overlay.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; color:white; animation:fadeIn 0.3s;";
            overlay.innerHTML = `<h1 style="font-family:'Fredoka', cursive; font-size:48px; margin-bottom:10px; color:var(--gold);">Level Clear!</h1><p style="font-size:24px;">Fragment Found: <b style="color:var(--gold); font-size:32px;">${frag.value}</b></p>`;
            document.body.appendChild(overlay);
            window.STATE.lastFrag = null;
            setTimeout(() => {
                overlay.remove();
                window.levelAdvancementLogic(id);
            }, 3000);
        } else {
            // Instant advance
            window.levelAdvancementLogic(id);
        }
    };

    window.levelAdvancementLogic = function (id) {
        // Special case for puzzle IDs or non-numeric IDs
        if (id === 'sps' || id === 'word') {
            window.G.go('v-map');
            return;
        }

        // Build the ordered level sequence
        const LEVEL_SEQUENCE = [1,2,3,4,5,6,7,8,9,10,11];
        const idx = LEVEL_SEQUENCE.findIndex(l => String(l) === String(id));

        if (idx !== -1 && idx + 1 < LEVEL_SEQUENCE.length) {
            window.launchLevel(LEVEL_SEQUENCE[idx + 1]);
        } else {
            // Finished all levels
            window.G.go('v-map');
        }
    };

    // ── Level Management ────────────────────────────────────────
    async function loadLevelScript(id) {
        let filename = `level-${String(id).padStart(2, '0')}.js`;
        if (id == 'marry') filename = 'level-marry.js';
        if (id == 'keylock') filename = 'level-keylock.js';
        if (id == '10b') filename = 'level-10b.js';

        const path = `levels/${filename}`;

        return new Promise((resolve, reject) => {
            const scripts = Array.from(document.querySelectorAll('script'));
            if (scripts.find(s => s.src.endsWith(filename))) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = path;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load level ${id}`));
            document.body.appendChild(script);
        });
    }

    window.launchLevel = async function (id) {
        try {
            await loadLevelScript(id);
        } catch (e) {
            console.warn(`Level ${id} script missing. Auto-advancing...`);
            setTimeout(() => window.levelDone(id), 1000);
            return;
        }

        const reg = (window.LEVEL_REGISTRY || []).find(r =>
            String(r.id).toLowerCase() === String(id).toLowerCase() ||
            Number(r.id) === Number(id)
        );

        if (!reg) {
            console.warn(`Level ${id} registry entry missing. Auto-advancing...`);
            setTimeout(() => window.levelDone(id), 1000);
            return;
        }

        // Lazy building of the view
        const stage = document.getElementById('stage');
        let v = document.getElementById(reg.view);
        if (!v) {
            v = document.createElement('div');
            v.id = reg.view;
            v.className = 'view';
            stage.appendChild(v);
        }

        // Always rebuild trap/stateful levels to reset progress; lazy-build collect/story levels
        const shouldRebuild = reg.type === 'trap' || !v.hasChildNodes();
        if (shouldRebuild && typeof reg.build === 'function') {
            v.innerHTML = ''; // Clear stale DOM before rebuilding
            try {
                reg.build(v);
                console.log(`Built level ${id} on-demand.`);
            } catch (e) {
                console.error('Build fail for', reg.id, e);
            }
        }

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
        if (window.AudioManager && !window.AudioManager.isSFXEnabled()) return;
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


    window.levelAdvancementLogic = function (currentId) {
        if (currentId == 10) {
            window.launchLevel(11); // Merry (BOSS)
        } else if (currentId == 11) {
            window.launchLevel(12); // Keylock
        } else if (currentId == 12) {
            window.triggerFinalSequence();
        } else {
            const next = parseInt(currentId) + 1;
            window.launchLevel(next);
        }
    };

    window.replayStory = function () {
        if (window.AudioManager) window.AudioManager.suppress();

        // Navigate to story fullscreen
        window.G.go('v-story');

        const storyEl = document.getElementById('v-story');
        if (storyEl) {
            storyEl.style.background = 'var(--parchment, #FFF8F0)';
        }

        if (window.Story && window.Story.init) {
            window.Story.init(storyEl);
        }
    };

    // ── Global Custom Toast Notification ─────────────────────────
    window.showConfirmDialog = function (msg, onConfirm) {
        let el = document.getElementById('confirm-overlay');
        if (!el) {
            el = document.createElement('div');
            el.id = 'confirm-overlay';
            el.style.cssText = `
                position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999;
                display:none; align-items:center; justify-content:center; backdrop-filter:blur(3px);
            `;
            document.body.appendChild(el);
        }

        el.innerHTML = `
            <div style="background:var(--parchment); padding:30px; border-radius:20px; box-shadow:0 10px 40px rgba(0,0,0,0.2); max-width:400px; text-align:center; animation:popIn 0.3s; color:var(--ink); font-family:'Fredoka', cursive;">
                <div style="font-size:30px; margin-bottom:15px;">⚠️</div>
                <div style="font-size:18px; margin-bottom:25px; line-height:1.4;">${msg}</div>
                <div style="display:flex; justify-content:center; gap:15px;">
                    <button id="btn-confirm-cancel" class="dev-btn" style="background:#e5e7eb; color:#4b5563;">CANCEL</button>
                    <button id="btn-confirm-ok" class="dev-btn" style="background:var(--rose);">CONTINUE</button>
                </div>
            </div>
        `;
        el.style.display = 'flex';

        document.getElementById('btn-confirm-cancel').onclick = () => {
            el.style.display = 'none';
        };
        document.getElementById('btn-confirm-ok').onclick = () => {
            el.style.display = 'none';
            if (onConfirm) onConfirm();
        };
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
                        if (session.gameState.completed) {
                            window.STATE.completed = new Set(session.gameState.completed);
                        }
                    }
                }

                const loadingView = document.getElementById('v-loading');
                if (loadingView) {
                    loadingView.innerHTML = `
                        <video id="load-video" src="../landing/story-videos/00.mp4" muted playsinline webkit-playsinline
                            style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:-1;"></video>
                        <div id="load-info" style="position:absolute; bottom:40px; left:50%; transform:translateX(-50%); background:white; padding:14px 30px; border-radius:50px; text-align:center; color:#222; min-width:280px; box-shadow:0 4px 20px rgba(0,0,0,0.2); transition: opacity 0.5s;">
                            <div style="width:220px; height:8px; background:rgba(0,0,0,0.1); border-radius:4px; position:relative; margin:0 auto 8px auto;">
                                <div id="load-bar" style="height:100%; background:var(--gold, #f0b429); width:0%; border-radius:4px; transition:width 0.2s;"></div>
                            </div>
                            <div style="font-size:13px; font-family:'Fredoka', cursive; letter-spacing:1px; color:#444;">GATHERING FRAGMENTS...</div>
                        </div>
                    `;
                }

                createStyle();
                setupParticles();
                renderHearts();
                try {
                    const video = document.getElementById('load-video');
                    const info = document.getElementById('load-info');

                    // Play video once - NON-BLOCKING
                    if (video) {
                        video.muted = true;
                        video.load();

                        const attemptPlay = () => {
                            video.play().then(() => {
                                document.removeEventListener('click', attemptPlay);
                            }).catch(e => console.warn("Video blocked", e));
                        };
                        document.addEventListener('click', attemptPlay);
                        attemptPlay();

                        // Wait for EXACTLY 7 seconds
                        const fixedWait = new Promise(r => setTimeout(r, 7000));

                        let p = 0;
                        const pInterval = setInterval(() => {
                            p += 2;
                            const bar = document.getElementById('load-bar');
                            if (bar) bar.style.width = Math.min(p, 100) + '%';
                            if (p >= 100) {
                                clearInterval(pInterval);
                                if (info) info.style.opacity = '0';
                            }
                        }, 140);

                        await fixedWait;
                        clearInterval(pInterval);
                        document.removeEventListener('click', attemptPlay);
                    }
                } catch (e) {
                    console.warn("Soft-error during async init:", e);
                }

                // DEFINITIVE TRANSITION TO TITLE SCREEN
                console.log("Initialization complete, going to title.");
                window.G.go('v-title');

                // Ensure initial HUD state
                const hud = document.getElementById('hud');
                if (hud) {
                    hud.style.opacity = '0';
                    hud.style.pointerEvents = 'none';
                }

                setupDevTaps();
                const titleView = document.getElementById('v-title');
                if (titleView) {
                    // Lazy load landing background once title is visible
                    titleView.style.background = "url('levels/landing.jpeg') no-repeat center center / cover";

                    titleView.innerHTML = `
                        <button id="btn-start-game" style="padding:15px 45px; background:var(--gold); border:none; border-radius:35px; color:white; font-size:24px; font-family:'Fredoka', cursive; cursor:pointer; box-shadow:0 8px 25px rgba(240,180,41,0.5); transition:transform 0.2s; position:absolute; bottom:15%; left:50%; transform:translateX(-50%); z-index:10;">START ADVENTURE</button>
                    `;
                    const startBtn = titleView.querySelector('#btn-start-game');
                    if (startBtn) {
                        startBtn.onclick = () => {
                            window.G.go('v-story');
                            if (window.Story && window.Story.init) {
                                window.Story.init(document.getElementById('v-story'));
                            }
                        };
                    }
                }


                // Audio Toggles
                const btnToggleBGM = document.getElementById('btn-toggle-bgm');
                const btnToggleSFX = document.getElementById('btn-toggle-sfx');

                if (btnToggleBGM) {
                    btnToggleBGM.textContent = `MUSIC: ${window.AudioManager.isBGMEnabled() ? 'ON' : 'OFF'}`;
                    btnToggleBGM.onclick = () => {
                        const enabled = window.AudioManager.toggleBGM();
                        btnToggleBGM.textContent = `MUSIC: ${enabled ? 'ON' : 'OFF'}`;
                    };
                }

                if (btnToggleSFX) {
                    btnToggleSFX.textContent = `SFX: ${window.AudioManager.isSFXEnabled() ? 'ON' : 'OFF'}`;
                    btnToggleSFX.onclick = () => {
                        const enabled = window.AudioManager.toggleSFX();
                        btnToggleSFX.textContent = `SFX: ${enabled ? 'ON' : 'OFF'}`;
                    };
                }

                // History Interceptor for "Back" button
                window.addEventListener('popstate', (e) => {
                    if (window.STATE.currentView !== 'v-map') {
                        window.G.go('v-map');
                    }
                });

                window.G.go('v-title');

                // Auto-start BGM on first interaction
                document.addEventListener('click', () => {
                    if (window.AudioManager) window.AudioManager.play();
                }, { once: true });

                const log = document.getElementById('boot-log');
                if (log) log.style.display = 'none';

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

    // ── Global Audio Manager ───────────────────────────────────
    window.AudioManager = (function () {
        let bgm = null;
        let isSuppressed = false;
        let bgmEnabled = localStorage.getItem('kku_bgm_enabled') !== 'false';
        let sfxEnabled = localStorage.getItem('kku_sfx_enabled') !== 'false';

        function init() {
            if (!bgm) {
                bgm = new Audio('../landing/recording/background.mp3');
                bgm.loop = true;
                bgm.volume = 0.4;
            }
        }

        function play() {
            if (!bgmEnabled) return;
            init();
            if (!isSuppressed) {
                bgm.play().catch(e => console.log("BGM play blocked."));
            }
        }

        function stop() {
            if (bgm) {
                bgm.pause();
                bgm.currentTime = 0;
            }
        }

        function pause() {
            if (bgm) bgm.pause();
        }

        function suppress() {
            isSuppressed = true;
            pause();
        }

        function unsuppress() {
            isSuppressed = false;
            checkMedia(); // Check if we should actually resume
        }

        function checkMedia() {
            if (!bgmEnabled || isSuppressed) return;

            // Check for any playing video or audio (excluding our BGM)
            const videos = document.querySelectorAll('video');
            const audios = document.querySelectorAll('audio');
            let hasMedia = false;

            for (let v of videos) {
                if (!v.paused && !v.muted) {
                    hasMedia = true;
                    break;
                }
            }

            if (!hasMedia) {
                for (let a of audios) {
                    if (a !== bgm && !a.paused && a.volume > 0) {
                        hasMedia = true;
                        break;
                    }
                }
            }

            if (hasMedia || window.STATE.currentView === 'v-story' || window.STATE.currentView === 'v-loading' || window.STATE.currentView === 'v-finding') {
                pause();
            } else {
                play();
            }
        }

        // Auto-monitor media changes
        setInterval(checkMedia, 1000);

        function toggleBGM() {
            bgmEnabled = !bgmEnabled;
            localStorage.setItem('kku_bgm_enabled', bgmEnabled);
            if (bgmEnabled) checkMedia();
            else pause();
            return bgmEnabled;
        }

        function toggleSFX() {
            sfxEnabled = !sfxEnabled;
            localStorage.setItem('kku_sfx_enabled', sfxEnabled);
            return sfxEnabled;
        }

        return {
            play: play,
            pause: pause,
            stop: stop,
            suppress: suppress,
            unsuppress: unsuppress,
            toggleBGM: toggleBGM,
            toggleSFX: toggleSFX,
            isBGMEnabled: () => bgmEnabled,
            isSFXEnabled: () => sfxEnabled,
            checkMedia: checkMedia
        };
    })();

    // ── Global Dev Skip (Ctrl+M) ──────────────────────────────
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && (e.key === 'm' || e.key === 'M')) {
            e.preventDefault();

            const isUnlocked = sessionStorage.getItem('kku_dev_unlocked') === '1' || window.STATE.devMode;
            if (!isUnlocked) {
                const code = prompt("Dev Access Code:");
                if (code === "00365") {
                    sessionStorage.setItem('kku_dev_unlocked', '1');
                    window.STATE.devMode = true;
                } else {
                    return; // Wrong code
                }
            }

            // Refined Skip Logic
            if (window.STATE.currentView === 'v-story') {
                console.log("Dev: Skipping Story");
                if (window.Story && window.Story.skip) {
                    window.Story.skip();
                } else {
                    // Fallback if Story.skip isn't implemented
                    window.STATE.storyDone = true;
                    window.G.go('v-map');
                    if (window.QuestMap && window.QuestMap.init) {
                        window.QuestMap.init(document.getElementById('v-map'));
                    }
                }
            } else if (window.STATE.currentLevel) {
                console.log("Dev: Skipping Level", window.STATE.currentLevel);
                window.levelDone(window.STATE.currentLevel);
            } else {
                console.log("Dev: Opening Dev Panel");
                if (window.DevMode && window.DevMode.openPanel) {
                    window.DevMode.openPanel();
                }
            }
        }
    });

}());
