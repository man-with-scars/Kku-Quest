// game/dev-mode.js
// Exposes: window.DevMode = { promptLogin, openPanel }
// Responsibility: Developer tools, level debugging, and live asset hot-swapping.

window.DevMode = (function () {
  'use strict';

  const DEV_PASS = '00365';
  let elLogin = null;
  let elPanel = null;
  let elAssetManager = null;

  /**
   * Injects CSS for Dev Mode and Asset Manager.
   */
  function createStyle() {
    const css = `
      #dev-login.active, #dev-panel.active, #asset-manager.active {
        display: flex;
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(0,0,0,0.8);
        align-items: center;
        justify-content: center;
      }

      .dev-wrap {
        background: var(--parchment);
        border: 4px solid var(--amber);
        border-radius: 20px;
        padding: 30px;
        width: 380px;
        text-align: center;
        box-shadow: 0 10px 50px rgba(0,0,0,0.4);
      }

      .dev-title { font-family: 'Fredoka', cursive; color: var(--amber); margin-bottom: 20px; }
      .dev-input {
        width: 100%; padding: 12px; margin: 15px 0;
        border: 2px solid var(--amber); border-radius: 10px;
        text-align: center; font-size: 24px; letter-spacing: 8px;
        font-family: monospace;
      }
      .dev-btn {
        background: var(--amber); color: white; border: none;
        padding: 12px 20px; border-radius: 10px; font-weight: 700;
        cursor: pointer; width: 100%; transition: opacity 0.2s;
      }
      .dev-btn:hover { opacity: 0.9; }

      /* Panel Layout */
      .panel-scroll { max-height: 50vh; overflow-y: auto; margin: 20px 0; padding: 10px; }
      .dev-level-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px; border-bottom: 1px solid #ddd;
      }
      .dev-level-info { text-align: left; font-size: 14px; }
      .dev-level-actions { display: flex; gap: 5px; }
      .dev-toggle { font-size: 20px; cursor: pointer; }

      /* Asset Manager */
      .asset-wrap {
        background: white; width: 90vw; height: 90vh;
        border-radius: 20px; display: flex; flex-direction: column; overflow: hidden;
      }
      .asset-tabs { display: flex; background: #eee; }
      .asset-tab {
        flex: 1; padding: 15px; border: none; background: transparent;
        cursor: pointer; font-family: 'Fredoka', cursive; transition: background 0.2s;
      }
      .asset-tab.active { background: white; border-top: 4px solid var(--purple); }
      .asset-content { flex: 1; overflow-y: auto; padding: 30px; }
      .asset-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
      .asset-slot {
        border: 1px solid #ddd; border-radius: 10px; padding: 15px;
        display: flex; flex-direction: column; align-items: center; gap: 10px;
      }
      .asset-preview {
        width: 100%; height: 100px; background: #f9f9f9;
        border-radius: 5px; object-fit: contain; display: flex; align-items: center; justify-content: center;
      }
      .asset-label { font-size: 12px; font-weight: bold; color: #555; }
      
      .pass-btn {
        position: fixed;
        bottom: 80px;
        right: 20px;
        z-index: 10000;
        background: var(--gold);
        color: white;
        border: 4px solid white;
        border-radius: 50px;
        padding: 15px 25px;
        font-family: 'Fredoka', cursive;
        font-size: 18px;
        cursor: pointer;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        display: none;
      }
      .pass-btn:hover { transform: scale(1.1); background: var(--amber); }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function init() {
    createStyle();
    elLogin = document.getElementById('dev-login');
    elPanel = document.getElementById('dev-panel');
    elAssetManager = document.getElementById('asset-manager');
  }

  // ── Login ──────────────────────────────────────────────────
  function promptLogin() {
    if (!elLogin) init();
    elLogin.innerHTML = `
      <div class="dev-wrap">
        <h2 class="dev-title">Developer Access</h2>
        <input type="password" id="dev-pass-input" class="dev-input" maxlength="5" placeholder="•••••">
        <div style="display:flex; gap:10px;">
           <button id="dev-btn-cancel" class="dev-btn" style="background:#ccc;">Cancel</button>
           <button id="dev-btn-login" class="dev-btn">Unlock</button>
        </div>
      </div>
    `;
    elLogin.classList.add('active');
    const input = document.getElementById('dev-pass-input');
    input.focus();

    document.getElementById('dev-btn-login').onclick = handleLogin;
    document.getElementById('dev-btn-cancel').onclick = () => elLogin.classList.remove('active');
    input.onkeydown = (e) => { if (e.key === 'Enter') handleLogin(); };
  }

  function handleLogin() {
    const val = document.getElementById('dev-pass-input').value;
    if (val === DEV_PASS) {
      window.STATE.devMode = true;
      elLogin.classList.remove('active');
      window.sfx('up');
      openPanel();
    } else {
      window.sfx('bad');
      const wrap = document.querySelector('.dev-wrap');
      wrap.style.animation = 'shake 0.4s';
      setTimeout(() => { wrap.style.animation = ''; document.getElementById('dev-pass-input').value = ''; }, 400);
    }
  }

  // ── Main Panel ──────────────────────────────────────────────
  function openPanel() {
    if (!elPanel) init();
    elPanel.innerHTML = `
      <div class="dev-wrap" style="width:500px;">
        <h2 class="dev-title">God Mode</h2>
        <div class="panel-scroll">
          ${(window.LEVEL_REGISTRY || []).map(lv => `
            <div class="dev-level-row">
              <div class="dev-level-info">
                <span class="dev-toggle" onclick="window.DevMode.toggleLevel('${lv.id}')">
                  ${window.STATE.completed.has(lv.id) ? '✅' : '⬜'}
                </span>
                <strong>LV ${lv.id}</strong> - ${lv.title}
              </div>
              <div class="dev-level-actions">
                <button class="dev-btn" style="width:60px; padding:5px;" onclick="window.launchLevel('${lv.id}')">▶ PLAY</button>
                <button class="dev-btn" style="width:80px; padding:5px; background:var(--purple);" onclick="window.DevMode.autoPlayPrompt('${lv.id}')">🤖 AUTO</button>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <button class="dev-btn" style="background:var(--gold);" onclick="window.DevMode.randomLevel()">🎲 RANDOM LEVEL</button>
            <button class="dev-btn" style="background:var(--rose);" onclick="window.DevMode.skipToFinal()">⏩ SKIP TO FINAL</button>
            <button class="dev-btn" style="background:var(--ink);" onclick="window.DevMode.resetAll()">🗑️ RESET ALL</button>
            <button class="dev-btn" style="background:var(--purple);" onclick="window.DevMode.openAssetManager()">🎨 ASSET MANAGER</button>
            <button class="dev-btn" style="background:#555; grid-column: span 2; margin-top:10px;" onclick="document.getElementById('dev-panel').classList.remove('active')">CLOSE</button>
        </div>
      </div>
    `;
    elPanel.classList.add('active');
  }

  // ── Actions ────────────────────────────────────────────────
  window.DevMode = {
    promptLogin,
    openPanel,
    toggleLevel: (id) => {
      if (window.STATE.completed.has(id)) window.STATE.completed.delete(id);
      else window.STATE.completed.add(id);
      openPanel();
    },
    autoPlayPrompt: (id) => {
      const mode = confirm("Test mode — how would you like to play this level?\n\nOK for [WRONG THEN RIGHT]\nCancel for [RIGHT ONLY]");
      if (mode) {
        // Wrong then right
        window.G.loseLife();
        if (window.SPS && window.SPS.launch) {
          window.SPS.launch(1, () => {
            setTimeout(() => window.levelDone(id), 500);
          });
        }
      } else {
        // Right only
        window.levelDone(id);
      }
      elPanel.classList.remove('active');
    },
    skipToFinal: () => {
      window.STATE.completed = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '10b', 'marry', 'keylock']);
      window.STATE.storyDone = true;
      window.G.go('v-ending');
      if (window.Ending) window.Ending.init(document.getElementById('v-ending'));
      elPanel.classList.remove('active');
    },
    resetAll: () => {
      window.STATE.lives = 3;
      window.STATE.completed = new Set();
      window.STATE.fragments = {};
      window.STATE.spsElf = false;
      window.STATE.storyDone = false;
      if (typeof window.renderHearts === 'function') window.renderHearts();
      window.G.go('v-title');
      elPanel.classList.remove('active');
    },
    randomLevel: () => {
      const regs = window.LEVEL_REGISTRY || [];
      if (!regs.length) return;
      const rand = regs[Math.floor(Math.random() * regs.length)];
      window.launchLevel(rand.id);
      elPanel.classList.remove('active');
    },
    togglePassButton: (show) => {
      let btn = document.getElementById('dev-pass-btn');
      if (!btn) {
        btn = document.createElement('button');
        btn.id = 'dev-pass-btn';
        btn.className = 'pass-btn';
        btn.innerHTML = '✨ PASS LEVEL';
        btn.onclick = () => {
          if (window.STATE.currentLevel) {
            window.levelDone(window.STATE.currentLevel);
          }
        };
        document.body.appendChild(btn);
      }
      btn.style.display = (show && window.STATE.devMode) ? 'block' : 'none';
    },

    // ── Asset Manager ─────────────────────────────────────────
    openAssetManager: () => {
      if (!elAssetManager) init();
      elAssetManager.innerHTML = `
        <div class="asset-wrap">
          <div class="asset-tabs">
            <button class="asset-tab active" onclick="window.DevMode.switchTab(0)">🌌 Backgrounds</button>
            <button class="asset-tab" onclick="window.DevMode.switchTab(1)">👤 Characters</button>
            <button class="asset-tab" onclick="window.DevMode.switchTab(2)">🎵 Music & SFX</button>
            <button class="asset-tab" onclick="window.DevMode.switchTab(3)">📖 Story Frames</button>
            <button class="asset-tab" style="max-width:80px; background:#ff4444; color:white;" onclick="document.getElementById('asset-manager').classList.remove('active')">✖</button>
          </div>
          <div class="asset-content" id="asset-tab-content"></div>
        </div>
      `;
      elAssetManager.classList.add('active');
      window.DevMode.switchTab(0);
    },

    switchTab: (idx) => {
      const tabs = elAssetManager.querySelectorAll('.asset-tab');
      tabs.forEach((t, i) => t.classList.toggle('active', i === idx));
      const content = document.getElementById('asset-tab-content');

      let html = '<div class="asset-grid">';
      if (idx === 0) {
        // Backgrounds
        const slots = ['global', 'title', 'final', ...Array.from({ length: 12 }, (_, i) => `level-${i + 1}`)];
        html += slots.map(k => renderSlot(k, 'bg', 'image/*')).join('');
      } else if (idx === 1) {
        // Characters
        const slots = ['kku-normal', 'kku-elf', 'chu-stressed', 'chu-happy', 'fairy', 'chu-normal'];
        html += slots.map(k => renderSlot(k, 'char', 'image/*')).join('');
      } else if (idx === 2) {
        // Music & SFX
        const slots = ['bgm', 'sfx.ok', 'sfx.bad', 'sfx.up', 'sfx.bh', 'sfx.win', 'sfx.crack', 'sfx.notify'];
        html += slots.map(k => renderSlot(k, 'music', 'audio/*')).join('');
      } else if (idx === 3) {
        // Story Frames
        const slots = ['story-1', 'story-2', 'story-3', 'story-4', 'story-5', 'trans-1', 'trans-2', 'trans-3', 'trans-4'];
        html += slots.map(k => renderSlot(k, 'story', 'image/*,video/*')).join('');
      }
      html += '</div>';
      content.innerHTML = html;
    },

    handleUpload: (key, type, input) => {
      const file = input.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);

      // Update store
      if (!window.STATE.assetStore[type]) window.STATE.assetStore[type] = {};
      window.STATE.assetStore[type][key] = url;

      // Update UI immediately (Hot-swapping)
      hotSwap(key, type, url, file.type);
      window.DevMode.switchTab(['Backgrounds', 'Characters', 'Music & SFX', 'Story Frames'].indexOf(type)); // Re-render tab to show preview
    }
  };

  function renderSlot(key, type, accept) {
    const stored = window.STATE.assetStore[type] && window.STATE.assetStore[type][key];
    let preview = '<div class="asset-preview">None</div>';
    if (stored) {
      if (accept.includes('audio')) {
        preview = `<audio controls src="${stored}" style="width:100%;"></audio>`;
      } else if (stored.startsWith('blob:') || stored.startsWith('http')) {
        preview = `<img class="asset-preview" src="${stored}">`;
      }
    }

    return `
      <div class="asset-slot">
        <div class="asset-label">${key.toUpperCase()}</div>
        ${preview}
        <input type="file" accept="${accept}" style="display:none" id="up-${type}-${key}" onchange="window.DevMode.handleUpload('${key}', '${type}', this)">
        <button class="dev-btn" style="padding:5px; font-size:12px;" onclick="document.getElementById('up-${type}-${key}').click()">UPLOAD</button>
      </div>
    `;
  }

  function hotSwap(key, type, url, fileType) {
    if (type === 'bg') {
      // Handle background swaps
      if (key === 'global') document.body.style.backgroundImage = `url(${url})`;
      const view = document.getElementById(`v-${key}`);
      if (view) view.style.backgroundImage = `url(${url})`;
    } else if (type === 'char') {
      // Replace emojis with images if needed, or update img src
      const els = document.querySelectorAll(`[data-char="${key}"]`);
      els.forEach(el => {
        if (el.tagName === 'IMG') el.src = url;
        else {
          el.innerHTML = `<img src="${url}" style="width:100%; height:100%; object-fit:contain;">`;
        }
      });
    } else if (type === 'music') {
      const musicKey = key.replace('sfx.', '');
      if (window.GAME_CONFIG.SFX) window.GAME_CONFIG.SFX[musicKey] = url;
    }
  }

  return window.DevMode;

}());
