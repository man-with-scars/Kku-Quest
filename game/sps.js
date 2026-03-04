// game/sps.js
// Exposes: window.SPS = { launch, advance }, window.WORD = { launch }
// Responsibility: Stone-Paper-Scissors scripted state machine and Word Puzzle mini-game.

(function () {
  'use strict';

  // ── Types and Constants ─────────────────────────────────────
  const CHOICES = ['🪨', '🗒️', '✂️']; // Stone, Paper, Scissors indices: 0, 1, 2
  const WORD_ROUNDS = [
    { word: 'CHELODE', blanks: [0, 3, 5], hint: 'The first layer of connection.' },
    { word: 'KISHORE', blanks: [0, 2, 5], hint: 'A name whispered in the dark.' },
    { word: 'TELEGRAM', blanks: [1, 4, 6], hint: 'The wires that bind us.' }
  ];

  // ── Module Variables ───────────────────────────────────────
  let spsContainer = null;
  let wordContainer = null;

  let spsState = {
    phase: 1, // 1 or 2
    round: 0,
    kkuScore: 0,
    aiScore: 0,
    tries: 0,
    locked: false
  };

  let wordState = {
    round: 0,
    currentWord: '',
    blanks: [],
    inputs: [],
    locked: false
  };

  // ── Initialization & CSS ────────────────────────────────────
  function createStyle() {
    const css = `
      /* SPS Layout */
      .sps-arena {
        display: grid;
        grid-template-columns: 1fr 100px 1fr;
        align-items: center;
        width: 100%;
        max-width: 800px;
        position: relative;
      }
      .sps-side {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
      }
      .sps-choice-display {
        width: 100px; height: 100px;
        background: white;
        border: 4px solid var(--parchment);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 60px;
        position: relative;
      }
      .sps-btn-group {
        display: flex;
        gap: 10px;
      }
      .sps-picker {
        font-size: 30px;
        width: 60px; height: 60px;
        background: white;
        border: 2px solid var(--parchment);
        border-radius: 12px;
        cursor: pointer;
        transition: transform 0.2s, opacity 0.2s;
      }
      .sps-picker:not(:disabled):hover { transform: scale(1.1); }
      .sps-picker.dim { opacity: 0.4; }
      .sps-score { font-family: 'Fredoka', cursive; font-size: 32px; }
      .sps-think { font-size: 14px; font-style: italic; color: var(--sub); min-height: 20px; }

      /* Word Puzzle */
      .word-stage {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px;
        width: 100%;
      }
      .word-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
      .word-slot {
        width: 60px; height: 60px;
        background: white;
        border: 3px solid var(--parchment);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-family: 'Fredoka', cursive;
        position: relative;
      }
      .word-slot.blank { border-color: var(--amber); box-shadow: inset 0 0 10px rgba(0,0,0,0.05); }
      .word-input {
        width: 100%; height: 100%;
        border: none; background: transparent;
        text-align: center; font: inherit; color: var(--amber);
        outline: none; text-transform: uppercase;
      }
      .letter-pool { display: flex; gap: 15px; margin-top: 20px; }
      .letter-tile {
        width: 50px; height: 50px;
        background: var(--parchment);
        border: 1px solid var(--amber);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        cursor: grab;
        user-select: none;
      }
      .letter-tile:active { cursor: grabbing; }

      /* Overlays */
      .full-overlay {
        position: fixed; inset: 0;
        z-index: 1000;
        display: none;
        align-items: center;
        justify-content: center;
      }
      .full-overlay.dark { background: rgba(0,0,0,0.9); }
      .full-overlay.light { background: rgba(255,255,255,0.95); }
      
      .scroll-paper {
        background: #fdf5e6;
        width: 400px; padding: 40px;
        border-radius: 5px;
        box-shadow: 0 5px 25px rgba(0,0,0,0.5);
        color: #5d4037;
        font-family: 'Playfair Display', serif;
        font-style: italic;
        line-height: 1.6;
        position: relative;
        overflow: hidden;
      }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── SPS Logic ────────────────────────────────────────────────
  function launchSPS(phase = 1, cb = null) {
    if (!spsContainer) {
      createStyle();
      spsContainer = document.getElementById('v-sps');
    }

    spsState = {
      phase: phase,
      round: 0,
      kkuScore: 0,
      aiScore: 0,
      tries: 0,
      locked: false,
      callback: cb
    };

    renderSPS();
    window.G.go('v-sps');
  }

  function renderSPS() {
    spsContainer.innerHTML = `
      <div class="sps-arena">
        <div class="sps-side">
          <div class="sps-score" id="kku-score">${spsState.kkuScore}</div>
          <div class="sps-choice-display" id="kku-display">❔</div>
          <div class="sps-btn-group">
            ${CHOICES.map((c, i) => `<button class="sps-picker" id="pick-${i}" onclick="window.SPS.choose(${i})">${c}</button>`).join('')}
          </div>
          <div class="panel-label">KKU</div>
        </div>

        <div style="text-align:center;">
          <div style="font-size:24px; color:var(--sub); margin-bottom:10px;">VS</div>
          <div id="round-status" style="font-size:12px; font-weight:bold;">TRIES: ${spsState.tries}</div>
        </div>

        <div class="sps-side">
          <div class="sps-score" id="ai-score">${spsState.aiScore}</div>
          <div class="sps-choice-display" id="ai-display">❔</div>
          <div class="sps-think" id="ai-status">Ready...</div>
          <div class="panel-label">AI ARCHITECT</div>
        </div>
      </div>
    `;
  }

  async function chooseSPS(idx) {
    if (spsState.locked) return;
    spsState.locked = true;
    spsState.tries++;

    const kkuPick = CHOICES[idx];
    const kkuEl = document.getElementById('kku-display');
    const aiEl = document.getElementById('ai-display');
    const statusEl = document.getElementById('ai-status');

    // Kku Pick Animation
    kkuEl.textContent = kkuPick;
    kkuEl.style.animation = 'popIn 0.3s';
    document.querySelectorAll('.sps-picker').forEach((btn, i) => {
      btn.disabled = true;
      if (i !== idx) btn.classList.add('dim');
    });

    // AI "Think"
    statusEl.textContent = '🤔...';
    aiEl.style.animation = 'thinkPulse 1.5s infinite';
    await new Promise(r => setTimeout(r, 600));

    // Determine AI pick based on scripted state machine
    let aiIdx = 0;
    let result = ''; // 'tie', 'win', 'lose'

    if (spsState.phase === 1) {
      if (spsState.round < 10) {
        // 10 tie streak
        aiIdx = idx;
        result = 'tie';
      } else {
        // 4 losses to trigger phase shift
        aiIdx = (idx + 1) % 3; // AI wins
        result = 'lose';
      }
    } else {
      // Phase 2: 9 wins
      aiIdx = (idx + 2) % 3; // Kku wins
      result = 'win';
    }

    const aiPick = CHOICES[aiIdx];
    aiEl.textContent = aiPick;
    aiEl.style.animation = 'popIn 0.3s';
    statusEl.textContent = '';

    // Handle Round Result
    await handleSPSRoundResult(result);

    spsState.round++;

    // Check Phase Completion
    if (spsState.phase === 1 && spsState.round === 14) {
      triggerPhase1Loss();
    } else if (spsState.phase === 2 && spsState.round === 9) {
      triggerPhase2Win();
    } else {
      spsState.locked = false;
      document.getElementById('round-status').textContent = `TRIES: ${spsState.tries}`;
      document.querySelectorAll('.sps-picker').forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('dim');
      });
    }
  }

  async function handleSPSRoundResult(result) {
    const kkuEl = document.getElementById('kku-display');
    const aiEl = document.getElementById('ai-display');
    const kkuScoreEl = document.getElementById('kku-score');
    const aiScoreEl = document.getElementById('ai-score');

    if (result === 'tie') {
      kkuEl.style.animation = aiEl.style.animation = 'glowpulse 0.4s, shake 0.4s';
      window.sfx('click');
    } else if (result === 'win') {
      spsState.kkuScore++;
      kkuEl.style.animation = 'winGlow 0.6s';
      aiEl.style.animation = 'loseShake 0.6s';
      kkuScoreEl.style.animation = 'scoreFlash 0.4s';
      kkuScoreEl.textContent = spsState.kkuScore;
      window.sfx('ok');
    } else {
      spsState.aiScore++;
      aiEl.style.animation = 'winGlow 0.6s';
      kkuEl.style.animation = 'loseShake 0.6s';
      aiScoreEl.style.animation = 'scoreFlash 0.4s';
      aiScoreEl.textContent = spsState.aiScore;
      window.sfx('bad');
    }
    await new Promise(r => setTimeout(r, 600));
  }

  function triggerPhase1Loss() {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:var(--rose);z-index:2000;opacity:0.5;animation:popIn 0.1s;';
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      window.blackHole("The AI has mastered your patterns... Your logic is being rewritten.", () => {
        launchWord();
      });
    }, 300);
  }

  function triggerPhase2Win() {
    window.sfx('win');
    spsContainer.innerHTML += `<div style="position:absolute; inset:0; pointer-events:none; display:flex; align-items:center; justify-content:center;">
      <div style="font-size:120px; animation:popIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);">🏆</div>
    </div>`;

    // Confetti spawn (simplified)
    for (let i = 0; i < 20; i++) {
      const c = document.createElement('div');
      c.textContent = '🎊';
      c.className = 'particle';
      c.style.left = (Math.random() * 40) + 'vw';
      c.style.animationDuration = (2 + Math.random() * 2) + 's';
      document.getElementById('particles').appendChild(c);
    }

    setTimeout(() => {
      if (spsState.callback) {
        spsState.callback();
        return;
      }
      window.levelDone('sps');
    }, 3000);
  }

  // ── Word Puzzle Logic ──────────────────────────────────────
  function launchWord(cb = null) {
    if (!wordContainer) {
      wordContainer = document.getElementById('v-word');
      wordContainer.addEventListener('dragover', e => e.preventDefault());
    }

    wordState = {
      round: 0,
      currentWord: '',
      blanks: [],
      inputs: [],
      locked: false,
      callback: cb
    };

    renderWordRound();
    window.G.go('v-word');
  }

  function renderWordRound() {
    const r = WORD_ROUNDS[wordState.round];
    wordState.currentWord = r.word;
    wordState.blanks = r.blanks;

    wordContainer.innerHTML = `
      <div class="word-stage">
        <h2 style="font-family:'Fredoka', cursive; color:var(--purple);">Translate the Fragment (Phase ${wordState.round + 1}/3)</h2>
        <div class="word-row" id="word-slots">
          ${r.word.split('').map((char, i) => {
      if (r.blanks.includes(i)) {
        return `<div class="word-slot blank" data-idx="${i}"><input class="word-input" maxlength="1" id="w-in-${i}" oninput="window.WORD.checkInput(${i})"></div>`;
      }
      return `<div class="word-slot">${char}</div>`;
    }).join('')}
        </div>
        
        <div style="font-size:14px; color:var(--sub); font-style:italic;">"${r.hint}"</div>

        <div class="letter-pool">
          ${r.blanks.map(i => `<div class="letter-tile" draggable="true" ondragstart="window.WORD.dragStart(event, '${r.word[i]}')">${r.word[i]}</div>`).join('')}
        </div>

        <button class="dev-btn" style="width:120px; background:var(--rose);" onclick="window.WORD.clear()">CLEAR</button>
      </div>
    `;

    // Drop support
    document.querySelectorAll('.word-slot.blank').forEach(slot => {
      slot.addEventListener('drop', e => {
        const char = e.dataTransfer.getData('char');
        const input = slot.querySelector('input');
        input.value = char;
        window.WORD.checkInput(slot.dataset.idx);
      });
    });
  }

  function checkWordInput(idx) {
    const inputs = document.querySelectorAll('.word-input');
    let allFilled = true;
    let correct = true;

    inputs.forEach(input => {
      const char = input.value.toUpperCase();
      if (!char) {
        allFilled = false;
        return;
      }
      const i = parseInt(input.id.replace('w-in-', ''));
      if (char !== wordState.currentWord[i]) {
        correct = false;
      }
    });

    if (allFilled) {
      if (correct) {
        handleWordSuccess();
      } else {
        window.sfx('bad');
        document.getElementById('word-slots').style.animation = 'shake 0.4s';
        setTimeout(() => document.getElementById('word-slots').style.animation = '', 500);
      }
    }
  }

  async function handleWordSuccess() {
    window.sfx('win');
    const slots = document.getElementById('word-slots');
    slots.style.animation = 'winGlow 0.6s';

    wordState.round++;
    if (wordState.round < WORD_ROUNDS.length) {
      setTimeout(renderWordRound, 1000);
    } else {
      if (wordState.callback) {
        setTimeout(wordState.callback, 1000);
        return;
      }
      setTimeout(triggerFinalTransition, 1000);
    }
  }

  async function triggerFinalTransition() {
    // 1. Scroll Unfurl
    const overlay = document.createElement('div');
    overlay.className = 'full-overlay dark';
    overlay.style.display = 'flex';
    overlay.innerHTML = `
      <div class="scroll-paper" id="scroll-node" style="height:0; opacity:0;">
        <h3 style="text-align:center; margin-bottom:20px;">The Ancient Protocol</h3>
        <p>Dear Kku,</p>
        <p>You have deciphered the language of the bits. But to find Chu, you must transcend the physical realm. Drink the Potion of Transmutation to reveal your true form.</p>
        <div style="text-align:center; margin-top:30px;">
          <button class="dev-btn" id="btn-scroll-ok">I AM READY</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const scroll = document.getElementById('scroll-node');
    scroll.style.transition = 'height 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s';
    setTimeout(() => { scroll.style.height = '420px'; scroll.style.opacity = '1'; }, 100);

    document.getElementById('btn-scroll-ok').onclick = () => {
      // 2. Potion Overlay
      overlay.className = 'full-overlay light';
      overlay.innerHTML = `
        <div style="text-align:center; animation:popIn 0.8s;">
          <div style="font-size:100px; animation:float 3s infinite;">🧪</div>
          <h2 style="font-family:'Fredoka', cursive; color:var(--purple);">The Elf Potion</h2>
          <p style="color:var(--sub); margin:20px 0;">Drink this to unlock your magical potential.</p>
          <button class="dev-btn" id="btn-potion-drink" style="background:var(--purple);">DRINK IT</button>
        </div>
      `;

      document.getElementById('btn-potion-drink').onclick = () => {
        // 3. Transformation
        window.sfx('win');
        overlay.innerHTML = `<div style="font-size:200px; animation:bhspin 2s forwards;">✨</div>`;

        setTimeout(() => {
          overlay.remove();
          window.STATE.spsElf = true;
          const kkuEmoji = document.getElementById('kku-emoji');
          if (kkuEmoji) kkuEmoji.textContent = '🧝‍♀️';

          launchSPS(2); // Start Phase 2
        }, 2000);
      };
    };
  }

  // ── Exports ────────────────────────────────────────────────
  window.SPS = {
    launch: launchSPS,
    choose: chooseSPS,
    advance: function () { spsState.round++; renderSPS(); }
  };

  window.WORD = {
    launch: launchWord,
    checkInput: checkWordInput,
    dragStart: (e, char) => { e.dataTransfer.setData('char', char); },
    clear: () => {
      document.querySelectorAll('.word-input').forEach(i => i.value = '');
    }
  };

}());
