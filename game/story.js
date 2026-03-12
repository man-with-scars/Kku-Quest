// game/story.js
// Exposes: window.Story = { init }
// Responsibility: Multi-panel interactive intro story with unique animations per stage.

window.Story = (function () {
  'use strict';

  let container = null;
  let current = 0;

  const panels = [
    { text: "In a world of glowing screens, two souls found a connection that felt like home.", video: "../landing/story-videos/01.mp4" },
    { text: "Kku built digital wonders, while Chu architected the foundations of their shared dreams.", video: "../landing/story-videos/02.mp4" },
    { text: "But suddenly, a glitch in the server garden separated them. The signals went quiet.", video: "../landing/story-videos/03.mp4" },
    { text: "Kku waited through cycles of the moon, counting every second. She wouldn't give up.", video: "../landing/story-videos/04.mp4" },
    { text: "Every memory of their laughter became a beacon in the digital dark.", video: "../landing/story-videos/05.mp4" },
    { text: "Through firewalls of doubt and storms of static, she searched for his light.", video: "../landing/story-videos/06.mp4" },
    { text: "A hidden message appeared, a trail of stardust leading to a forgotten realm.", video: "../landing/story-videos/07.mp4" },
    { text: "The path is long and full of puzzles, but love leads Kku to the quest of a lifetime!", video: "../landing/story-videos/08.mp4" }
  ];

  let bgMusic = null;
  let preloaderVideo = null; // Next video preloader

  function createStyle() {
    const css = `
      #v-story {
        transition: background 1s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: #000;
      }
      .panel-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        max-width: 600px;
        padding: 40px;
        position: relative;
        z-index: 10;
      }
      .panel-enter {
        animation: panelEnter 600ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
      .panel-exit {
        animation: panelExit 400ms ease-in forwards;
      }
      @keyframes panelEnter {
        from { opacity: 0; transform: translateY(30px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1.0); }
      }
      @keyframes panelExit {
        to { opacity: 0; transform: translateY(-15px) scale(1.05); }
      }
      .sparkle-p {
        position: absolute;
        pointer-events: none;
        animation: sparkle 1s forwards;
      }
      .story-nav {
        margin-top: 40px;
        display: flex;
        gap: 20px;
      }
      .story-btn {
        padding: 12px 30px;
        border-radius: 25px;
        border: none;
        font-family: 'Fredoka', cursive;
        font-size: 16px;
        cursor: pointer;
        transition: transform 0.2s, background 0.2s, opacity 0.2s;
      }
      .story-btn:hover { transform: scale(1.05); }
      .btn-back { background: rgba(255,255,255,0.2); color: white; }
      .btn-next { background: var(--gold); color: white; }
      .btn-begin { 
        background: var(--grass); color: white; border: 2px solid #fff; 
        font-size: 20px; padding: 15px 45px;
        animation: pulse 1.5s infinite;
      }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function preloadNext() {
    const nextIdx = current + 1;
    if (nextIdx < panels.length) {
      if (!preloaderVideo) {
        preloaderVideo = document.createElement('video');
        preloaderVideo.style.display = 'none';
        document.body.appendChild(preloaderVideo);
      }
      preloaderVideo.src = panels[nextIdx].video;
      preloaderVideo.load();
      console.log("Preloading next video:", panels[nextIdx].video);
    }
  }

  function render() {
    const p = panels[current];
    container.style.background = '#000'; // Dark cinematic background

    // Create panel content
    const wrap = document.createElement('div');
    wrap.className = 'panel-wrap panel-enter';
    wrap.innerHTML = `
      <div class="story-stage" style="width:100%; max-width:640px; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; border-radius:20px; overflow:hidden; border:4px solid rgba(255,255,255,0.1); box-shadow:0 20px 50px rgba(0,0,0,0.5); background:#000; position:relative;">
        <video id="story-video" src="${p.video}" autoplay muted playsinline style="width:100%; height:100%; object-fit:cover; display:block;"></video>
      </div>
      <div style="font-family:'Fredoka', cursive; font-size:28px; color:#fff; margin-top:35px; min-height:90px; text-shadow:0 2px 10px rgba(0,0,0,0.3);">
        ${p.text}
      </div>
      <div class="story-nav">
        ${current > 0 ? '<button class="story-btn btn-back">← BACK</button>' : ''}
        ${current < panels.length - 1
        ? '<button class="story-btn btn-next">NEXT →</button>'
        : '<button class="story-btn btn-begin">BEGIN QUEST! 💕</button>'}
      </div>
    `;

    // Video Auto-advance logic
    const video = wrap.querySelector('#story-video');
    let autoTimer = null;

    if (video) {
      video.onerror = () => {
        console.error("Video failed to load, falling back to static presentation.");
      };

      video.onplay = () => {
        console.log("Current video playing:", current);
        preloadNext();
      };

      video.onended = () => {
        console.log("Video ended, auto-advancing in 3s...");
        if (current < panels.length - 1) {
          autoTimer = setTimeout(() => {
            transition(1);
          }, 3000);
        }
      };

      // Ensure it plays
      video.play().catch(e => console.warn("Auto-play blocked, waiting for user."));
    }

    // Handle button clicks
    const btnNext = wrap.querySelector('.btn-next');
    const btnBack = wrap.querySelector('.btn-back');
    const btnBegin = wrap.querySelector('.btn-begin');

    if (btnNext) btnNext.onclick = () => {
      if (autoTimer) clearTimeout(autoTimer);
      transition(1);
    };
    if (btnBack) btnBack.onclick = () => {
      if (autoTimer) clearTimeout(autoTimer);
      transition(-1);
    };
    if (btnBegin) btnBegin.onclick = () => {
      if (autoTimer) clearTimeout(autoTimer);
      window.STATE.storyDone = true;
      if (bgMusic) {
        bgMusic.pause();
        bgMusic = null;
      }
      if (window.GameNotifications && window.GameNotifications.requestPermission) {
        window.GameNotifications.requestPermission();
      }
      window.G.go('v-map');
      if (window.Map && window.Map.init) window.Map.init(document.getElementById('v-map'));
    };

    // Replace container content with transition animation
    const oldWrap = container.querySelector('.panel-wrap');
    if (oldWrap) {
      oldWrap.classList.remove('panel-enter');
      oldWrap.classList.add('panel-exit');
      setTimeout(() => {
        container.innerHTML = '';
        container.appendChild(wrap);
        if (current === panels.length - 1) spawnSparkles();
      }, 400);
    } else {
      container.innerHTML = '';
      container.appendChild(wrap);
      if (current === panels.length - 1) spawnSparkles();
    }
  }

  function transition(dir) {
    current += dir;
    render();
  }

  function spawnSparkles() {
    const stage = container.querySelector('.story-stage');
    if (!stage) return;
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const s = document.createElement('div');
        s.className = 'sparkle-p';
        s.textContent = '✨';
        s.style.left = (Math.random() * 200 - 100) + 'px';
        s.style.top = (Math.random() * 200 - 100) + 'px';
        s.style.fontSize = (Math.random() * 20 + 10) + 'px';
        stage.appendChild(s);
        setTimeout(() => s.remove(), 1000);
      }, i * 50);
    }
  }

  function init(target) {
    if (!container) createStyle();
    container = target;
    current = 0;

    // Start Background Music
    if (!bgMusic) {
      bgMusic = new Audio('../landing/music.mp3');
      bgMusic.loop = true;
      bgMusic.volume = 0.5;
      bgMusic.play().catch(e => console.log("Music play blocked by browser."));
    }

    render();
  }

  return { init: init };
}());
