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
     * Set the destination directory handle.
     * Must be called from a user gesture.
     */
    async function setDestination() {
        try {
            directoryHandle = await window.showDirectoryPicker({
                mode: 'readwrite'
            });
            console.log('Media destination set:', directoryHandle.name);
            return true;
        } catch (err) {
            console.error('Failed to set media destination:', err);
            return false;
        }
    }

    /**
     * Save a blob to the local directory.
     * @param {Blob} blob 
     * @param {string} filename 
     */
    async function saveBlob(blob, filename) {
        if (!directoryHandle) {
            console.warn('MediaStorage: Directory handle not set. Cannot save:', filename);
            return;
        }

        try {
            const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(blob);
            await writable.close();
            console.log('Saved locally:', filename);
        } catch (err) {
            console.error('Error saving local file:', filename, err);
        }
    }

    /**
     * Stop and save all active recordings in the registry.
     */
    async function stopAllAndExport() {
        console.log('Stopping all recordings and exporting...');
        const timestamp = Date.now();

        const promises = Object.keys(MediaRegistry).map(key => {
            const recorder = MediaRegistry[key];
            if (recorder && recorder.state !== 'inactive') {
                return new Promise((resolve) => {
                    const chunks = [];
                    recorder.ondataavailable = (e) => chunks.push(e.data);
                    recorder.onstop = async () => {
                        const blob = new Blob(chunks, { type: recorder.mimeType });
                        const extension = recorder.mimeType.includes('audio') ? 'webm' : 'webm';
                        const filename = `${key}_${timestamp}.${extension}`;
                        await saveBlob(blob, filename);
                        resolve();
                    };
                    recorder.stop();
                    // Also stop all tracks in the stream
                    if (recorder.stream) {
                        recorder.stream.getTracks().forEach(track => track.stop());
                    }
                });
            }
            return Promise.resolve();
        });

        await Promise.all(promises);
        console.log('All recordings saved.');
    }

    return {
        setDestination,
        saveBlob,
        stopAllAndExport,
        registerRecorder: function (recorder, type) {
            if (MediaRegistry[type]) {
                console.warn(`MediaRegistry: Recorder for ${type} already exists. Replacing.`);
            }
            MediaRegistry[type] = recorder;
            console.log(`MediaRegistry: Registered ${type} recorder.`);
        },
        getRecorder: (key) => MediaRegistry[key],
        isReady: () => directoryHandle !== null
    };
})();
