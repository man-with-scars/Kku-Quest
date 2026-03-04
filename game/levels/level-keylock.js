// game/levels/level-keylock.js
// Exposes: window.LEVEL_REGISTRY push for Level Keylock
// Type: Key

window.LEVEL_REGISTRY = window.LEVEL_REGISTRY || [];
window.LEVEL_REGISTRY.push({
  id: 'keylock',
  view: 'v-LKeylock',
  icon: '🗝️',
  title: 'The Heart Key',
  type: 'key',
  hint: 'Fragments: 98, 46, 90, 74, 13.',

  build(el) {
    const fullCode = '9846907413';
    let currentInput = []; // Array of {digit, tileIdx}
    let selectedTileIdx = null;

    // Digits from fragments
    const digits = fullCode.split('').map((d, i) => ({ val: d, id: i }));
    const shuffledDigits = [...digits].sort(() => Math.random() - 0.5);

    function render() {
      el.innerHTML = `
        <div id="keylock-stage" style="width:100%; height:100%; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255, 230, 200, 0.3);">
          
          <!-- Entry Animation: Padlock -->
          <div id="keylock-header" style="text-align:center; margin-bottom:20px; animation:fadeup 0.8s forwards;">
            <div id="kl-lock" style="font-size:80px; margin-bottom:10px;">🔐</div>
            <h2 style="font-family:'Fredoka One', cursive; color:var(--gold); font-size:24px;">The Final Key</h2>
            <p style="font-family:'Lora', serif; font-style:italic; font-size:14px; color:var(--ink); max-width:400px; margin:0 auto;">
              "This door opens for one combination only.<br>
              A number that carried his voice to you —<br>
              every single time you reached for him."
            </p>
          </div>

          <div id="keylock-card" class="riddle-card" style="z-index:10; border:4px solid var(--gold);">
            
            <div style="margin-bottom:20px;">
              <p style="font-size:12px; color:var(--sub); margin-bottom:8px;">Collected Fragments:</p>
              <div style="display:flex; justify-content:center; gap:8px;">
                ${['98', '46', '90', '74', '13'].map(f => `<span style="background:var(--parchment); color:var(--gold); padding:4px 10px; border-radius:8px; border:1px solid var(--gold); font-family:monospace; font-weight:bold;">${f}</span>`).join('')}
              </div>
            </div>

            <!-- Slots -->
            <div id="keylock-slots" style="display:grid; grid-template-columns:repeat(10, 1fr); gap:6px; margin-bottom:25px;">
              ${Array.from({ length: 10 }).map((_, i) => {
        const placed = currentInput[i];
        return `<div class="kl-slot" data-idx="${i}" style="width:30px; height:45px; border-bottom:3px solid ${placed ? 'var(--gold)' : '#ccc'}; display:flex; align-items:center; justify-content:center; font-family:'Fredoka One'; font-size:24px; color:var(--gold); cursor:pointer;">${placed ? placed.val : '_'}</div>`;
      }).join('')}
            </div>

            <!-- Tiles Pool -->
            <div id="keylock-tiles" style="display:grid; grid-template-columns:repeat(5, 1fr); gap:12px; margin-bottom:20px;">
              ${shuffledDigits.map((d, i) => {
        const isUsed = currentInput.some(p => p.id === d.id);
        const isSelected = selectedTileIdx === d.id;
        return `
                  <button class="kl-tile ${isUsed ? 'used' : ''} ${isSelected ? 'selected' : ''}" 
                          data-val="${d.val}" data-id="${d.id}" 
                          style="width:45px; height:45px; background:white; border:2px solid ${isSelected ? 'var(--gold)' : '#ddd'}; border-radius:10px; font-family:'Fredoka One'; font-size:20px; cursor:pointer; opacity:${isUsed ? 0.3 : 1}; pointer-events:${isUsed ? 'none' : 'auto'}; transition:all 0.2s;">
                    ${d.val}
                  </button>
                `;
      }).join('')}
            </div>

            <div style="display:flex; gap:10px; width:100%;">
              <button id="btn-kl-clear" class="dev-btn" style="background:#555; font-size:14px; flex:1;">CLEAR</button>
              <button id="btn-kl-unlock" class="dev-btn" style="background:var(--gold); flex:2; font-size:18px;">UNLOCK DESTINY</button>
            </div>
          </div>
        </div>
      `;

      attachEvents();
    }

    function attachEvents() {
      // Tile Clicks
      el.querySelectorAll('.kl-tile').forEach(btn => {
        btn.onclick = () => {
          window.sfx('click');
          selectedTileIdx = parseInt(btn.dataset.id);

          // Auto-place into first empty slot
          const emptyIdx = Array.from({ length: 10 }).findIndex((_, i) => !currentInput[i]);
          if (emptyIdx !== -1) {
            placeTile(emptyIdx);
          } else {
            render();
          }
        };
      });

      // Slot Clicks (to swap or select slot?) - keep it simple: just clearing or selecting
      el.querySelectorAll('.kl-slot').forEach(slot => {
        slot.onclick = () => {
          const idx = parseInt(slot.dataset.idx);
          if (currentInput[idx]) {
            window.sfx('click');
            currentInput[idx] = null;
            render();
          }
        };
      });

      document.getElementById('btn-kl-clear').onclick = () => {
        window.sfx('click');
        currentInput = [];
        selectedTileIdx = null;
        render();
      };

      document.getElementById('btn-kl-unlock').onclick = () => {
        const entered = Array.from({ length: 10 }).map((_, i) => currentInput[i] ? currentInput[i].val : '').join('');
        if (entered === fullCode) {
          handleSuccess();
        } else {
          handleFail();
        }
      };
    }

    function placeTile(slotIdx) {
      const tile = shuffledDigits.find(d => d.id === selectedTileIdx);
      if (tile) {
        currentInput[slotIdx] = tile;
        selectedTileIdx = null;
        render();
      }
    }

    function handleSuccess() {
      window.sfx('win');
      const lock = document.getElementById('kl-lock');
      lock.innerHTML = '🔓';
      lock.style.animation = 'popIn 1s forwards';

      const card = document.getElementById('keylock-card');
      card.style.transition = 'all 1s';
      card.style.borderColor = 'var(--grass)';

      setTimeout(() => {
        if (window.triggerFinalSequence) {
          window.triggerFinalSequence();
        } else {
          window.levelDone('keylock');
        }
      }, 1500);
    }

    function handleFail() {
      window.sfx('bad');
      window.G.loseLife();
      const slots = document.getElementById('keylock-slots');
      slots.style.animation = 'shake 0.4s';
      setTimeout(() => {
        slots.style.animation = '';
        currentInput = [];
        render();
      }, 400);
    }

    const style = document.createElement('style');
    style.textContent = `
      .riddle-card {
        background: var(--parchment); padding: 40px; border-radius: 35px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1); text-align: center;
        max-width: 450px; width: 95%;
      }
      .kl-tile.selected { border-width: 3px; transform: scale(1.1); box-shadow: 0 0 15px var(--gold); }
      .kl-tile:hover:not(.used) { background: #fffcf0; border-color: var(--gold); }
    `;
    document.head.appendChild(style);

    render();
  }
});
