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
    { text: "The path is long and full of puzzles, but love is the strongest algorithm.", video: "../landing/story-videos/08.mp4" },
    { text: "With a heart full of courage and your help, Kku's Quest finally begins!", video: "../landing/story-videos/09.mp4" }
  ];

  let bgMusic = null;

  function createStyle() {
    const css = `
      #v-story {
        transition: background 1s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .panel-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        max-width: 600px;
        padding: 40px;
        position: relative;
      }
      .panel-enter {
        animation: panelEnter 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
      .panel-exit {
        animation: panelExit 300ms ease-in forwards;
      }
      @keyframes panelEnter {
        from { opacity: 0; transform: translateY(20px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1.0); }
      }
      @keyframes panelExit {
        to { opacity: 0; transform: translateY(-8px); }
      }
      @keyframes dimOut {
        to { opacity: 0.3; filter: grayscale(1); }
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
        transition: transform 0.2s, background 0.2s;
      }
      .story-btn:hover { transform: scale(1.05); }
      .btn-back { background: #eee; color: #777; }
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

  function render() {
    const p = panels[current];
    container.style.background = p.bg;

    // Create panel content
    const wrap = document.createElement('div');
    wrap.className = 'panel-wrap panel-enter';
    wrap.innerHTML = `
      <div class="story-stage" style="width:100%; max-width:500px; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; border-radius:15px; overflow:hidden; border:4px solid white; box-shadow:0 10px 30px rgba(0,0,0,0.1); background:#000;">
        <video src="${p.video}" autoplay muted loop style="width:100%; height:100%; object-fit:cover;"></video>
      </div>
      <div style="font-family:'Fredoka', cursive; font-size:26px; color:var(--ink); margin-top:30px; min-height:80px;">
        ${p.text}
      </div>
      <div class="story-nav">
        ${current > 0 ? '<button class="story-btn btn-back">← BACK</button>' : ''}
        ${current < panels.length - 1
        ? '<button class="story-btn btn-next">NEXT →</button>'
        : '<button class="story-btn btn-begin">BEGIN QUEST! 💕</button>'}
      </div>
    `;

    // Handle button clicks
    const btnNext = wrap.querySelector('.btn-next');
    const btnBack = wrap.querySelector('.btn-back');
    const btnBegin = wrap.querySelector('.btn-begin');

    if (btnNext) btnNext.onclick = () => transition(1);
    if (btnBack) btnBack.onclick = () => transition(-1);
    if (btnBegin) btnBegin.onclick = () => {
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
        if (current === 4) spawnSparkles();
      }, 300);
    } else {
      container.innerHTML = '';
      container.appendChild(wrap);
      if (current === 4) spawnSparkles();
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
