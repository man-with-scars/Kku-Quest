// game/levels/level-10.js
// Exposes: window.LEVEL_REGISTRY push for Level 10
// Type: Trap

window.LEVEL_REGISTRY = window.LEVEL_REGISTRY || [];
window.LEVEL_REGISTRY.push({
  id: 10,
  view: 'v-L10',
  icon: '🍦',
  title: 'Triple Trials',
  type: 'trap',
  hint: '',

  build(el) {
    let currentTrial = 1;
    const trials = [
      {
        id: 1,
        riddle: "I'm a flavor that dances on the tongue, with notes of saffron and sunset hues. A Spanish classic that feels like a fiesta in every bite. What am I?",
        correct: "🇪🇸 Spanish Delight",
        options: [
          "🍫 Belgian Chocolate",
          "🥭 Mango Madness",
          "🍓 Classic Strawberry",
          "🇪🇸 Spanish Delight"
        ]
      },
      {
        id: 2,
        riddle: "I am vast and blue, where salt spray kisses the air and horizons never end. Kku and Chu's favorite escape from the city neon. What am I?",
        correct: "🌊 The sea",
        options: [
          "🏔️ Mountains",
          "🛍️ The mall",
          "🌲 Deep forest",
          "🌊 The sea"
        ]
      },
      {
        id: 3,
        riddle: "I bring pine scents, twinkling lights, and the warmth of a thousand sweaters. The season of giving and the anniversary of a very special 'Begin Quest'. What am I?",
        correct: "🎄 Christmas season",
        options: [
          "🌸 Spring / Vishu",
          "☀️ Summer",
          "🌧️ Monsoon",
          "🎄 Christmas season"
        ]
      }
    ];

    el.innerHTML = `
      <div id="l10-stage" style="width:100%; height:100%; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255, 248, 240, 0.4);">
        
        <!-- Entry Animation: Drip -->
        <div id="l10-drip" style="position:absolute; top:-100px; font-size:80px; z-index:20; pointer-events:none;">🍦</div>

        <!-- Star Indicators -->
        <div id="l10-stars" style="display:flex; gap:10px; margin-bottom:20px; z-index:10; opacity:0; transition:opacity 0.6s 1s;">
          <span class="l10-star" id="l10-s1">☆</span>
          <span class="l10-star" id="l10-s2">☆</span>
          <span class="l10-star" id="l10-s3">☆</span>
        </div>

        <div id="l10-slider" style="display:flex; width:300%; transition: transform 0.6s cubic-bezier(0.77, 0, 0.175, 1); height:400px; align-items:center;">
          ${trials.map(t => {
      const shuffled = [...t.options].sort(() => Math.random() - 0.5);
      return `
              <div class="l10-trial" style="width:33.33%; display:flex; flex-direction:column; align-items:center;">
                <div class="riddle-card" style="width:90%; max-width:450px;">
                  <p class="riddle-text" style="font-family:'Lora', serif; font-style:italic; font-size:18px; color:#B45309; margin-bottom:25px;">
                    ${t.riddle}
                  </p>
                  <div class="options-grid">
                    ${shuffled.map(opt => `
                      <button class="opt-btn" data-correct="${opt === t.correct}">${opt}</button>
                    `).join('')}
                  </div>
                </div>
              </div>
            `;
    }).join('')}
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .l10-star { font-size: 30px; color: var(--gold); transition: 0.3s; }
      .l10-star.active { content: '★'; color: var(--gold); transform: scale(1.2); }
      
      .riddle-card {
        background: var(--parchment); padding: 35px; border-radius: 25px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.08); text-align: center;
      }
      .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .opt-btn {
        background: #fff; border: 2px solid transparent; border-radius: 12px;
        padding: 12px; font-family: 'Fredoka One', cursive; font-size: 14px;
        color: var(--ink); cursor: pointer; transition: all 0.2s;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      }
      .opt-btn:hover { transform: scale(1.02); border-color: var(--gold); }
      .opt-btn.correct { background: #DCFCE7; border-color: var(--grass) !important; }
      .opt-btn.wrong { background: #FEE2E2; border-color: var(--rose) !important; }

      @keyframes iceDrip {
        0% { transform: translateY(0); }
        80% { transform: translateY(180px); }
        100% { transform: translateY(200px) scaleY(0.6); opacity: 0; }
      }
      @keyframes popStar {
        0% { transform: scale(4); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    const drip = document.getElementById('l10-drip');
    const stars = document.getElementById('l10-stars');
    const slider = document.getElementById('l10-slider');

    // Entry Sequence
    setTimeout(() => {
      drip.style.animation = 'iceDrip 1.5s forwards ease-in';
      setTimeout(() => {
        stars.style.opacity = '1';
        updateStars();
      }, 1200);
    }, 300);

    function updateStars() {
      for (let i = 1; i <= 3; i++) {
        const s = document.getElementById(`l10-s${i}`);
        if (i <= currentTrial) {
          s.innerHTML = '★';
          s.classList.add('active');
          if (i === currentTrial) s.style.animation = 'popStar 0.4s both';
        } else {
          s.innerHTML = '☆';
          s.classList.remove('active');
        }
      }
    }

    el.querySelectorAll('.opt-btn').forEach(btn => {
      btn.onclick = () => {
        const isCorrect = btn.dataset.correct === 'true';
        if (isCorrect) {
          window.sfx('ok');
          btn.classList.add('correct');
          btn.innerHTML += ' ✅';

          if (currentTrial < 3) {
            setTimeout(() => {
              currentTrial++;
              updateStars();
              slider.style.transform = `translateX(-${(currentTrial - 1) * 33.33}%)`;
            }, 800);
          } else {
            setTimeout(() => {
              window.sfx('win');
              window.levelDone(10);
            }, 800);
          }
        } else {
          window.sfx('bad');
          window.G.loseLife();
          btn.classList.add('wrong');

          if (window.SPS && window.SPS.launch) {
            window.SPS.launch(8, () => {
              if (window.showHint) window.showHint(10);
              setTimeout(() => {
                if (window.launchLevel) window.launchLevel(8);
              }, 3500);
            });
          }
        }
      };
    });
  }
});
