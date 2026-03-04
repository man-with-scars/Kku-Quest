// game/levels/level-06.js
// Exposes: window.LEVEL_REGISTRY push for Level 6
// Type: Trap

window.LEVEL_REGISTRY = window.LEVEL_REGISTRY || [];
window.LEVEL_REGISTRY.push({
  id: 6,
  view: 'v-L6',
  icon: '📱',
  title: 'Social Labyrinth',
  type: 'trap',
  hint: '📡 Privacy over performance. Think of a plane, not a face.',

  build(el) {
    const options = [
      { text: "📸 Instagram — where photos live in grids", correct: false, icon: '📸' },
      { text: "🐦 Twitter/X — where opinions go to argue", correct: false, icon: '🐦' },
      { text: "💬 WhatsApp — where family groups never stop", correct: false, icon: '💬' },
      { text: "✈️ Telegram — private, encrypted, chosen", correct: true, icon: '✈️' }
    ];

    // Shuffle options
    const shuffled = options.sort(() => Math.random() - 0.5);

    el.innerHTML = `
      <div id="l6-stage" style="width:100%; height:100%; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(240, 245, 255, 0.4);">
        
        <!-- Entry Scatter Icons -->
        <div id="l6-scatter" style="position:absolute; inset:0; pointer-events:none;"></div>

        <!-- Riddle Card -->
        <div id="l6-card" class="riddle-card" style="opacity:0; transform:translateY(20px); pointer-events:none; z-index:10;">
          <div class="riddle-text">
            "He scrolled past faces, past reels and the noise —<br>
            past every flashy platform and its temporary joys.<br>
            He found a quiet channel — encrypted, plain and true,<br>
            where messages travel without the world watching you.<br>
            Name the platform Chu calls home."
          </div>
          
          <div id="l6-options" class="options-grid">
            ${shuffled.map((opt, i) => `
              <button class="opt-btn" data-correct="${opt.correct}" style="animation: bounceIn 0.5s ${0.8 + i * 0.1}s both;">
                <span class="opt-icon">${opt.icon}</span> ${opt.text}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .riddle-card {
        background: var(--parchment);
        padding: 40px;
        border-radius: 30px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        text-align: center;
        max-width: 550px;
        width: 90%;
        transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .riddle-text {
        font-family: 'Lora', serif;
        font-style: italic;
        font-size: 19px;
        color: #B45309;
        line-height: 1.6;
        margin-bottom: 30px;
      }
      .options-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        transition: transform 0.6s;
      }
      .opt-btn {
        background: #fff;
        border: 2px solid transparent;
        border-radius: 15px;
        padding: 15px;
        font-family: 'Fredoka One', cursive;
        font-size: 15px;
        color: var(--ink);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.2s;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      }
      .opt-btn:hover {
        transform: scale(1.02);
        border-color: var(--gold);
        box-shadow: 0 0 15px rgba(240,180,41,0.3);
      }
      .opt-btn .opt-icon { animation: iconBounce 2s infinite ease-in-out; }
      .opt-btn.correct { background: #DCFCE7; border-color: var(--grass) !important; }
      .opt-btn.wrong { background: #FEE2E2; border-color: var(--rose) !important; }

      @keyframes iconBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
      }
      @keyframes bounceIn {
        0% { transform: scale(0); opacity: 0; }
        60% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes scatterOut {
        0% { transform: translate(0,0) scale(0); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 0; }
      }
      @keyframes spinGrid {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .scatter-icon {
        position: absolute;
        font-size: 30px;
        left: 50%; top: 50%;
        animation: scatterOut 1s forwards cubic-bezier(0.165, 0.84, 0.44, 1);
      }
    `;
    document.head.appendChild(style);

    const scatter = document.getElementById('l6-scatter');
    const card = document.getElementById('l6-card');
    const optionsGrid = document.getElementById('l6-options');
    const icons = ['📸', '🐦', '💬', '✈️', '📱', '📡', '📢', '💬', '👤'];

    // Entry Sequence: Scatter Icons
    icons.forEach((icon, i) => {
      setTimeout(() => {
        const s = document.createElement('div');
        s.className = 'scatter-icon';
        s.innerHTML = icon;
        const angle = (i / icons.length) * Math.PI * 2;
        const dist = 150 + Math.random() * 200;
        s.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
        s.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
        scatter.appendChild(s);
        setTimeout(() => s.remove(), 1000);
      }, i * 50);
    });

    // Show Card after scatter
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      card.style.pointerEvents = 'auto';
    }, 600);

    // Click Logic
    el.querySelectorAll('.opt-btn').forEach(btn => {
      btn.onclick = () => {
        const isCorrect = btn.dataset.correct === 'true';
        if (isCorrect) {
          window.sfx('win');
          btn.classList.add('correct');
          btn.innerHTML += ' ✅';
          card.style.pointerEvents = 'none';
          setTimeout(() => {
            window.levelDone(6);
          }, 1000);
        } else {
          window.sfx('bad');
          window.G.loseLife();
          btn.classList.add('wrong');

          // Wrong Animation: Spin then Shake
          optionsGrid.style.animation = 'spinGrid 0.6s ease-in-out';
          setTimeout(() => {
            optionsGrid.style.animation = 'shake 0.4s';
            setTimeout(() => { optionsGrid.style.animation = ''; }, 400);
          }, 600);

          card.style.pointerEvents = 'none';

          // Launch Trap
          if (window.SPS && window.SPS.launch) {
            window.SPS.launch(4, () => {
              if (window.showHint) window.showHint(6);
              setTimeout(() => {
                if (window.launchLevel) window.launchLevel(4);
              }, 3500);
            });
          }
        }
      };
    });
  }
});
