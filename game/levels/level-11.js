// game/levels/level-marry.js
// Exposes: window.LEVEL_REGISTRY push for Level Marry
// Type: Boss

window.LEVEL_REGISTRY = window.LEVEL_REGISTRY || [];
window.LEVEL_REGISTRY.push({
  id: 11,
  view: 'v-L11',
  icon: '💍',
  title: 'The Prophecy',
  type: 'boss',
  hint: '',

  build(el) {
    let phase = 0;
    let fleeCount = 0;
    let phase2Timer = null;
    let basketInterval = null;

    el.innerHTML = `
      <div id="marry-stage" style="width:100%; height:100%; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255, 240, 245, 0.5);">
        
        <!-- Entry Animation: Petal Rain -->
        <div id="marry-petals" style="position:absolute; inset:0; pointer-events:none; z-index:1;"></div>

        <div id="marry-arena" style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:10;">
          
          <h2 id="marry-quest" style="font-family:'Fredoka One', cursive; color:var(--rose); font-size:32px; margin-bottom:40px; text-align:center;">Do you love Chu? 💕</h2>
          
          <!-- Phase 0/1 Buttons -->
          <div id="marry-p01" style="display:flex; justify-content:center; gap:40px; position:relative; min-height:150px; width:100%;">
            <button id="btn-marry-yes" class="marry-btn" style="background:var(--grass); color:white; width:180px; font-size:24px;">YES! ✨</button>
            <button id="btn-marry-no" class="marry-btn" style="background:var(--rose); color:white; width:120px; font-size:18px;">No</button>
          </div>

          <!-- Phase 2: Basketball -->
          <div id="marry-p2" style="display:none; position:absolute; inset:0;">
            <div id="marry-ball" style="position:absolute; width:60px; height:60px; background:radial-gradient(circle at 30% 30%, #fb923c, #ea580c); border-radius:50%; border:2px solid #9a3412; cursor:grab; z-index:50; display:flex; align-items:center; justify-content:center; font-size:30px; box-shadow:0 4px 10px rgba(0,0,0,0.3);">🏀</div>
            
            <div id="basket-yes" class="basket" style="left:20%; top:30%;">
              <div class="basket-rim"></div>
              <div class="basket-net">YES! 🏆</div>
            </div>
            
            <div id="basket-no" class="basket" style="right:20%; top:30%;">
              <div class="basket-rim" style="border-color:#555;"></div>
              <div class="basket-net" style="background:rgba(80,80,80,0.3);">No ❌</div>
            </div>
          </div>

          <!-- Phase 3: Ruby Heart -->
          <div id="marry-p3" style="display:none; position:absolute; inset:0; align-items:center; justify-content:center;">
             <div id="ruby-heart" style="font-size:120px; cursor:pointer; position:relative; z-index:100;">❤️
                <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:20px; color:white; font-family:'Fredoka One', cursive; pointer-events:none;">YES</div>
             </div>
          </div>

        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .marry-btn {
        padding: 15px; border-radius: 25px; font-family: 'Fredoka One', cursive;
        cursor: pointer; transition: 0.2s; border: 3px solid white;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      }
      .petal {
        position: absolute; font-size: 20px; color: var(--rose);
        animation: petalFall 4s linear forwards;
      }
      @keyframes petalFall {
        0% { transform: translateY(-50px) rotate(0deg) translateX(0); opacity: 0; }
        10% { opacity: 0.8; }
        100% { transform: translateY(110vh) rotate(720deg) translateX(var(--px)); opacity: 0; }
      }
      
      .basket {
        position: absolute; width:120px; height:100px; display:flex; flex-direction:column; align-items:center; transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .basket-rim { width:100px; height:15px; border:4px solid var(--gold); border-radius:50%; }
      .basket-net { 
        width:80px; height:70px; background:rgba(255,191,0,0.2); 
        border:2px dashed var(--gold); border-top:none; border-radius:0 0 40px 40px;
        display:flex; align-items:center; justify-content:center; font-family:'Fredoka One'; color:var(--ink);
      }

      #ruby-heart {
        animation: heartbeat 0.8s infinite;
        filter: drop-shadow(0 0 20px rgba(255,30,80,0.8)) drop-shadow(0 0 40px rgba(255,30,80,0.4));
      }
      @keyframes heartbeat { 0%,100%{transform:scale(1);} 15%,45%{transform:scale(1.15);} }
    `;
    document.head.appendChild(style);

    const petals = document.getElementById('marry-petals');
    const btnNo = document.getElementById('btn-marry-no');
    const btnYes = document.getElementById('btn-marry-yes');
    const p01 = document.getElementById('marry-p01');
    const p2 = document.getElementById('marry-p2');
    const p3 = document.getElementById('marry-p3');
    const ball = document.getElementById('marry-ball');
    const bYes = document.getElementById('basket-yes');
    const bNo = document.getElementById('basket-no');
    const heart = document.getElementById('ruby-heart');

    // Petal Rain
    function createPetal() {
      const p = document.createElement('div');
      p.className = 'petal';
      p.innerHTML = '🌸';
      p.style.left = Math.random() * 100 + '%';
      p.style.setProperty('--px', (Math.random() * 200 - 100) + 'px');
      p.style.animationDuration = (3 + Math.random() * 3) + 's';
      petals.appendChild(p);
      setTimeout(() => p.remove(), 6000);
    }
    const petalInterval = setInterval(createPetal, 400);

    // Phase 0: YES Click
    btnYes.onclick = () => {
      window.sfx('win');
      btnYes.style.transition = 'all 0.3s';
      btnYes.style.opacity = '0';
      btnYes.style.transform = 'scale(0)';
      setTimeout(() => {
        btnYes.style.display = 'none';
        phase = 1;
        // NO button setup for Phase 1
        btnNo.style.position = 'absolute';
      }, 300);
    };

    // Phase 1: Elusive NO
    el.onmousemove = (e) => {
      if (phase !== 1) return;
      const rect = btnNo.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 120) {
        flee();
      }
    };

    function flee() {
      window.sfx('click');
      fleeCount++;
      const arena = document.getElementById('marry-arena');
      const arb = arena.getBoundingClientRect();
      const newX = Math.random() * (arb.width - 150) + 75;
      const newY = Math.random() * (arb.height - 150) + 75;

      btnNo.style.transition = 'none';
      btnNo.style.left = newX + 'px';
      btnNo.style.top = newY + 'px';
      btnNo.style.transform = 'translate(-50%, -50%) scale(0.9)';

      if (fleeCount >= 10) startPhase2();
    }

    // Auto-advance to Phase 2 after 30s
    const globalTimeout = setTimeout(() => {
      if (phase === 1) startPhase2();
    }, 30000);

    function startPhase2() {
      if (phase === 2) return;
      phase = 2;
      clearTimeout(globalTimeout);
      p01.style.display = 'none';
      p2.style.display = 'block';
      window.sfx('up');

      // Draggable Ball
      let isDragging = false;
      let startX, startY;

      ball.onmousedown = ball.ontouchstart = (e) => {
        isDragging = true;
        const pt = e.touches ? e.touches[0] : e;
        startX = pt.clientX - ball.offsetLeft;
        startY = pt.clientY - ball.offsetTop;
        ball.style.cursor = 'grabbing';
      };

      window.onmousemove = window.ontouchmove = (e) => {
        if (!isDragging) return;
        const pt = e.touches ? e.touches[0] : e;
        let x = pt.clientX - startX;
        let y = pt.clientY - startY;

        ball.style.left = x + 'px';
        ball.style.top = y + 'px';

        checkCollision(x + 30, y + 30);
      };

      window.onmouseup = window.ontouchend = () => {
        isDragging = false;
        ball.style.cursor = 'grab';
      };

      // Baskets moving logic
      basketInterval = setInterval(() => {
        const arb = el.getBoundingClientRect();
        bNo.style.left = Math.random() * 70 + 15 + '%';
        bNo.style.top = Math.random() * 50 + 10 + '%';
      }, 7000);

      // Swap baskets after 10s
      setTimeout(() => {
        const tempX = bYes.style.left;
        const tempY = bYes.style.top;
        bYes.style.left = bNo.style.left || '80%';
        bYes.style.top = bNo.style.top || '30%';
        // No labels swapped, just positions
      }, 10000);

      // Finish Phase 2 after 22s
      phase2Timer = setTimeout(startPhase3, 22000);
    }

    function checkCollision(bx, by) {
      const yesRect = bYes.getBoundingClientRect();
      const noRect = bNo.getBoundingClientRect();

      // Simple radial check for the "rim"
      const distYes = Math.sqrt(Math.pow(bx - (yesRect.left + 50), 2) + Math.pow(by - (yesRect.top + 10), 2));
      const distNo = Math.sqrt(Math.pow(bx - (noRect.left + 50), 2) + Math.pow(by - (noRect.top + 10), 2));

      if (distNo < 40) fleeNoBasket();
      if (distYes < 40) startPhase3();
    }

    function fleeNoBasket() {
      window.sfx('click');
      bNo.style.left = Math.random() * 70 + 15 + '%';
      bNo.style.top = Math.random() * 50 + 10 + '%';
    }

    function startPhase3() {
      if (phase === 3) return;
      phase = 3;
      clearInterval(basketInterval);
      clearTimeout(phase2Timer);
      p2.style.display = 'none';
      p3.style.display = 'flex';
      window.sfx('win');
    }

    heart.onclick = () => {
      window.sfx('win');
      clearInterval(petalInterval);

      // Final transition: boss win screen sequence
      const winCard = document.createElement('div');
      winCard.style.cssText = `
        position:fixed; inset:0; background:rgba(255,255,255,0.9);
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        z-index:200; font-family:'Fredoka One'; animation:fadeup 0.8s forwards;
      `;
      winCard.innerHTML = `
        <h1 style="color:var(--rose); font-size:48px; margin-bottom:20px;">💕 "Of course it is. 🥺"</h1>
        <p style="color:var(--ink); font-size:24px; margin-bottom:40px;">"It was always going to be yes."</p>
        <button id="btn-final-cont" class="dev-btn" style="background:var(--rose); width:250px;">CONTINUE 💕</button>
      `;
      document.body.appendChild(winCard);

      document.getElementById('btn-final-cont').onclick = () => {
        winCard.remove();
        if (window.SPS && window.SPS.launch) {
          window.SPS.launch(11, () => window.levelDone(11));
        } else {
          window.levelDone(11);
        }
      };
    };
  }
});
