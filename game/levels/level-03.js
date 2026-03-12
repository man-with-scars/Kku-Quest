// game/levels/level-03.js
// Exposes: window.LEVEL_REGISTRY push for Level 3
// Type: Collect (Fragment 98)

window.LEVEL_REGISTRY = window.LEVEL_REGISTRY || [];
window.LEVEL_REGISTRY.push({
  id: 3,
  view: 'v-L3',
  icon: '📸',
  title: 'Memory Vault',
  type: 'collect',
  hint: '',

  build(el) {
    el.innerHTML = `
      <div id="l3-stage" style="width:100%; height:100%; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center;">
        
        <!-- Flash Overlay -->
        <div id="l3-flash" style="position:absolute; top:0; left:0; width:100%; height:100%; background:white; opacity:0; pointer-events:none; z-index:100;"></div>

        <!-- Fairy Dialogue -->
        <div id="l3-dialogue" style="opacity:0; transition:opacity 1s; max-width:400px; text-align:center; margin-bottom:30px; z-index:10; background: rgba(255,255,255,0.7); padding: 10px 20px; border-radius: 20px; backdrop-filter: blur(5px); box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
          <p style="font-family:'Lora', serif; font-style:italic; font-size:20px; color:var(--purple); line-height:1.5;">
            "To pass this gate, give me something real — <br>
            a moment frozen in time.<br>
            A photograph of both of you together. 💕"
          </p>
        </div>

        <!-- Upload Zone -->
        <div id="l3-card" class="upload-card" style="opacity:0; transform:translateY(20px);">
          <div id="l3-orbit-container" style="position:relative; width:200px; height:200px; display:flex; align-items:center; justify-content:center;">
            <label for="l3-photo-input" class="upload-zone" id="l3-upload-zone">
              <span style="font-size:50px;">📸</span>
              <span style="font-size:14px; margin-top:10px;">Tap to choose a photo</span>
              <input type="file" id="l3-photo-input" accept="image/*" style="display:none;">
            </label>
            <div id="l3-preview-wrap" style="display:none; position:absolute;">
               <div id="l3-preview" style="width:120px; height:120px; border-radius:50%; border:5px solid white; background-size:cover; background-position:center; box-shadow:0 5px 15px rgba(0,0,0,0.2);"></div>
            </div>
            <div id="l3-hearts-orbit"></div>
          </div>
        </div>

        <!-- Continue Button -->
        <button id="btn-l3-continue" class="dev-btn" style="display:none; background:var(--gold); margin-top:30px; width:200px; animation:fadeup 0.5s forwards;">CONTINUE</button>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .upload-card {
        background: var(--parchment);
        padding: 40px;
        border-radius: 30px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .upload-zone {
        width: 160px;
        height: 160px;
        border: 3px dashed var(--purple);
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--purple);
        transition: all 0.3s;
        background: rgba(255,255,255,0.5);
      }
      .upload-zone:hover {
        background: white;
        transform: scale(1.02);
      }
      .l3-orbit-heart {
        position: absolute;
        font-size: 14px;
        animation: orbitRotate 4s linear infinite;
      }
      @keyframes orbitRotate {
        from { transform: rotate(0deg) translateX(90px) rotate(0deg); }
        to { transform: rotate(360deg) translateX(90px) rotate(-360deg); }
      }
      @keyframes previewFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      @keyframes popIn {
        0% { transform: scale(0); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes fadeup {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes burst {
        to { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
      }
      .heart-particle {
        position: absolute;
        pointer-events: none;
        z-index: 50;
      }
    `;
    document.head.appendChild(style);

    const flash = document.getElementById('l3-flash');
    const dialogue = document.getElementById('l3-dialogue');
    const card = document.getElementById('l3-card');
    const input = document.getElementById('l3-photo-input');
    const zone = document.getElementById('l3-upload-zone');
    const previewWrap = document.getElementById('l3-preview-wrap');
    const previewEl = document.getElementById('l3-preview');
    const btnCont = document.getElementById('btn-l3-continue');
    const orbitContainer = document.getElementById('l3-hearts-orbit');

    // Helper for flash
    function doFlash(duration = 150) {
      flash.style.opacity = '1';
      setTimeout(() => flash.style.opacity = '0', duration);
    }

    // Helper for heart burst
    function burstHearts() {
      for (let i = 0; i < 10; i++) {
        const h = document.createElement('div');
        h.className = 'heart-particle';
        h.innerHTML = '💕';
        const tx = (Math.random() - 0.5) * 300;
        const ty = (Math.random() - 0.5) * 300;
        h.style.setProperty('--tx', `${tx}px`);
        h.style.setProperty('--ty', `${ty}px`);
        h.style.left = '50%';
        h.style.top = '50%';
        h.style.animation = `burst 1s forwards ease-out`;
        card.appendChild(h);
        setTimeout(() => h.remove(), 1000);
      }
    }

    // Entry Sequence
    setTimeout(() => {
      doFlash(150);
      dialogue.style.opacity = '1';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      card.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

      // Setup orbit hearts
      for (let i = 0; i < 5; i++) {
        const h = document.createElement('div');
        h.className = 'l3-orbit-heart';
        h.innerHTML = '💓';
        h.style.animationDelay = `-${i * 0.8}s`;
        orbitContainer.appendChild(h);
      }
    }, 300);

    // Upload Logic
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      doFlash(200);
      window.sfx('click');

      const reader = new FileReader();
      reader.onload = (re) => {
        zone.style.display = 'none';
        previewWrap.style.display = 'block';
        previewWrap.style.animation = 'popIn 0.5s forwards';
        previewEl.style.backgroundImage = `url(${re.target.result})`;

        // Wait for popIn then float
        setTimeout(() => {
          previewWrap.style.animation = 'previewFloat 3s ease-in-out infinite';
        }, 500);

        btnCont.style.display = 'block';
      };
      reader.readAsDataURL(file);

      // Handle actual upload if window.uploadGH exists
      if (window.uploadGH) {
        try {
          window.uploadGH(file, 'memory_vault_' + Date.now() + '.jpg');
        } catch (err) {
          console.error('L3 upload failed:', err);
        }
      }
    };

    btnCont.onclick = () => {
      window.sfx('win');
      window.G.recordSuccess();
      burstHearts();
      setTimeout(() => {
        window.levelDone(3); // Collects Fragment 0 (98)
      }, 1000);
    };
  }
});
