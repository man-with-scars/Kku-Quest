// game/notifications.js
// Exposes: window.GameNotifications = { send, requestPermission }
// Responsibility: Native browser notifications for romantic milestones.

window.GameNotifications = (function () {
    'use strict';

    /**
     * Request permission for native browser notifications.
     * Usually called on the first significant interaction (like first level done).
     */
    async function requestPermission() {
        if (!('Notification' in window)) return;
        try {
            if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                await Notification.requestPermission();
            }
        } catch (e) {
            console.warn('Notification permission request failed:', e);
        }
    }

    /**
     * Sends a native notification using the pool of messages in GAME_CONFIG.
     */
    function send() {
        const C = window.GAME_CONFIG;
        const S = window.STATE;

        if (!C || !C.NOTIFICATIONS) return;

        const pool = C.NOTIFICATIONS;
        const idx = S.notifyIndex % pool.length;
        S.notifyIndex++;

        const msg = pool[idx];

        if (window.Notification && Notification.permission === 'granted') {
            try {
                new Notification('💕 Kku\'s Quest', {
                    body: msg,
                    icon: '../game/assets/characters/fairy.png',
                    badge: '../game/assets/characters/fairy.png',
                });
            } catch (e) {
                console.warn('Native notification failed to show:', e);
            }
        }

        // Always play chime SFX if window.sfx is available
        if (typeof window.sfx === 'function') {
            window.sfx('notify');
        }
    }

    return {
        send: send,
        requestPermission: requestPermission
    };
}());
