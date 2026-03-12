// game/levels/level-09.js
// Exposes: window.LEVEL_REGISTRY push for Level 9
// Type: Collect (Fragment 74)

window.LEVEL_REGISTRY = window.LEVEL_REGISTRY || [];
window.LEVEL_REGISTRY.push({
  id: 9,
  view: 'v-L9',
  icon: '📦',
  title: 'Grand Vault',
  type: 'collect',
  hint: '',

  build(el) {
    let currentTask = 1;

    el.innerHTML = `
      <div id="l9-stage" style="width:100%; height:100%; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255, 250, 230, 0.4);">
        
        <!-- Entry Animation: Vault Door -->
        <div id="l9-vault-container" style="position:absolute; inset:0; z-index:100; pointer-events:none; display:flex;">
          <div id="l9-door-l" style="flex:1; background:#222; border-right:2px solid #444; transition: transform 0.8s ease-in;"></div>
          <div id="l9-door-r" style="flex:1; background:#222; border-left:2px solid #444; transition: transform 0.8s ease-in;"></div>
        </div>

        <!-- Level Header -->
        <div id="l9-header" style="opacity:0; transition: opacity 0.6s 0.8s; text-align:center; z-index:10;">
          <div style="font-family:'Fredoka One', cursive; font-size:14px; background:var(--purple); color:white; padding:4px 12px; border-radius:20px; display:inline-block; margin-bottom:8px;">
            📸 LEVEL 9 — THE GRAND VAULT
          </div>
          <p style="font-family:'Lora', serif; font-style:italic; font-size:18px; color:var(--purple); line-height:1.5; background: rgba(255,255,255,0.7); padding: 10px 20px; border-radius: 20px; backdrop-filter: blur(5px); box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            "Four sacred tokens, Kku.<br>
            The fairy cannot move forward without all of them."
          </p>
        </div>

        <!-- Tasks Container -->
        <div id="l9-tasks" style="display:flex; flex-direction:column; gap:12px; margin-top:20px; z-index:10; width:100%; align-items:center;">
          
          <!-- Task 1: Bindi -->
          <div id="l9-t1" class="l9-task-row" style="opacity:0; transform:translateX(-20px);">
             <label for="l9-input-1" class="l9-task-box active">
               <span class="l9-task-icon">🔴</span>
               <span class="l9-task-text">Bindi on white paper</span>
               <input type="file" id="l9-input-1" accept="image/*" capture="environment" style="display:none;">
               <div class="l9-check">✅</div>
             </label>
          </div>

          <!-- Task 2: Letter -->
          <div id="l9-t2" class="l9-task-row locked">
             <label for="l9-input-2" class="l9-task-box">
               <span class="l9-task-icon">📝</span>
               <span class="l9-task-text">Handwritten letter (2+ paragraphs)</span>
               <input type="file" id="l9-input-2" accept="image/*" capture="environment" style="display:none;">
               <div class="l9-check">✅</div>
             </label>
          </div>

          <!-- Task 3: First Letter -->
          <div id="l9-t3" class="l9-task-row locked">
             <label for="l9-input-3" class="l9-task-box">
               <span class="l9-task-icon">💌</span>
               <span class="l9-task-text">First letter from Chu</span>
               <input type="file" id="l9-input-3" accept="image/*" style="display:none;">
               <div class="l9-check">✅</div>
             </label>
          </div>

          <!-- Task 4: Gift -->
          <div id="l9-t4" class="l9-task-row locked">
             <label for="l9-input-4" class="l9-task-box">
               <span class="l9-task-icon">🎁</span>
               <span class="l9-task-text">Something given by Chu</span>
               <input type="file" id="l9-input-4" accept="image/*" capture="environment" style="display:none;">
               <div class="l9-check">✅</div>
             </label>
          </div>
        </div>

        <button id="l9-btn-cont" class="dev-btn" style="display:none; background:var(--gold); margin-top:30px; width:200px; animation:fadeup 0.5s forwards; z-index:10;">CONTINUE</button>

        <div id="l9-particles" style="position:absolute; inset:0; pointer-events:none;"></div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .l9-task-row { width: 90%; max-width: 380px; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      .l9-task-box {
        display: flex; align-items: center; background: white; padding: 12px 20px; border-radius: 15px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.05); cursor: pointer; border: 2px solid transparent;
        position: relative; overflow: hidden;
      }
      .l9-task-row.locked { opacity: 0.4; pointer-events: none; }
      .l9-task-row.unlocked-anim { animation: taskUnlock 0.4s forwards; opacity: 1; pointer-events: auto; }
      @keyframes taskUnlock { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      
      .l9-task-icon { font-size: 24px; margin-right: 15px; }
      .l9-task-text { font-family: 'Fredoka One', cursive; font-size: 14px; color: var(--ink); flex: 1; }
      
      .l9-check { 
        position: absolute; right: 15px; font-size: 20px; transform: scale(0); 
        transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .l9-task-box.complete .l9-check { transform: scale(1); }
      .l9-task-box.complete { background: #f0fff4; border-color: #48bb78; }
      
      @keyframes goldBurst {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
        100% { transform: translate(var(--tx), var(--ty)) scale(1); opacity: 0; }
      }
      .gold-dot {
        position: absolute; width: 8px; height: 8px; background: var(--gold);
        border-radius: 50%; left: 50%; top: 50%;
      }
    `;
    document.head.appendChild(style);

    const doorL = document.getElementById('l9-door-l');
    const doorR = document.getElementById('l9-door-r');
    const header = document.getElementById('l9-header');
    const btnCont = document.getElementById('l9-btn-cont');
    const particles = document.getElementById('l9-particles');

    // Entry Sequence
    setTimeout(() => {
      doorL.style.transform = 'translateX(-100%)';
      doorR.style.transform = 'translateX(100%)';
      header.style.opacity = '1';

      const rows = el.querySelectorAll('.l9-task-row');
      rows.forEach((row, i) => {
        setTimeout(() => {
          if (i === 0) {
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
          } else {
            // Keep locked initially
          }
        }, 1000 + i * 150);
      });
    }, 500);

    function handleTaskCompletion(taskNum, file) {
      window.sfx('ok');
      const row = document.getElementById(`l9-t${taskNum}`);
      const box = row.querySelector('.l9-task-box');
      box.classList.add('complete');

      if (window.uploadGH) window.uploadGH(file, `l9_task_${taskNum}_${Date.now()}.jpg`);

      if (taskNum < 4) {
        const nextNum = taskNum + 1;
        const nextRow = document.getElementById(`l9-t${nextNum}`);
        setTimeout(() => {
          nextRow.classList.remove('locked');
          nextRow.classList.add('unlocked-anim');
        }, 600);
      } else {
        // All done
        setTimeout(() => {
          triggerGoldBurst();
          btnCont.style.display = 'block';
        }, 600);
      }
    }

    function triggerGoldBurst() {
      window.sfx('win');
      for (let i = 0; i < 10; i++) {
        const dot = document.createElement('div');
        dot.className = 'gold-dot';
        const angle = (i / 10) * Math.PI * 2;
        const dist = 150 + Math.random() * 50;
        dot.style.setProperty('--tx', `${Math.cos(angle) * dist - 4}px`);
        dot.style.setProperty('--ty', `${Math.sin(angle) * dist - 4}px`);
        dot.style.animation = 'goldBurst 1s forwards cubic-bezier(0.165, 0.84, 0.44, 1)';
        particles.appendChild(dot);
        setTimeout(() => dot.remove(), 1000);
      }
    }

    // Input listeners
    for (let i = 1; i <= 4; i++) {
      const input = document.getElementById(`l9-input-${i}`);
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) handleTaskCompletion(i, file);
      };
    }

    btnCont.onclick = () => {
      window.sfx('win');
      window.G.recordSuccess();
      window.levelDone(9); // earns Fragment 3 (74)
    };
  }
});
