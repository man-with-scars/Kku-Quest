// game/levels/level-07.js
// Exposes: window.LEVEL_REGISTRY push for Level 7
// Type: Collect (Fragment 90)

window.LEVEL_REGISTRY = window.LEVEL_REGISTRY || [];
window.LEVEL_REGISTRY.push({
  id: 7,
  view: 'v-L7',
  icon: '💬',
  title: 'Time Capsule',
  hint: '',

  build(el) {
    let isTask1Done = false;
    let isTask2Done = false;

    el.innerHTML = `
      <div id="l7-stage" style="width:100%; height:100%; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255, 245, 245, 0.3);">
        
        <!-- Entry Animation: Floating Bubble -->
        <div id="l7-bubble" style="position:absolute; bottom:-100px; font-size:60px; transition: all 2s cubic-bezier(0.165, 0.84, 0.44, 1); pointer-events:none;">💬</div>

        <!-- Fairy Dialogue -->
        <div id="l7-fairy" style="opacity:0; transition:opacity 1s; max-width:400px; text-align:center; margin-bottom:20px; z-index:10; background: rgba(255,255,255,0.7); padding: 10px 20px; border-radius: 20px; backdrop-filter: blur(5px); box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <p style="font-family:'Lora', serif; font-style:italic; font-size:18px; color:var(--purple); line-height:1.5;">
            "Show me proof that this love has layers."
          </p>
        </div>

        <div id="l7-tasks-container" style="display:flex; width:200%; transition: transform 0.8s cubic-bezier(0.77, 0, 0.175, 1); margin: 20px auto;">
          
          <!-- TASK 1: Chat Screenshot -->
          <div id="l7-task1" style="width:50%; display:flex; flex-direction:column; align-items:center; opacity:0; transform:translateY(20px);">
             <div class="l7-task-card">
                <p style="margin-bottom:15px; color:var(--purple); font-weight:bold;">TASK 1: Shared Whispers</p>
                <label for="l7-chat-input" class="l7-upload-zone" id="l7-zone1">
                  <span style="font-size:40px;">💬📱</span>
                  <span style="font-size:12px; margin-top:10px;">Upload a Chat Screenshot</span>
                  <input type="file" id="l7-chat-input" accept="image/*" style="display:none;">
                </label>
                <div id="l7-p1-preview-wrap" style="display:none; margin-top:10px; text-align:center;">
                   <div class="polaroid-frame" style="margin:0 auto;">
                      <div id="l7-p1-preview" class="preview-img"></div>
                   </div>
                   <button id="l7-p1-clear" style="margin-top:10px; padding:5px 15px; border-radius:15px; background:var(--rose); color:white; border:none; cursor:pointer; font-family:'Fredoka',cursive;">Clear / Retake</button>
                </div>
             </div>
          </div>

          <!-- TASK 2: Selfie -->
          <div id="l7-task2" style="width:50%; display:flex; flex-direction:column; align-items:center; opacity:0; transform:translateY(20px);">
             <div class="l7-task-card">
                <p style="margin-bottom:15px; color:var(--purple); font-weight:bold;">TASK 2: Present Happiness</p>
                <label for="l7-selfie-input" class="l7-upload-zone" id="l7-zone2" style="border-color:var(--rose); color:var(--rose);">
                  <span style="font-size:40px;">🤳💕</span>
                  <span style="font-size:12px; margin-top:10px;">Take a shared selfie</span>
                  <input type="file" id="l7-selfie-input" accept="image/*" capture="user" style="display:none;">
                </label>
                <div id="l7-p2-preview-wrap" style="display:none; margin-top:10px; text-align:center;">
                   <div class="heart-frame" style="margin:0 auto;">
                      <div id="l7-p2-preview" class="preview-img"></div>
                   </div>
                   <button id="l7-p2-clear" style="margin-top:10px; padding:5px 15px; border-radius:15px; background:var(--rose); color:white; border:none; cursor:pointer; font-family:'Fredoka',cursive;">Clear / Retake</button>
                </div>
             </div>
          </div>
        </div>

        <button id="l7-btn-cont" class="dev-btn" style="display:none; background:var(--gold); margin-top:30px; width:200px; animation:fadeup 0.5s forwards;">SAVE CAPSULE</button>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .l7-task-card {
        background: var(--parchment); padding: 30px; border-radius: 25px;
        box-shadow: 0 5px 25px rgba(0,0,0,0.08); display: flex; flex-direction: column;
        align-items: center; width: 320px; text-align: center; margin: 0 auto;
      }
      .l7-upload-zone {
        width: 140px; height: 140px; border: 3px dashed var(--purple); border-radius: 20px;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        cursor: pointer; color: var(--purple); background: rgba(255,255,255,0.5); transition: 0.3s;
      }
      .l7-upload-zone:hover { background: white; transform: scale(1.02); }
      
      .preview-img { width: 100%; height: 100%; background-size: cover; background-position: center; }
      
      .polaroid-frame {
        width: 130px; height: 160px; background: white; padding: 10px 10px 30px 10px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.15); border: 1px solid #eee;
        animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
      
      .heart-frame {
        width: 140px; height: 140px; background: white; padding: 5px;
        clip-path: path('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
        /* clip-path fallback for complex shapes can be tricky, using a simpler border-radius heart hack */
        border-radius: 50% 50% 0 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center;
        width: 120px; height: 120px; background: var(--rose);
        animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
      .heart-frame .preview-img { transform: rotate(45deg) scale(1.4); border-radius: 50%; width: 90px; height: 90px; }

      @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      @keyframes fadeup { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes bubblePop {
        0% { transform: translateY(0) scale(1); opacity: 1; }
        90% { transform: translateY(-300px) scale(1.2); opacity: 1; }
        100% { transform: translateY(-310px) scale(0); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    const bubble = document.getElementById('l7-bubble');
    const fairy = document.getElementById('l7-fairy');
    const tasksCont = document.getElementById('l7-tasks-container');
    const task1 = document.getElementById('l7-task1');
    const task2 = document.getElementById('l7-task2');
    const btnCont = document.getElementById('l7-btn-cont');

    const input1 = document.getElementById('l7-chat-input');
    const input2 = document.getElementById('l7-selfie-input');

    // Entry Sequence
    setTimeout(() => {
      bubble.style.animation = 'bubblePop 2s forwards';
      setTimeout(() => {
        fairy.style.opacity = '1';
        setTimeout(() => {
          task1.style.opacity = '1';
          task1.style.transform = 'translateY(0)';
          task1.style.transition = 'all 0.6s';
          setTimeout(() => {
            task2.style.opacity = '0.4'; // Visual hint it's locked
            task2.style.transform = 'translateY(0)';
            task2.style.transition = 'all 0.6s';
          }, 150);
        }, 500);
      }, 1500);
    }, 300);

    // TASK 1 logic
    input1.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      window.sfx('click');
      const reader = new FileReader();
      reader.onload = (re) => {
        document.getElementById('l7-zone1').style.display = 'none';
        const wrap = document.getElementById('l7-p1-preview-wrap');
        wrap.style.display = 'block';
        document.getElementById('l7-p1-preview').style.backgroundImage = `url(${re.target.result})`;

        document.getElementById('l7-p1-clear').onclick = () => {
          input1.value = '';
          wrap.style.display = 'none';
          document.getElementById('l7-zone1').style.display = 'flex';
          isTask1Done = false;
        };

        isTask1Done = true;
        // Slide to Task 2
        setTimeout(() => {
          tasksCont.style.transform = 'translateX(-50%)';
          task2.style.opacity = '1';
          task2.style.pointerEvents = 'auto';
        }, 1000);

        if (window.uploadGH) window.uploadGH(file, `chat_shot_${Date.now()}.jpg`);
      };
      reader.readAsDataURL(file);
    };

    // TASK 2 logic
    input2.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      window.sfx('click');
      const reader = new FileReader();
      reader.onload = (re) => {
        document.getElementById('l7-zone2').style.display = 'none';
        const wrap = document.getElementById('l7-p2-preview-wrap');
        wrap.style.display = 'block';
        document.getElementById('l7-p2-preview').style.backgroundImage = `url(${re.target.result})`;

        document.getElementById('l7-p2-clear').onclick = () => {
          input2.value = '';
          wrap.style.display = 'none';
          document.getElementById('l7-zone2').style.display = 'flex';
          isTask2Done = false;
          btnCont.style.display = 'none';
        };

        isTask2Done = true;
        btnCont.style.display = 'block';
        if (window.uploadGH) window.uploadGH(file, `selfie_${Date.now()}.jpg`);
      };
      reader.readAsDataURL(file);
    };

    btnCont.onclick = () => {
      window.sfx('win');
      window.levelDone(7); // earns Fragment 2 (90)
    };
  }
});
