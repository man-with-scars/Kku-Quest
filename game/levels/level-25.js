// game/levels/level-25.js
// Special Birthday Level

window.LEVEL_REGISTRY = window.LEVEL_REGISTRY || [];
window.LEVEL_REGISTRY.push({
    id: 25,
    view: 'v-L25',
    icon: '🎂',
    title: 'Happy 25th',
    type: 'finale',
    hint: '',

    build(el) {
        el.innerHTML = `
            <div id="l25-stage" style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:40px; background:radial-gradient(circle, #FFF8F0 0%, #F5E6C8 100%);">
                <div id="birthday-number" style="
                    font-family: 'Fredoka', cursive;
                    font-size: 180px;
                    color: #FFD700;
                    cursor: pointer;
                    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
                    transition: transform 0.3s, filter 0.3s;
                    animation: float 3s infinite ease-in-out, birthdayGlow 2s infinite alternate;
                ">25</div>
                <div id="birthday-message" style="
                    font-family: 'Fredoka', cursive;
                    font-size: 40px;
                    color: var(--purple);
                    text-align: center;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 1s, transform 1s;
                    padding: 0 20px;
                ">HAPPY 25'th BIRTHDAY, MY LOVE 💜</div>
            </div>

            <style>
                @keyframes birthdayGlow {
                    from { filter: drop-shadow(0 0 10px #FFD700); }
                    to { filter: drop-shadow(0 0 50px #FFD700); text-shadow: 0 0 40px #FFE4B5; }
                }
                #birthday-number:hover {
                    transform: scale(1.15) rotate(5deg);
                    filter: brightness(1.3) drop-shadow(0 0 70px #FFD700);
                }
            </style>
        `;

        const num = el.querySelector('#birthday-number');
        const msg = el.querySelector('#birthday-message');

        num.onclick = () => {
            msg.style.opacity = '1';
            msg.style.transform = 'translateY(0)';
            if (window.sfx) window.sfx('win');

            // Celebration effects already handled by CSS

            setTimeout(() => {
                window.levelDone(25);
            }, 5000);
        };
    }
});
