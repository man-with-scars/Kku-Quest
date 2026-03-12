// game/levels/level-02.js
// Exposes: window.LEVEL_REGISTRY push for Level 2
// Type: Trap

window.LEVEL_REGISTRY = window.LEVEL_REGISTRY || [];
window.LEVEL_REGISTRY.push({
  id: 2,
  view: 'v-L2',
  icon: '🐟',
  title: 'Taste the Truth',
  hint: '',

  build(el) {
    const options = [
      { text: "🍗 Anything with chicken", correct: false },
      { text: "🥩 Mutton on the bone", correct: false },
      { text: "🥘 A rich beef curry", correct: false },
      { text: "🐟 Seafood — the ocean's finest", correct: true }
    ];

    // Shuffle options
    const shuffled = options.sort(() => Math.random() - 0.5);

    el.innerHTML = `
      <div id="l2-stage" style="width:100%; height:100%; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center; background:rgba(230, 245, 255, 0.3);">
        
        <!-- Ripple Effect -->
        <div id="l2-ripple" style="position:absolute; width:600px; height:600px; border-radius:50%; pointer-events:none;"></div>

        <!-- Entry Animation: Fish -->
        <div id="l2-fish-scene" style="position:absolute; right:-150px; top:30%; display:flex; flex-direction:column; align-items:center;">
          <div style="font-size:80px; transform: scaleX(-1); filter:drop-shadow(0 5px 10px rgba(0,0,0,0.1));">🐟</div>
          <div id="l2-bubbles" style="margin-top:-20px; position:relative;"></div>
        </div>

        <!-- Riddle Card -->
        <div id="l2-card" class="riddle-card" style="opacity:0; transform:translateY(20px); pointer-events:none; z-index:10;">
          <div class="riddle-text">
            "No horns, no wings — it breathes in brine,<br>
            Chu's hand reaches past the menu every time.<br>
            It swam through depths before it reached his plate —<br>
            What creature does he love? Don't hesitate."
          </div>
          
          <div class="options-grid">
            ${shuffled.map((opt, i) => `
              <button class="opt-btn" data-correct="${opt.correct}">
                ${opt.text}
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
        max-width: 500px;
        width: 90%;
        transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .riddle-text {
        font-family: 'Lora', serif;
        font-style: italic;
        font-size: 20px;
        color: #B45309; /* Warm Amber */
        line-height: 1.6;
        margin-bottom: 30px;
      }
      .options-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }
      .opt-btn {
        background: #fff;
        border: 2px solid transparent;
        border-radius: 15px;
        padding: 15px;
        font-family: 'Fredoka One', cursive;
        font-size: 16px;
        color: var(--ink);
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      }
      .opt-btn:hover {
        transform: scale(1.02);
        border-color: var(--gold);
        box-shadow: 0 0 15px rgba(240,180,41,0.3);
      }
      .opt-btn.correct { background: #DCFCE7; border-color: var(--grass) !important; }
      .opt-btn.wrong { background: #FEE2E2; border-color: var(--rose) !important; }

      @keyframes fishSwim {
        to { transform: translateX(calc(-100vw - 300px)); }
      }
      @keyframes bubbleFloat {
        0% { transform: translateY(0) scale(0.5); opacity: 0.8; }
        100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
      }
      @keyframes ripplePulse {
        0% { transform: scale(0.8); opacity: 0.2; }
        50% { opacity: 0.5; }
        100% { transform: scale(1.2); opacity: 0.2; }
      }
      .bubble {
        position: absolute;
        width: 12px; height: 12px;
        border: 1px solid rgba(255,255,255,0.8);
        background: rgba(250,250,255,0.2);
        border-radius: 50%;
        animation: bubbleFloat 2s forwards;
      }
      #l2-ripple {
        background: radial-gradient(circle, rgba(200,230,255,0.4) 0%, transparent 70%);
        animation: ripplePulse 4s infinite ease-in-out;
      }
    `;
    document.head.appendChild(style);

    const fish = document.getElementById('l2-fish-scene');
    const card = document.getElementById('l2-card');
    const bubbles = document.getElementById('l2-bubbles');

    // Start fish swim
    fish.style.animation = 'fishSwim 5s linear forwards';

    // Bubble sequence
    let bubbleCount = 0;
    const bubbleTimer = setInterval(() => {
      if (bubbleCount >= 5) { clearInterval(bubbleTimer); return; }
      const bub = document.createElement('div');
      bub.className = 'bubble';
      bub.style.left = (Math.random() * 20 - 10) + 'px';
      bubbles.appendChild(bub);
      setTimeout(() => bub.remove(), 2000);
      bubbleCount++;
    }, 500);

    // Show card after fish passes
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      card.style.pointerEvents = 'auto';
    }, 1500);

    // Option Logic
    el.querySelectorAll('.opt-btn').forEach(btn => {
      btn.onclick = () => {
        const isCorrect = btn.dataset.correct === 'true';
        if (isCorrect) {
          window.sfx('ok');
          btn.classList.add('correct');
          btn.innerHTML += ' ✅';
          card.style.pointerEvents = 'none';
          setTimeout(() => {
            window.levelDone(2);
          }, 1000);
        } else {
          window.sfx('bad');
          window.G.loseLife();
          btn.classList.add('wrong');
          card.style.animation = 'shake 0.4s';
          setTimeout(() => card.style.animation = '', 500);
        }
      };
    });
  }
});
