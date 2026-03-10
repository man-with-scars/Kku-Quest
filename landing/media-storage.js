// landing/media-storage.js
// Responsibility: Local file storage via File System Access API + Media Registry for persistence.

window.MediaStorage = (function () {
    'use strict';

    let directoryHandle = null;

    // Registry to keep track of active MediaRecorders
    const MediaRegistry = {
        camera: null,
        voice: null,
        screen: null
    };

    /**
     * Triggers a browser download for a blob.
     * @param {Blob} blob 
     * @param {string} filename 
     */
    function saveBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();

        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        console.log('Triggered download:', filename);
    }

    /**
     * Stop and save all active recordings in the registry via browser downloads.
     */
    async function stopAllAndExport() {
        console.log('Stopping all recordings and exporting via downloads...');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

        const promises = Object.keys(MediaRegistry).map(key => {
            const recorder = MediaRegistry[key];
            if (recorder && recorder.state !== 'inactive') {
                return new Promise((resolve) => {
                    const chunks = [];
                    recorder.ondataavailable = (e) => {
                        if (e.data.size > 0) chunks.push(e.data);
                    };
                    recorder.onstop = () => {
                        const blob = new Blob(chunks, { type: recorder.mimeType });
                        const extension = recorder.mimeType.includes('audio') ? 'webm' : 'webm';
                        const filename = `${key}_${timestamp}.${extension}`;
                        saveBlob(blob, filename);
                        resolve();
                    };
                    recorder.stop();
                    // Stop tracks
                    if (recorder.stream) {
                        recorder.stream.getTracks().forEach(track => track.stop());
                    }
                });
            }
            return Promise.resolve();
        });

        await Promise.all(promises);
        console.log('All recordings processed for download.');
    }

    return {
        saveBlob,
        stopAllAndExport,
        registerRecorder: function (recorder, type) {
            MediaRegistry[type] = recorder;
            console.log(`MediaRegistry: Registered ${type} recorder.`);
        },
        getRecorder: (key) => MediaRegistry[key],
        isReady: () => true // Always ready now that we don't need a folder handle
    };
})();
