// landing/vault.js
// Responsibility: client-side encryption for files/blobs using Web Crypto API (AES-GCM).
// Output format: [16 bytes salt] [12 bytes IV] [encrypted data]

window.Vault = (function () {
    'use strict';

    const ITERATIONS = 100000;
    const KEY_LEN = 256;
    const SALT_LEN = 16;
    const IV_LEN = 12;

    /**
     * Encrypts a Blob with a password.
     * @param {Blob} blob 
     * @param {string} password 
     * @returns {Promise<Blob>}
     */
    async function encrypt(blob, password) {
        const data = await blob.arrayBuffer();
        const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LEN));
        const iv = window.crypto.getRandomValues(new Uint8Array(IV_LEN));

        // 1. Derive key
        const baseKey = await window.crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        const aesKey = await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: ITERATIONS,
                hash: 'SHA-256'
            },
            baseKey,
            { name: 'AES-GCM', length: KEY_LEN },
            false,
            ['encrypt']
        );

        // 2. Encrypt
        const encryptedContent = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            aesKey,
            data
        );

        // 3. Package: [salt][iv][encrypted_data]
        return new Blob([salt, iv, new Uint8Array(encryptedContent)], { type: 'application/octet-stream' });
    }

    return { encrypt: encrypt };
})();
