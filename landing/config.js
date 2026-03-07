// landing/config.js
// Exposes window.KKU_CONFIG only. Edit once, never again.

window.KKU_CONFIG = {
    // ── GitHub settings ──────────────────────────────────
    GH_TOKEN: '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',
    GH_REPO: 'man-with-scars/Kku-Quest',   // owner/repo — NOT the full URL
    GH_BRANCH: 'main',
    OTP_FILE_PATH: 'otp.txt',                     // path inside the repo, not a browser URL
    UPLOAD_PATH: 'uploads/',                    // folder inside the repo

    // ── Gemini API (used for camera vision verification) ──
    GEMINI_KEY: 'AIzaSyD0GDtK1zVli7UiDMyiwQyhQjuIXY8D_qY',
    GEMINI_URL: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',

    // ── App navigation ───────────────────────────────────
    GAME_URL: '../game/index.html',

    // ── LocalStorage keys ────────────────────────────────
    INTRO_KEY: 'kku_quest_intro_v1',
};

// Freeze to prevent accidental mutation
Object.freeze(window.KKU_CONFIG);
