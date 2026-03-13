// game/levels/level-04.js
// Exposes: window.LEVEL_REGISTRY push for Level 4
// Type: Trap

window.LEVEL_REGISTRY = window.LEVEL_REGISTRY || [];
window.LEVEL_REGISTRY.push({
  id: 4,
  view: 'v-L4',
  title: 'Cinema Enigma',
  hint: '',

  build(el) {
    const options = [
      { text: "📺 Big television in the lounge", correct: false },
      { text: "🎥 Theatre with full surround sound", correct: false },
      { text: "😴 Anywhere — he falls asleep either way", correct: false },
      { text: "🎧 Phone and earphones, just two of us", correct: true }
    ];

    // Shuffle options properly
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    el.innerHTML = `
      <div id="l4-stage" style="width:100%; height:100%; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center;">
        
        <!-- Clapperboard Animation -->
        <div id="l4-clapper" style="position:absolute; top:-200px; display:flex; flex-direction:column; align-items:center; transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index:20;">
          <div style="font-size:100px; animation: reelSpin 2s linear infinite;">🎬</div>
          <div id="l4-clapper-snap" style="font-size:40px; opacity:0; margin-top:-20px; font-family:'Fredoka One', cursive; color:var(--purple);">SNAP!</div>
        </div>

        <!-- Show Question Button (Hidden initially) -->
        <button id="l4-show" style="position:absolute; bottom:30px; right:30px; padding:15px 25px; border-radius:30px; background:var(--purple); color:white; font-family:'Fredoka', cursive; font-size:18px; border:none; box-shadow:0 4px 15px rgba(0,0,0,0.2); cursor:pointer; display:none; z-index:20; transition: transform 0.2s;">❓ Show Riddle</button>

        <!-- Riddle Card -->
        <div id="l4-card" class="riddle-card" style="opacity:0; transform:translateY(20px); pointer-events:none; position:relative;">
          <button id="l4-close" style="position:absolute; top:15px; right:20px; background:none; border:none; font-size:24px; cursor:pointer; color:var(--rose); transition:transform 0.2s;">✖</button>
          <div class="riddle-text">
            "Not a theatre's roar, not a living-room glow —<br>
            Chu's ideal cinema is quiet and low.<br>
            He wants it private, shared with just one soul,<br>
            Where sound is personal and closeness is the goal.<br>
            How does he truly love to watch films?"
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
        font-size: 19px;
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

      @keyframes reelSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes clapperSnap {
        0% { transform: scale(1); }
        50% { transform: scale(1.2) rotate(-5deg); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);

    const clapper = document.getElementById('l4-clapper');
    const snap = document.getElementById('l4-clapper-snap');
    const card = document.getElementById('l4-card');

    // Entry Sequence
    setTimeout(() => {
      // Clapper slide down
      clapper.style.top = '10%';

      // Snap after slide
      setTimeout(() => {
        window.sfx('click');
        clapper.style.animation = 'clapperSnap 0.2s forwards';
        snap.style.opacity = '1';

        // Show card after snap
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
          card.style.pointerEvents = 'auto';
          clapper.style.top = '-200px'; // Slide back up
        }, 600);
      }, 800);
    }, 300);

    const closeBtn = document.getElementById('l4-close');
    const showBtn = document.getElementById('l4-show');
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
            window.levelDone(4);
          }, 1000);
        } else {
          window.sfx('bad');
          window.G.loseLife();
          btn.classList.add('wrong');
          card.style.animation = 'shake 0.4s';

          card.style.pointerEvents = 'none';

          setTimeout(() => {
              card.style.pointerEvents = 'auto';
              btn.classList.remove('wrong');
              card.style.animation = '';
          }, 1000);
        }
      };
    });
  }
});
