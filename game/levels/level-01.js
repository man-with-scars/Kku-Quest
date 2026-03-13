// game/levels/level-01.js
// Exposes: window.LEVEL_REGISTRY push for Level 1
// Type: Trap

window.LEVEL_REGISTRY = window.LEVEL_REGISTRY || [];
window.LEVEL_REGISTRY.push({
  id: 1,
  view: 'v-L1',
  icon: '🚗',
  title: 'The First Clue',
  hint: '',

  build(el) {
    const options = [
      { text: "🛋️ The living room sofa", correct: false },
      { text: "🌳 Beneath a favourite tree", correct: false },
      { text: "🏠 The corner of his bedroom", correct: false },
      { text: "🚗 Riding in a car", correct: true }
    ];

    // Shuffle options properly
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    el.innerHTML = `
      <div id="l1-stage" style="width:100%; height:100%; position:relative; overflow:hidden; display:flex; align-items:center; justify-content:center;">
        
        <!-- Show Question Button (Hidden initially) -->
        <button id="l1-show" style="position:absolute; bottom:30px; right:30px; padding:15px 25px; border-radius:30px; background:var(--purple); color:white; font-family:'Fredoka', cursive; font-size:18px; border:none; box-shadow:0 4px 15px rgba(0,0,0,0.2); cursor:pointer; display:none; z-index:20; transition: transform 0.2s;">❓ Show Riddle</button>

        <!-- Riddle Card -->
        <div id="l1-card" class="riddle-card" style="opacity:0; transform:translateY(20px); pointer-events:none; position:relative;">
          <button id="l1-close" style="position:absolute; top:15px; right:20px; background:none; border:none; font-size:24px; cursor:pointer; color:var(--rose); transition:transform 0.2s;">✖</button>
          <div class="riddle-text">
            "I have four wheels yet I'm no throne,<br>
            Chu loves being inside me when he's not alone.<br>
            I carry him places where silence meets speed —<br>
            and in me, beside you, is all that he needs.<br>
            What am I?"
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

      @keyframes exhaustFloat {
        0% { transform: translateY(0) scale(1); opacity: 0.8; }
        100% { transform: translateY(-40px) scale(1.5); opacity: 0; }
      }
      .puff {
        position: absolute;
        width: 15px; height: 15px;
        background: rgba(150,150,150,0.4);
        border-radius: 50%;
        animation: exhaustFloat 1s forwards;
      }
    `;
    document.head.appendChild(style);

    const card = el.querySelector('#l1-card');
    const closeBtn = el.querySelector('#l1-close');
    const showBtn = el.querySelector('#l1-show');

    if (card) {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      card.style.pointerEvents = 'auto';
    }

    if (closeBtn && showBtn && card) {
      closeBtn.onclick = () => {
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        card.style.transform = 'translateY(20px)';
        showBtn.style.display = 'block';
      };
      showBtn.onclick = () => {
        card.style.opacity = '1';
        card.style.pointerEvents = 'auto';
        card.style.transform = 'translateY(0)';
        showBtn.style.display = 'none';
      };
    }

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
            window.levelDone(1);
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
