// game/levels/level-05.js
// Exposes: window.LEVEL_REGISTRY push for Level 5
// Type: Collect (Fragment 46)

window.LEVEL_REGISTRY = window.LEVEL_REGISTRY || [];
window.LEVEL_REGISTRY.push({
  id: 5,
  view: 'v-L5',
  icon: '💎',
  title: 'Vault of Proof',
  type: 'collect',
  hint: '',

  build(el) {
    let mediaRecorder;
    let audioChunks = [];
    let isTask1Done = false;
    let isTask2Done = false;

    el.innerHTML = `
      <div id="l5-stage" style="width:100%; height:100%; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255,250,255,0.2);">
        
        <!-- Fairy Dialogue -->
        <div id="l5-fairy" style="font-family:'Lora', serif; font-style:italic; font-size:18px; color:var(--purple); text-align:center; margin-bottom:20px; background: rgba(255,255,255,0.7); padding: 10px 20px; border-radius: 20px; backdrop-filter: blur(5px); box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          "Two sacred things, Kku.<br>Something you wear — and a voice only he'd recognise."
        </div>

        <div id="l5-tasks-container" style="display:flex; width:200%; transition: transform 0.8s cubic-bezier(0.77, 0, 0.175, 1); margin: 20px auto;">
          <!-- G.recordSuccess: Riverside repositioning button -->
          <!-- TASK 1: Earrings -->
          <div id="l5-task1" style="width:50%; display:flex; flex-direction:column; align-items:center;">
             <div class="l5-task-card">
                <p style="margin-bottom:15px; color:var(--purple); font-weight:bold;">TASK 1: The Sacred Earrings</p>
                <label for="l5-cam-input" class="l5-upload-zone">
                  <span style="font-size:40px;">👂✨</span>
                  <span style="font-size:12px; margin-top:10px;">Snap a photo of your earrings</span>
                  <input type="file" id="l5-cam-input" accept="image/*" capture="environment" style="display:none;">
                </label>
                <div id="l5-cam-preview-wrap" style="display:none; margin-top:15px;">
                   <div id="l5-cam-preview" class="l5-circular-preview"></div>
                </div>
             </div>
          </div>

          <!-- TASK 2: Voice Note -->
          <div id="l5-task2" style="width:50%; display:flex; flex-direction:column; align-items:center; opacity:0.4; pointer-events:none;">
             <div class="l5-task-card">
                <p style="margin-bottom:15px; color:var(--purple); font-weight:bold;">TASK 2: The Ethereal Voice</p>
                <div id="l5-mic-btn" style="width:80px; height:80px; border-radius:50%; background:var(--purple); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:32px; color:white; transition: 0.2s;">🎤</div>
                <div id="l5-waveform" style="display:none; gap:4px; height:40px; margin-top:10px; align-items:center;">
                  ${Array.from({ length: 12 }).map(() => `<div class="wave-bar"></div>`).join('')}
                </div>
                <div id="l5-audio-wrap" style="display:none; margin-top:15px;">
                  <audio id="l5-audio-player" controls style="width:200px; height:35px;"></audio>
                </div>
             </div>
          </div>
        </div>

        <button id="l5-btn-cont" class="dev-btn" style="display:none; background:var(--gold); margin-top:30px; width:200px; animation:fadeup 0.5s forwards;">OPEN VAULT</button>
        
        <div id="l5-sparkles" style="position:absolute; inset:0; pointer-events:none;"></div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .l5-task-card {
        background: var(--parchment);
        padding: 30px;
        border-radius: 25px;
        box-shadow: 0 5px 25px rgba(0,0,0,0.08);
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 320px;
        text-align: center;
      }
      .l5-upload-zone {
        width: 140px; height: 140px; border: 3px dashed var(--purple); border-radius: 20px;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        cursor: pointer; color: var(--purple); background: rgba(255,255,255,0.5);
      }
      .l5-circular-preview {
        width: 120px; height: 120px; border-radius: 50%; border: 4px solid white;
        background-size: cover; background-position: center; box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
      .mic-recording { animation: micPulse 1s infinite alternate; scale: 1.1; background: var(--rose) !important; }
      @keyframes micPulse { from { box-shadow: 0 0 0px var(--rose); } to { box-shadow: 0 0 20px var(--rose); } }
      .wave-bar { width: 3px; height: 10px; background: var(--purple); border-radius: 2px; }
      .wave-anim .wave-bar { animation: waveAnim 1s infinite alternate; }
      @keyframes waveAnim { from { height: 10px; } to { height: 35px; } }
      ${Array.from({ length: 12 }).map((_, i) => `.wave-bar:nth-child(${i + 1}) { animation-delay: ${i * 0.1}s; }`).join('')}
      .sparkle-p {
        position: absolute; width: 10px; height: 10px; background: var(--gold);
        clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        animation: sparkleMove 2s linear forwards;
      }
      @keyframes sparkleMove { to { transform: translate(var(--sx), var(--sy)) scale(0); opacity: 0; } }
    `;
    document.head.appendChild(style);

    const sparkles = document.getElementById('l5-sparkles');
    const tasksCont = document.getElementById('l5-tasks-container');
    const task2 = document.getElementById('l5-task2');
    const mic = document.getElementById('l5-mic-btn');
    const waveform = document.getElementById('l5-waveform');
    const audioWrap = document.getElementById('l5-audio-wrap');
    const player = document.getElementById('l5-audio-player');
    const btnCont = document.getElementById('l5-btn-cont');

    function createSparkle() {
      const p = document.createElement('div');
      p.className = 'sparkle-p';
      p.style.left = '50%';
      p.style.top = '50%';
      p.style.setProperty('--sx', `${(Math.random() - 0.5) * 500}px`);
      p.style.setProperty('--sy', `${(Math.random() - 0.5) * 500}px`);
      sparkles.appendChild(p);
      setTimeout(() => p.remove(), 2000);
    }

    // Enter Sparkles
    for (let i = 0; i < 15; i++) setTimeout(createSparkle, i * 50);

    // TASK 1 logic
    const camInput = document.getElementById('l5-cam-input');
    camInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      window.sfx('click');
      const reader = new FileReader();
      reader.onload = (re) => {
        document.querySelector('.l5-upload-zone').style.display = 'none';
        const previewWrap = document.getElementById('l5-cam-preview-wrap');
        previewWrap.style.display = 'block';
        document.getElementById('l5-cam-preview').style.backgroundImage = `url(${re.target.result})`;

        isTask1Done = true;
        window.sfx('win');
        window.G.recordSuccess();
        // Slide to Task 2
        setTimeout(() => {
          tasksCont.style.transform = 'translateX(-50%)';
          task2.style.opacity = '1';
          task2.style.pointerEvents = 'auto';
        }, 1000);

        if (window.uploadGH) window.uploadGH(file, `earrings_${Date.now()}.jpg`);
      };
      reader.readAsDataURL(file);
    };

    // TASK 2 logic (Mic)
    async function startRec() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunks, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          player.src = url;
          audioWrap.style.display = 'block';
          isTask2Done = true;
          btnCont.style.display = 'block';
          if (window.uploadGH) window.uploadGH(blob, `voice_note_${Date.now()}.webm`);
          stream.getTracks().forEach(t => t.stop());
        };
        mediaRecorder.start();
        mic.classList.add('mic-recording');
        waveform.style.display = 'flex';
        waveform.classList.add('wave-anim');
        window.sfx('click');
      } catch (err) { console.error('Mic failed:', err); }
    }

    function stopRec() {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        mic.classList.remove('mic-recording');
        waveform.classList.remove('wave-anim');
        window.sfx('click');
      }
    }

    mic.onmousedown = mic.ontouchstart = (e) => { e.preventDefault(); startRec(); };
    mic.onmouseup = mic.onmouseleave = mic.ontouchend = (e) => { e.preventDefault(); stopRec(); };

    btnCont.onclick = () => {
      window.sfx('win');
      window.G.recordSuccess();
      window.levelDone(5); // earns Fragment 1 (46)
    };
  }
});
