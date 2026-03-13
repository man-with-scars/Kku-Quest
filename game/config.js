// game/config.js
// Exposes window.GAME_CONFIG only. 

window.GAME_CONFIG = {
    // GitHub raw URL for level loading
    GH_RAW: 'https://raw.githubusercontent.com/man-with-scars/Kku-Quest/main/game/levels/',
    GH_TOKEN: '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',
    GH_REPO: 'man-with-scars/Kku-Quest',
    GH_BRANCH: 'main',
    VAULT_PATH: 'vault/',

    CORRECT_KEY: '9846907413',

    LEVEL_FILES: [
        'level-01.js', 'level-02.js', 'level-03.js', 'level-04.js', 'level-05.js',
        'level-06.js', 'level-07.js', 'level-08.js', 'level-09.js', 'level-10.js',
        'level-11.js', 'level-12.js'
    ],

    REWARDS: {},

    FRAGMENTS: [
        {
            id: 0, level: 3, value: '98',
            hint: 'Two digits — where every great call begins'
        },
        {
            id: 1, level: 5, value: '46',
            hint: 'Notes of a melody only two hearts share'
        },
        {
            id: 2, level: 7, value: '90',
            hint: 'A pair of numbers from a golden season'
        },
        {
            id: 3, level: 9, value: '74',
            hint: 'They dance together, inseparable'
        },
        {
            id: 4, level: 10, value: '13',
            hint: 'The last two — the date that started everything'
        },
    ],

    LEVEL_HINTS: {},

    NOTIFICATIONS: [
        '𝑰 𝑳𝒐𝒗𝒆 𝒀𝒐𝒖 𝟑𝟎𝟎𝟎 ❤️',
        '𝑰 𝑳𝒐𝒗𝒆 𝒚𝒐𝒖 𝒊𝒏 𝑬𝒗𝒆𝒓𝒚 𝑼𝒏𝒊𝒗𝒆𝒓𝒔𝒆 💎',
        '𝑾𝑰𝑻𝑯 𝑴𝒀 𝑺𝑶𝑼𝑳 𝑨𝑵𝑫 𝑯𝑬𝑨𝑹𝑻 💜',
        '𝒀𝒐𝒖 𝒂𝒓𝒆 𝒎𝒚 𝒘𝒉𝒐𝒍𝒆 𝒘𝒐𝒓𝒍𝒅 🌍',
        '𝑭𝒐𝒓𝒆𝒗𝒆𝒓 𝒂𝒏𝒅 𝑨𝒍𝒘𝒂𝒚𝒔 🌹',
        '𝑴𝒚 𝑯𝒆𝒂𝒓𝒕 𝑩𝒆𝒍𝒐𝒏𝒈𝒔 𝑻𝒐 𝒀𝒐𝒖 🫀',
    ],

    SFX: {
        ok: 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3',
        bad: 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3',
        up: 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3',
        bh: 'https://assets.mixkit.co/sfx/preview/mixkit-cinematic-transition-swoosh-2521.mp3',
        win: 'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3',
        click: 'https://assets.mixkit.co/sfx/preview/mixkit-modern-click-box-check-1120.mp3',
        crack: 'https://assets.mixkit.co/sfx/preview/mixkit-glass-break-1.mp3',
        notify: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3',
    },
};

Object.freeze(window.GAME_CONFIG);
