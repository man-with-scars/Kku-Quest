// game/levels/level-10b.js
// Exposes: window.LEVEL_REGISTRY push for Level 10b
// Type: Collect (Fragment 13)

window.LEVEL_REGISTRY = window.LEVEL_REGISTRY || [];
window.LEVEL_REGISTRY.push({
  id: '10b',
  view: 'v-L10b',
  title: 'The Singing Door',
  type: 'collect',
  hint: '',

  build(el) {
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    el.innerHTML = `
      <div id="l10b-stage" style="width:100%; height:100%; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255, 255, 240, 0.4);">
        
        <!-- Fairy Dialogue -->
        <div id="l10b-fairy" style="max-width:400px; text-align:center; margin-bottom:20px; z-index:10; background: rgba(255,255,255,0.7); padding: 10px 20px; border-radius: 20px; backdrop-filter: blur(5px); box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <p style="font-family:'Lora', serif; font-style:italic; font-size:18px; color:var(--purple); line-height:1.5;">
            "I only open for those who know his song.<br>
            Sing 2 lines of Vaa Senthaazhini.<br>
            Hold the button — let me hear your voice. 🎵"
          </p>
        </div>

        <div id="l10b-container" style="position:relative; width:100%; display:flex; flex-direction:column; align-items:center; z-index:10;">
          
          <!-- Animated Door -->
          <div id="l10b-door-wrap" style="position:relative; width:120px; height:180px; margin-bottom:30px;">
            <div id="l10b-door" class="l10b-door-closed">
              <div style="position:absolute; right:15px; top:50%; width:12px; height:12px; background:#B45309; border-radius:50%; box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>
            </div>
            <div id="l10b-door-light" style="position:absolute; inset:0; background:linear-gradient(to right, transparent, rgba(255,255,255,0.8), transparent); opacity:0; pointer-events:none;"></div>
          </div>

          <!-- Mic Section -->
          <div id="l10b-mic-wrap" style="display:flex; flex-direction:column; align-items:center;">
            <div id="l10b-mic-btn" style="width:100px; height:100px; border-radius:50%; background:var(--parchment); border:3px solid var(--purple); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:40px; box-shadow:0 5px 15px rgba(0,0,0,0.1); transition: 0.2s;">🎤</div>
            <div id="l10b-notes-emitter" style="position:relative; width:100px; height:0;"></div>
            <div id="l10b-audio-preview" style="display:none; margin-top:15px; text-align:center;">
              <audio id="l10b-player" controls style="width:200px; height:35px;"></audio>
              <button id="l10b-mic-clear" style="display:block; margin:10px auto 0; padding:5px 15px; border-radius:15px; background:var(--rose); color:white; border:none; cursor:pointer; font-family:'Fredoka',cursive;">Retake Voice</button>
            </div>
          </div>

          <!-- Bonus Video Task -->
          <div id="l10b-bonus" style="margin-top:25px; text-align:center;">
             <p style="font-size:12px; color:var(--purple); margin-bottom:8px;">Bonus: Record a short video for Chu 🎬</p>
             <label id="l10b-video-label" for="l10b-video-input" class="dev-btn" style="background:#fff; border:1px solid #ddd; color:#666; font-size:12px; padding:5px 15px; cursor:pointer;">CHOOSE VIDEO</label>
             <input type="file" id="l10b-video-input" accept="video/*" style="display:none;">
             <div id="l10b-vid-preview" style="display:none; margin-top:10px; font-size:12px; color:var(--grass); font-weight:bold;">Video Selected! ✅<br><button id="l10b-vid-clear" style="margin-top:5px; padding:5px 15px; border-radius:15px; background:var(--rose); color:white; border:none; cursor:pointer; font-family:'Fredoka',cursive;">Clear Selection</button></div>
          </div>

        </div>

        <button id="l10b-btn-cont" class="dev-btn" style="display:none; background:var(--gold); margin-top:30px; width:200px; animation:fadeup 0.5s forwards; z-index:10;">CONTINUE</button>
        
        <div id="l10b-particles" style="position:absolute; inset:0; pointer-events:none;"></div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .l10b-door-closed {
        width: 100%; height: 100%; background: linear-gradient(135deg, #78350F, #B45309);
        border-radius: 60px 60px 5px 5px; border: 4px solid #451A03; 
        box-shadow: 0 0 15px rgba(217, 119, 6, 0.4); transition: transform 0.8s ease-in-out;
        transform-origin: left; z-index: 5;
      }
      .l10b-door-open { transform: perspective(800px) rotateY(-110deg); }
      .l10b-glowing { animation: doorGlow 1.5s infinite alternate; }
      @keyframes doorGlow {
        from { box-shadow: 0 0 10px rgba(217, 119, 6, 0.4); }
        to { box-shadow: 0 0 25px rgba(217, 119, 6, 0.8); }
      }
      #l10b-door-light { transition: opacity 0.5s; }
      .light-beam { opacity: 0.6 !important; }

      .l10b-note {
        position: absolute; font-size: 20px; color: var(--purple);
        animation: noteFloatUp 2s forwards linear; pointer-events: none;
      }
      @keyframes noteFloatUp {
        0% { transform: translate(0, 0) scale(0.5); opacity: 1; }
        100% { transform: translate(var(--nx), -100px) rotate(45deg) scale(1.5); opacity: 0; }
      }
      .heart-burst {
        position: absolute; font-size: 20px; left: 50%; top: 40%;
        animation: heartExplode 1s forwards ease-out;
      }
      @keyframes heartExplode {
        to { transform: translate(var(--hx), var(--hy)) scale(0); opacity: 0; }
      }
      @keyframes fadeup { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);

    const door = document.getElementById('l10b-door');
    const doorLight = document.getElementById('l10b-door-light');
    const mic = document.getElementById('l10b-mic-btn');
    const notesEmitter = document.getElementById('l10b-notes-emitter');
    const audioPreview = document.getElementById('l10b-audio-preview');
    const player = document.getElementById('l10b-player');
    const btnCont = document.getElementById('l10b-btn-cont');
    const videoInput = document.getElementById('l10b-video-input');
    const particles = document.getElementById('l10b-particles');

    // Initial state: door glowing
    door.classList.add('l10b-glowing');

    // Idle musical notes
    const idleNoteInterval = setInterval(() => {
      if (!isRecording) createNote();
    }, 1500);

    function createNote() {
      const n = document.createElement('div');
      n.className = 'l10b-note';
      n.innerHTML = ['🎵', '🎶', '🎼'][Math.floor(Math.random() * 3)];
      n.style.left = '50%';
      n.style.setProperty('--nx', (Math.random() * 60 - 30) + 'px');
      notesEmitter.appendChild(n);
      setTimeout(() => n.remove(), 2000);
    }

    // Recording Logic
    let isRecordingSession = false;

    async function toggleRec() {
      if (isRecordingSession) {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          isRecordingSession = false;
          mic.style.transform = 'scale(1)';
          mic.style.boxShadow = '';
          clearInterval(this.noteTimer);
          window.sfx('click');
        }
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunks, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          player.src = url;
          audioPreview.style.display = 'block';
          mic.style.display = 'none';

          document.getElementById('l10b-mic-clear').onclick = () => {
            window.showConfirmDialog("Retaking the recording will delete your current submission.", () => {
              audioPreview.style.display = 'none';
              mic.style.display = 'flex';
              audioChunks = [];
            });
          };

          // Open door
          door.classList.remove('l10b-glowing');
          door.classList.add('l10b-door-open');
          doorLight.classList.add('light-beam');

          btnCont.style.display = 'block';
          burstHearts();

          if (window.uploadGH) window.uploadGH(blob, `singing_${Date.now()}.webm`);
          stream.getTracks().forEach(t => t.stop());
        };
        mediaRecorder.start();
        isRecordingSession = true;
        mic.style.transform = 'scale(1.2)';
        mic.style.boxShadow = '0 0 20px var(--purple)';

        // Fast notes while recording
        this.noteTimer = setInterval(createNote, 400);
        window.sfx('click');
      } catch (err) { console.error('Rec failed:', err); }
    }

    mic.onclick = (e) => { e.preventDefault(); toggleRec(); };

    // Bonus Logic
    videoInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file && window.uploadGH) {
        window.sfx('click');
        document.getElementById('l10b-video-label').style.display = 'none';
        const vp = document.getElementById('l10b-vid-preview');
        vp.style.display = 'block';

        document.getElementById('l10b-vid-clear').onclick = () => {
          window.showConfirmDialog("Clearing the video will delete your current submission.", () => {
            videoInput.value = '';
            vp.style.display = 'none';
            document.getElementById('l10b-video-label').style.display = 'inline-block';
          });
        };

        window.uploadGH(file, `video_for_chu_${Date.now()}.webm`);
      }
    };

    function burstHearts() {
      window.sfx('win');
      for (let i = 0; i < 15; i++) {
        const h = document.createElement('div');
        h.className = 'heart-burst';
        h.innerHTML = '💕';
        h.style.setProperty('--hx', `${(Math.random() - 0.5) * 400}px`);
        h.style.setProperty('--hy', `${(Math.random() - 0.5) * 400}px`);
        particles.appendChild(h);
        setTimeout(() => h.remove(), 1000);
      }
    }

    btnCont.onclick = () => {
      window.sfx('up');
      clearInterval(idleNoteInterval);
      window.levelDone('10b'); // earns Fragment 4 (13)
    };
  }
});
