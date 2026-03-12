// game/shop.js
// Responsibility: Coin-based power-up shop.

window.Shop = (function () {
    'use strict';

    function createStyle() {
        const css = `
            #shop-overlay {
                background: rgba(0,0,0,0.85);
                backdrop-filter: blur(10px);
                z-index: 1000;
            }
            .shop-modal {
                background: #FFF8F0;
                width: 90%;
                max-width: 500px;
                padding: 30px;
                border-radius: 25px;
                border: 5px solid var(--gold);
                text-align: center;
                font-family: 'Fredoka', cursive;
            }
            .shop-items {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin: 25px 0;
            }
            .shop-item {
                background: white;
                padding: 15px;
                border-radius: 15px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border: 2px solid #eee;
                transition: transform 0.2s;
            }
            .shop-item:hover { transform: scale(1.02); }
            .buy-btn {
                background: var(--gold);
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 10px;
                font-weight: 700;
                cursor: pointer;
            }
            .buy-btn:disabled { background: #ccc; cursor: not-allowed; }
        `;
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    function open() {
        if (!document.getElementById('shop-overlay')) {
            createStyle();
            const overlay = document.createElement('div');
            overlay.id = 'shop-overlay';
            overlay.className = 'overlay active';
            overlay.innerHTML = `
                <div class="shop-modal">
                    <h2 style="color:var(--purple); font-size:32px;">Kku's Magic Shop ✨</h2>
                    <p style="color:var(--sub);">Your Balance: 💰 <span id="shop-coins">${window.STATE.coins}</span></p>
                    
                    <div class="shop-items">
                        <div class="shop-item">
                            <div>
                                <span style="font-size:24px;">💡</span>
                                <strong>Hint Booster</strong>
                            </div>
                            <button class="buy-btn" onclick="Shop.buy('hint', 30)">💰 30</button>
                        </div>
                        <div class="shop-item">
                            <div>
                                <span style="font-size:24px;">⏭️</span>
                                <strong>Level Skip</strong>
                            </div>
                            <button class="buy-btn" onclick="Shop.buy('skip', 100)">💰 100</button>
                        </div>
                        <div class="shop-item">
                            <div>
                                <span style="font-size:24px;">❤️</span>
                                <strong>Extra Life</strong>
                            </div>
                            <button class="buy-btn" onclick="Shop.buy('life', 50)">💰 50</button>
                        </div>
                    </div>
                    
                    <button onclick="Shop.close()" style="background:var(--rose); color:white; border:none; padding:10px 30px; border-radius:15px; font-weight:700; cursor:pointer;">CLOSE</button>
                </div>
            `;
            document.body.appendChild(overlay);
        }
    }

    function buy(type, price) {
        if (window.STATE.coins >= price) {
            window.STATE.coins -= price;
            document.getElementById('shop-coins').textContent = window.STATE.coins;
            if (window.renderHearts) window.renderHearts();

            if (type === 'life') {
                window.STATE.lives = Math.min(3, window.STATE.lives + 1);
                if (window.renderHearts) window.renderHearts();
                alert("Heart restored! ❤️");
            } else if (type === 'skip') {
                if (window.STATE.currentLevel) {
                    alert("Level skipped!");
                    window.Shop.close();
                    window.levelDone(window.STATE.currentLevel);
                } else {
                    alert("Must be in a level to skip!");
                }
            } else if (type === 'hint') {
                alert("Hint Power-up activated!");
                // Implementation for hint display if needed
            }
        } else {
            alert("Not enough coins! Play more to earn 💰");
        }
    }

    return {
        open: open,
        close: () => {
            const el = document.getElementById('shop-overlay');
            if (el) el.remove();
        },
        buy: buy
    };
}());
