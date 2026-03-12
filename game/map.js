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
      .badge-finished { background: #D1FAE5; color: #065F46; } /* Emerald */

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
      .particle {
        position: absolute;
        pointer-events: none;
        z-index: 0;
      }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function spawnFireworks() {
    const container = document.getElementById('map-stage');
    if (!container) return;

    // Slower frequency
    if (Math.random() > 0.15) return;

    const x = Math.random() * container.clientWidth;
    const y = Math.random() * container.clientHeight;
    const color = `hsl(${Math.random() * 360}, 100%, 70%)`;

    for (let i = 0; i < 16; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const angle = (i / 16) * Math.PI * 2;
      const velocity = 80 + Math.random() * 60;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;

      p.style.cssText = `
            position:absolute; left:${x}px; top:${y}px;
            width:3px; height:12px; background:${color};
            border-radius:10px;
            pointer-events:none;
            transform: rotate(${angle}rad);
            opacity:0;
            box-shadow: 0 0 10px ${color};
        `;

      container.appendChild(p);

      p.animate([
        { transform: `translate(0,0) rotate(${angle}rad) scaleY(1)`, opacity: 0 },
        { transform: `translate(${tx * 0.2}px, ${ty * 0.2}px) rotate(${angle}rad) scaleY(2)`, opacity: 1, offset: 0.2 },
        { transform: `translate(${tx}px, ${ty}px) rotate(${angle}rad) scaleY(0.5)`, opacity: 0 }
      ], {
        duration: 1500 + Math.random() * 1000, // Slower animation
        easing: 'cubic-bezier(0, 0, 0.2, 1)',
        fill: 'forwards'
      }).onfinish = () => p.remove();
    }
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

      <div class="level-list" id="map-stage">
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
                  ${isCompleted ? '<span class="badge badge-finished">FINISHED</span>' : ''}
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

  function startLevel(id) {
    // Checkpoint check (e.g., at level 5 and 9 which precede SPS transitions or are final hurdles)
    const checkpoints = [5, 9];
    if (checkpoints.includes(Number(id))) { // Ensure id is a number for comparison
      const total = window.STATE.totalAnswers || 0;
      const correct = window.STATE.correctAnswers || 0;
      const accuracy = total > 0 ? (correct / total) * 100 : 100;

      if (accuracy < 60) {
        showCheckpointWarning(id, accuracy);
        return;
      }
    }

    window.STATE.lastCheckpoint = id;
    window.launchLevel(id);
  }

  function showCheckpointWarning(id, accuracy) {
    window.sfx('bad');
    const modal = document.createElement('div');
    modal.style.cssText = `
          position:fixed; inset:0; z-index:9999; 
          background:rgba(0,0,0,0.8); backdrop-filter:blur(10px);
          display:flex; align-items:center; justify-content:center;
      `;
    modal.innerHTML = `
          <div style="background:var(--parchment); padding:40px; border-radius:30px; text-align:center; max-width:400px; box-shadow:0 20px 60px rgba(0,0,0,0.5);">
              <h2 style="color:var(--purple); margin-bottom:20px;">Checkpoint Failed</h2>
              <p style="color:var(--ink); line-height:1.6; margin-bottom:30px;">
                  Your current accuracy is <b>${accuracy.toFixed(1)}%</b>. <br>
                  You need at least <b>60%</b> accuracy to proceed through this special barrier.
              </p>
              <button class="dev-btn" onclick="this.parentElement.parentElement.remove()" style="background:var(--rose); padding:12px 30px;">TRY AGAIN</button>
          </div>
      `;
    document.body.appendChild(modal);
  }

  /**
   * Handles level click interaction.
   */
  function handleLevelClick(id, isUnlocked) {
    if (isUnlocked) {
      startLevel(id);
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
