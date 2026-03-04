// game/story.js
// Exposes: window.Story = { init }
// Responsibility: Multi-panel interactive intro story with unique animations per stage.

window.Story = (function () {
  'use strict';

  let container = null;
  let current = 0;

  const panels = [
    {
      text: "In a world of glowing screens, two souls found a connection that felt like home.",
      bg: "linear-gradient(135deg, #FFEFBA 0%, #FFFFFF 100%)",
      content: `
        <div style="font-size:100px; animation:glowpulse 3s infinite;">🌅</div>
        <div style="display:flex; gap:30px; margin-top:20px;">
          <div style="font-size:50px; animation:wiggle 1s infinite alternate;">📱</div>
          <div style="font-size:50px; animation:wiggle 1s infinite alternate-reverse;">📱</div>
        </div>
      `
    },
    {
      text: "Kku built digital wonders, while Chu architected the foundations of their shared dreams.",
      bg: "linear-gradient(135deg, #FFF8F0 0%, #F5E6C8 100%)",
      content: `
        <div style="display:flex; align-items:center; gap:40px;">
          <div style="font-size:90px; animation:float 4s infinite;">🥼</div>
          <div style="font-size:80px; animation:shake 0.1s infinite;">💼</div>
        </div>
      `
    },
    {
      text: "But suddenly, a glitch in the server garden separated them. The signals went quiet.",
      bg: "linear-gradient(135deg, #F5E6C8 0%, #E2D1B0 100%)",
      content: `
        <div id="p3-icon" style="font-size:120px; animation:heartbeat 1s 3, dimOut 5s forwards 3s;">📵</div>
      `
    },
    {
      text: "Kku waited through cycles of the moon, counting every second. She wouldn't give up.",
      bg: "linear-gradient(135deg, #E2D1B0 0%, #D4C4A8 100%)",
      content: `
        <div style="position:relative;">
          <div style="font-size:100px; filter:drop-shadow(0 0 15px #FFD700); animation:pulse 4s infinite;">🌙</div>
          <div style="font-size:40px; position:absolute; bottom:-10px; right:-10px; animation:spin 10s linear infinite;">🕒</div>
        </div>
      `
    },
    {
      text: "With a sparkle of fairy dust and a heart full of courage, Kku's Quest begins!",
      bg: "linear-gradient(135deg, #FFF8F0 0%, #FFF 100%)",
      content: `
        <div id="sparkle-burst" style="font-size:120px;">🧚‍♀️</div>
        <div class="sparkles-container"></div>
      `
    }
  ];

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
      <div class="story-stage" style="height:200px; display:flex; align-items:center; justify-content:center;">
        ${p.content}
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
    render();
  }

  return { init: init };
}());
