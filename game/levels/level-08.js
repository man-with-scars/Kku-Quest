// game/levels/level-08.js
// Exposes: window.LEVEL_REGISTRY push for Level 8
// Type: Trap

window.LEVEL_REGISTRY = window.LEVEL_REGISTRY || [];
window.LEVEL_REGISTRY.push({
  id: 8,
  view: 'v-L8',
  title: "Singer's Enigma",
  type: 'trap',
  hint: '',

  build(el) {
    const options = [
      { text: "🎼 A.R. Rahman — the composer of epics", correct: false, note: '🎼' },
      { text: "🎤 Mohammed Rafi — golden, refined", correct: false, note: '🎤' },
      { text: "🎹 S.P. Balasubrahmanyam — a legend of melody", correct: false, note: '🎹' },
      { text: "🎸 Kishore Kumar — untamed and unmistakeable", correct: true, note: '🎸' }
    ];

    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    el.innerHTML = `
      <div id="l8-stage" style="width:100%; height:100%; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255, 255, 240, 0.4);">
        
        <!-- Entry Floating Notes -->
        <div id="l8-notes-container" style="position:absolute; inset:0; pointer-events:none;"></div>

        <!-- Correct Sweep Note -->
        <div id="l8-sweep-note" style="position:absolute; left:-100px; top:50%; font-size:60px; opacity:0; pointer-events:none; z-index:50;">🎶</div>

        <!-- Show Question Button (Hidden initially) -->
        <button id="l8-show" style="position:absolute; bottom:30px; right:30px; padding:15px 25px; border-radius:30px; background:var(--purple); color:white; font-family:'Fredoka', cursive; font-size:18px; border:none; box-shadow:0 4px 15px rgba(0,0,0,0.2); cursor:pointer; display:none; z-index:20; transition: transform 0.2s;">❓ Show Riddle</button>

        <!-- Riddle Card -->
        <div id="l8-card" class="riddle-card" style="opacity:0; transform:translateY(20px); pointer-events:none; z-index:10; position:relative;">
          <button id="l8-close" style="position:absolute; top:15px; right:20px; background:none; border:none; font-size:24px; cursor:pointer; color:var(--rose); transition:transform 0.2s;">✖</button>
          <div class="riddle-text">
            "He hummed in the shower and hummed at his desk —<br>
            a melody decades old, a voice none could best.<br>
            Not the Nightingale's soprano, so delicate and bright,<br>
            not the maestro of soundtracks composing the night.<br>
            Not the voice that once ruled every golden radio station —<br>
            this man sang with something wild, beyond all classification.<br>
            Who is Chu's singer that feeds his soul?"
          </div>
          
          <div id="l8-options" class="options-grid">
            ${shuffled.map((opt, i) => `
              <button class="opt-btn" data-correct="${opt.correct}" style="animation: bounceIn 0.5s ${0.8 + i * 0.1}s both;">
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
        max-width: 550px;
        width: 90%;
        transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .riddle-text {
        font-family: 'Lora', serif;
        font-style: italic;
        font-size: 18px;
        color: #B45309;
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
      
      .opt-btn.correct { background: #DCFCE7; border-color: var(--grass) !important; }
      .opt-btn.wrong { background: #FEE2E2; border-color: var(--rose) !important; }

      @keyframes riseup {
        from { transform: translateY(100vh) rotate(0deg); opacity: 0; }
        50% { opacity: 0.6; }
        to { transform: translateY(-100px) rotate(360deg); opacity: 0; }
      }
      @keyframes bounceIn {
        0% { transform: scale(0); opacity: 0; }
        60% { transform: scale(1.1); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes noteSweep {
        0% { transform: translateX(0) scale(1); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateX(calc(100vw + 200px)) scale(2); opacity: 0; }
      }
      .float-note {
        position: absolute;
        font-size: 24px;
        bottom: 0;
        animation: riseup 4s linear forwards;
      }
    `;
    document.head.appendChild(style);

    const notesContainer = document.getElementById('l8-notes-container');
    const sweepNote = document.getElementById('l8-sweep-note');
    const card = document.getElementById('l8-card');
    const noteTypes = ['🎵', '🎶', '🎼', '🎹', '🎸', '🎤'];

    // Entry Sequence: Floating Notes
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const n = document.createElement('div');
        n.className = 'float-note';
        n.innerHTML = noteTypes[Math.floor(Math.random() * noteTypes.length)];
        n.style.left = Math.random() * 90 + '%';
        n.style.animationDuration = (3 + Math.random() * 3) + 's';
        notesContainer.appendChild(n);
        setTimeout(() => n.remove(), 6000);
      }, i * 200);
    }

    // Show Card after initial notes rise
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      card.style.pointerEvents = 'auto';
    }, 1000);

    // Click Logic
    const closeBtn = document.getElementById('l8-close');
    const showBtn = document.getElementById('l8-show');
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

    el.querySelectorAll('.opt-btn').forEach(btn => {
      btn.onclick = () => {
        const isCorrect = btn.dataset.correct === 'true';
        if (isCorrect) {
          window.sfx('win');
          btn.classList.add('correct');
          card.style.pointerEvents = 'none';

          // Sweep Note Animation
          sweepNote.style.animation = 'noteSweep 1.5s ease-in-out forwards';

          setTimeout(() => {
            window.levelDone(8);
          }, 1500);
        } else {
          window.sfx('bad');
          window.G.loseLife();
          btn.classList.add('wrong');
          card.style.animation = 'shake 0.4s';
          setTimeout(() => { card.style.animation = ''; }, 400);

          card.style.pointerEvents = 'none';

          setTimeout(() => {
              card.style.pointerEvents = 'auto';
              btn.classList.remove('wrong');
          }, 1000);
        }
      };
    });
  }
});
