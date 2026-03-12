// game/map.js
// Exposes: window.Map = { init, refresh }
// Responsibility: Level selection and progress tracking.

window.Map = (function () {
  'use strict';

  let container = null;

  /**
   * Injects CSS for the map into the document head.
   */
  function createStyle() {
    const css = `
      #v-map {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding: 40px 20px;
        background: transparent !important;
        overflow-y: auto;
        height: 100%;
      }

      /* Progress Section */
      .map-header {
        width: 100%;
        max-width: 700px;
        margin-bottom: 30px;
        text-align: center;
      }
      .progress-container {
        width: 100%;
        height: 12px;
        background: rgba(0,0,0,0.1);
        border-radius: 6px;
        margin: 15px 0;
        position: relative;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: var(--grass);
        width: 0%;
        transition: width 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      /* Fragments Section */
      .fragment-shelf {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-bottom: 40px;
        padding: 20px;
        background: rgba(255,255,255,0.5);
        border-radius: 20px;
        border: 2px dashed var(--gold);
        width: fit-content;
      }
      .frag-slot {
        width: 60px; height: 60px;
        background: #eee;
        border-radius: 12px;
        display: flex;
        align-items: center; justify-content: center;
        font-family: 'Fredoka', cursive;
        font-size: 24px;
        color: #bbb;
        filter: grayscale(1) blur(2px);
        transition: all 0.5s ease;
      }
      .frag-slot.earned {
        background: white;
        color: var(--gold);
        filter: none;
        box-shadow: 0 0 15px var(--gold);
        transform: scale(1.1);
      }

      /* Level Rows */
      .level-list {
        width: 100%;
        max-width: 700px;
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      .level-row {
        background: white;
        border: 2px solid #eee;
        border-radius: 15px;
        padding: 15px 25px;
        display: flex;
        align-items: center;
        gap: 20px;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
      }
      .level-row:hover:not(.locked) {
        border-color: var(--purple);
        transform: translateX(10px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.05);
      }
      .level-row.locked {
        opacity: 0.6;
        background: #fafafa;
        cursor: not-allowed;
      }
      .level-row.completed {
        border-color: var(--grass);
        background: #F0FDF4;
      }
      
      .level-icon { font-size: 32px; width: 40px; text-align: center; pointer-events: none; }
      .level-info { flex: 1; }
      .level-name { 
        font-family: 'Fredoka', cursive; 
        font-size: 18px; 
        color: var(--ink);
      }
      
      /* Badges */
      .badge {
        font-size: 10px;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 5px;
        text-transform: uppercase;
        margin-left: 10px;
        vertical-align: middle;
        pointer-events: none;
      }
      .badge-collect { background: #E0F2FE; color: #075985; } /* Sky */
      .badge-boss { background: #FFE4E6; color: #9F1239; } /* Rose */
      .badge-key { background: #FEF9C3; color: #854D0E; } /* Gold */

      .btn-play {
        background: var(--purple);
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 10px;
        font-family: 'Fredoka', cursive;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
      }
      .level-row:hover .btn-play { opacity: 1; }
      .level-row.completed .btn-play { background: var(--grass); }
      .level-row.locked .btn-play { display: none; }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      .shake { animation: shake 0.3s; }
      @keyframes fw-sparkle {
        0% { opacity: 1; transform: translate(0,0) scaleY(1); }
        100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scaleY(0.1); }
      }
      .firework-spark {
        position: absolute;
        width: 2px;
        height: 30px;
        background: linear-gradient(to top, var(--c), transparent);
        border-radius: 2px;
        pointer-events: none;
        z-index: 0;
        transform-origin: center;
      }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function spawnFireworks() {
    if (!container || (window.STATE.currentView && !window.STATE.currentView.includes('map'))) return;

    const colors = ['#FFD700', '#FF4500', '#FF1493', '#00FF7F', '#00BFFF', '#FFFFFF'];
    const centerX = Math.random() * window.innerWidth;
    const centerY = Math.random() * window.innerHeight;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const count = 30 + Math.floor(Math.random() * 20);

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'firework-spark';
      const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.2);
      const dist = 100 + Math.random() * 200;

      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;

      p.style.setProperty('--tx', tx + 'px');
      p.style.setProperty('--ty', ty + 'px');
      p.style.setProperty('--c', color);

      p.style.left = centerX + 'px';
      p.style.top = centerY + 'px';

      // Pointy head: rotate to face direction of travel
      p.style.transform = `rotate(${angle + Math.PI / 2}rad)`;
      p.style.animation = `fw-sparkle ${0.8 + Math.random() * 1.2}s cubic-bezier(0, .5, .5, 1) forwards`;

      container.appendChild(p);
      setTimeout(() => p.remove(), 2000);
    }

    setTimeout(spawnFireworks, 1500 + Math.random() * 2500);
  }
  /**
   * Renders the map view.
   */
  function render() {
    const C = window.GAME_CONFIG;
    const S = window.STATE;
    const levels = C.LEVEL_FILES;
    const total = 12;
    const completedCount = S.completed.size;
    const progressPercent = (completedCount / total) * 100;

    container.innerHTML = `
      <div class="map-header">
        <h1 style="font-family:'Fredoka', cursive; color:var(--purple); margin-bottom:10px;">The Quest Progress</h1>
        <div class="progress-container">
          <div class="progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        <div style="font-size:14px; color:var(--sub);">${completedCount} / ${total} Levels Found</div>
      </div>

      <div class="fragment-shelf">
        ${C.FRAGMENTS.map(f => {
      const isEarned = S.fragments[f.id] !== undefined;
      return `
            <div class="frag-slot ${isEarned ? 'earned' : ''}">
              ${isEarned ? S.fragments[f.id] : '?'}
            </div>
          `;
    }).join('')}
      </div>

      <div class="level-list">
        ${levels.map((file, idx) => {
      const id = file.replace('level-', '').replace('.js', '');
      const reg = (window.LEVEL_REGISTRY || []).find(r => {
        return String(r.id).toLowerCase() === String(id).toLowerCase() ||
          Number(r.id) === Number(id);
      });
      const config = reg
        ? { title: reg.title, type: reg.type || 'trap', icon: reg.icon || '❓' }
        : { title: `Level ${id}`, type: 'trap', icon: '❓' };
      const isCompleted = S.completed.has(id);
      const isUnlocked = checkLock(id, idx);
      const displayTitle = id === 'marry' ? 'Level 11' : (id === 'keylock' ? 'Level 12' : config.title);

      return `
            <div class="level-row ${isUnlocked ? '' : 'locked'} ${isCompleted ? 'completed' : ''}" 
                 onclick="window.Map.handleLevelClick('${id}', ${isUnlocked})">
              <div class="level-icon">${isUnlocked ? config.icon : '🔒'}</div>
              <div class="level-info">
                <div class="level-name">
                  ${displayTitle}
                  ${isCompleted ? '<span style="color:var(--grass); font-size:12px; margin-left:10px;">✅ FINISHED</span>' : ''}
                </div>
              </div>
              <button class="btn-play">${isCompleted ? 'REPLAY' : 'PLAY ▶'}</button>
            </div>
          `;
    }).join('')}
      </div>
    `;
  }

  /**
   * Logic for level locking.
   */
  function checkLock(id, idx) {
    if (window.STATE.devMode) return true;
    if (!window.STATE.storyDone) return false;

    // First level: storyDone
    if (idx === 0) return true;

    // Previous level must be in completed set
    const prevFile = window.GAME_CONFIG.LEVEL_FILES[idx - 1];
    const prevId = prevFile.replace('level-', '').replace('.js', '');
    const normPrevId = isNaN(prevId) ? prevId : String(parseInt(prevId));
    return window.STATE.completed.has(normPrevId);
  }

  /**
   * Handles level click interaction.
   */
  function handleLevelClick(id, isUnlocked) {
    if (isUnlocked) {
      window.launchLevel(id);
    } else {
      window.sfx('bad');
      const row = event.currentTarget;
      row.classList.add('shake');
      setTimeout(() => row.classList.remove('shake'), 300);
    }
  }

  function init(target) {
    if (!container) createStyle();
    container = target;
    render();
    spawnFireworks();
  }

  return {
    init: init,
    refresh: render,
    handleLevelClick: handleLevelClick
  };
}());
