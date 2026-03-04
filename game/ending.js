// game/ending.js
// Exposes: window.Ending = { init, buildFall, buildFinding, buildEnding }
// Responsibility: The multi-stage cinematic finale of the game.

window.Ending = (function () {
  'use strict';

  let container = null;

  /**
   * Injects CSS for the ending sequences.
   */
  function createStyle() {
    const css = `
      /* Common Layout */
      .end-view {
        width: 100%; height: 100%;
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
      }
      .end-view.active { display: flex; }

      /* Crack Animation */
      .crack-card {
        background: var(--parchment);
        padding: 40px;
        border-radius: 5px;
        box-shadow: 0 5px 25px rgba(0,0,0,0.2);
        text-align: center;
        position: relative;
      }
      .crack-overlay {
        position: absolute; inset: 0;
        pointer-events: none;
        background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><path d="M0 0 L50 20 L100 0 M50 20 L40 60 L60 100" stroke="black" fill="none" opacity="0.1"/></svg>');
        background-size: 200px;
        animation: crackAnim 0.5s steps(4) forwards;
        opacity: 0;
      }
      @keyframes crackAnim { to { opacity: 1; } }

      /* Transformation Overlay */
      .trans-overlay {
        position: fixed; inset: 0; z-index: 5000;
        background: linear-gradient(135deg, #fff 0%, #f3e8ff 100%);
        display: none; flex-direction: column; align-items: center; justify-content: center;
        animation: fadeIn 0.5s;
      }
      .trans-bar {
        width: 300px; height: 10px; background: rgba(0,0,0,0.1);
        border-radius: 5px; margin: 30px 0; overflow: hidden;
      }
      .trans-fill { height: 100%; background: var(--purple); width: 0%; transition: width 0.1s linear; }
      .trans-msg { font-family: 'Fredoka', cursive; font-size: 24px; color: var(--purple); height: 40px; }

      /* Final Gallery */
      .gallery-strip {
        display: flex; gap: 20px; padding: 20px;
        perspective: 1000px;
      }
      .polaroid {
        background: white; padding: 10px 10px 40px 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        width: 120px; height: 150px;
        border: 1px solid #ddd;
        transition: transform 0.3s;
        animation: float 4s infinite ease-in-out;
      }
      .polaroid img, .polaroid .placeholder {
        width: 100%; height: 110px; object-fit: cover;
        background: #f9f9f9;
      }
      .polaroid .placeholder {
        display: flex; align-items: center; justify-content: center;
        border: 1px dashed #ccc; color: #ccc; font-size: 10px; text-align: center;
      }

      /* Card Styles */
      .poem-card {
        background: var(--parchment);
        border: 1px solid var(--rose);
        border-radius: 10px; padding: 30px;
        max-width: 500px; margin: 20px;
        font-family: 'Lora', serif; font-style: italic;
        line-height: 1.8; color: #444;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
      }
      .memory-card {
        background: var(--parchment);
        border: 2px solid var(--gold);
        border-radius: 12px; padding: 15px 25px;
        display: flex; gap: 15px; font-size: 14px;
        font-family: 'Fredoka', cursive; color: #555;
      }

      /* Confetti */
      .confetti {
        position: fixed; width: 10px; height: 10px;
        pointer-events: none; z-index: 6000;
        animation: conffall linear forwards;
      }
      @keyframes conffall {
        to { transform: translateY(100vh) rotate(720deg); }
      }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function init(target) {
    if (!container) createStyle();
    container = target;
  }

  // ── Stage 1: The Floor Cracks ──────────────────────────────
  function buildFall() {
    window.G.go('v-fall');
    const v = document.getElementById('v-fall');
    window.sfx('crack');

    v.innerHTML = `
      <div class="crack-card">
        <div class="crack-overlay"></div>
        <h2 style="font-family:'Fredoka', cursive; color:var(--ink); margin-bottom:20px;">Wait... something is happening.</h2>
        <p style="color:var(--sub); margin-bottom:30px;">The digital floor beneath Kku begins to fragment...</p>
        <button class="dev-btn" id="btn-fall-next" style="background:var(--ink);">Find Chu... →</button>
      </div>
    `;

    document.getElementById('btn-fall-next').onclick = () => {
      buildFinding();
    };
  }

  // ── Stage 2: Finding Chu ───────────────────────────────────
  function buildFinding() {
    window.G.go('v-finding');
    const v = document.getElementById('v-finding');

    v.innerHTML = `
      <div style="text-align:center;">
        <div id="chu-emoji" style="font-size:120px; animation:shake 0.5s infinite;">💼</div>
        <div style="display:flex; gap:20px; margin-top:30px;">
          <div class="crack-card" style="width:200px;">
            <p style="font-size:14px;">Chu is trapped in a spiral of stress and deadlines.</p>
          </div>
          <div class="crack-card" style="width:200px;">
            <p style="font-size:14px;">Use the collected fragments to restore the bond!</p>
          </div>
        </div>
        <button class="dev-btn" style="margin-top:40px; background:var(--gold);" onclick="window.Ending.startTransformation()">RESTORE CHU 💕</button>
      </div>
    `;
  }

  // ── Stage 3: Transformation ────────────────────────────────
  async function startTransformation() {
    const overlay = document.createElement('div');
    overlay.className = 'trans-overlay';
    overlay.style.display = 'flex';
    document.body.appendChild(overlay);

    const msgs = ['SPINNING 360°', 'LOVE TRANSFORMING', 'STRESS DISSOLVING', 'HIM RETURNING', 'COMPLETE! 💚'];
    overlay.innerHTML = `
      <div class="trans-msg" id="t-msg">INITIATING...</div>
      <div class="trans-bar"><div class="trans-fill" id="t-fill"></div></div>
      <div style="font-size:80px; animation:bhspin 2s infinite;">✨</div>
    `;

    const elMsg = document.getElementById('t-msg');
    const elFill = document.getElementById('t-fill');

    let start = null;
    const duration = 7000;

    function frame(time) {
      if (!start) start = time;
      const progress = time - start;
      const p = Math.min(progress / duration, 1);

      elFill.style.width = (p * 100) + '%';

      const msgIdx = Math.floor(p * 4.9);
      elMsg.textContent = msgs[msgIdx];

      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        finish();
      }
    }

    function finish() {
      const chuEmoji = document.getElementById('chu-emoji');
      if (chuEmoji) {
        chuEmoji.textContent = '👨‍💻'; // chu-happy
        chuEmoji.style.animation = 'popIn 0.8s';
      }
      window.sfx('win');

      // Heart particles
      for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = '❤️';
        p.style.left = (Math.random() * 100) + 'vw';
        p.style.animationDuration = (2 + Math.random() * 2) + 's';
        document.getElementById('particles').appendChild(p);
      }

      setTimeout(() => {
        overlay.classList.add('panel-exit');
        setTimeout(() => {
          overlay.remove();
          buildEnding();
        }, 500);
      }, 2100);
    }

    requestAnimationFrame(frame);
  }

  // ── Stage 4: The Final Screen ──────────────────────────────
  async function buildEnding() {
    window.G.go('v-ending');
    const v = document.getElementById('v-ending');
    v.style.background = 'black'; // Start black

    // 1. Voice Replay (landing Phase 3 text)
    const voiceText = "In the silence, I found your heart. Through the binary, I saw our world. You are my most beautiful glitch. I love you, now and always.";

    // Play voice if enabled/supported
    if ('speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(voiceText);
      utter.rate = 0.9;
      utter.pitch = 1.1;
      window.speechSynthesis.speak(utter);
    }

    // 2. Warm light fadeIn
    setTimeout(() => {
      v.style.transition = 'background 2s ease';
      v.style.background = 'var(--parchment)';

      renderEndingUI(v);
    }, 1000);
  }

  function renderEndingUI(v) {
    const s = window.STATE;
    const gallery = [
      s.assetStore.bg.gallery_01,
      s.assetStore.bg.gallery_02,
      s.assetStore.bg.gallery_03,
      s.assetStore.bg.gallery_04,
      s.assetStore.bg.gallery_05
    ];

    v.innerHTML = `
      <div style="animation:fadeup 2s forwards; display:flex; flex-direction:column; align-items:center;">
        
        <div class="gallery-strip">
          ${gallery.map((src, i) => `
            <div class="polaroid" style="animation-delay:${i * 0.5}s; transform:rotate(${(Math.random() * 10 - 5)}deg)">
              ${src ? `<img src="${src}">` : `<div class="placeholder">Silhouette<br>Placeholder</div>`}
            </div>
          `).join('')}
        </div>

        <div class="poem-card">
          <p>
            I loved you before, I'm loving you now,<br>
            A binary heartbeat, our digital vow.<br>
            Through every level and every riddle,<br>
            Our love remains strong, right in the middle.
          </p>
          <div style="text-align:right; margin-top:20px; font-weight:bold;">
            — എന്നും നിൻ്റെ 'ച്ചു' 💙
          </div>
        </div>

        <div class="memory-card">
          <span>📅 March 13</span> | 
          <span>🎵 Singing sessions</span> | 
          <span>🍚 Mandhi breakfast</span> | 
          <span>🌆 Evening walk</span>
        </div>

        <h1 style="font-family:'Fredoka', cursive; color:var(--rose); font-size:40px; margin:30px 0;">HAPPY ANNIVERSARY, KKU! 🎉</h1>
        
        <button class="dev-btn" style="background:var(--grass); width:200px; animation:pulse 1.5s infinite;" onclick="window.Ending.launchConfetti()">CELEBRATE! 🎊</button>
      </div>
    `;
  }

  function launchConfetti() {
    window.sfx('win');
    const colors = ['#fb7185', '#7c3aed', '#f0b429', '#38bdf8', '#10b981'];
    for (let i = 0; i < 80; i++) {
      setTimeout(() => {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = (Math.random() * 100) + 'vw';
        c.style.top = '-20px';
        c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        c.style.width = (Math.random() > 0.5 ? '10px' : '6px');
        c.style.height = (Math.random() > 0.5 ? '10px' : '6px');
        c.style.borderRadius = (Math.random() > 0.5 ? '50%' : '0');
        c.style.animationDuration = (2 + Math.random() * 1.5) + 's';
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 4000);
      }, i * 22);
    }
  }

  return {
    init: init,
    buildFall: buildFall,
    buildFinding: buildFinding,
    buildEnding: buildEnding,
    startTransformation: startTransformation,
    launchConfetti: launchConfetti
  };
}());
