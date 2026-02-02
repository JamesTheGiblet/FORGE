// ====================
// VERSION CONTROL
// ====================
const CodeVersioning = {
    snapshots: new Map(), // Stores history: messageId -> Array of versions

    commit(messageId, description = 'Checkpoint') {
        const message = state.messages.find(m => m.id === messageId);
        if (!message || !message.artifacts) return null;

        if (!this.snapshots.has(messageId)) {
            this.snapshots.set(messageId, []);
        }

        const versions = this.snapshots.get(messageId);
        const versionId = `v${versions.length + 1}`;
        
        const snapshot = {
            id: versionId,
            timestamp: Date.now(),
            description: description,
            artifacts: JSON.parse(JSON.stringify(message.artifacts))
        };

        versions.push(snapshot);
        
        console.log(`[Versioning] Committed ${versionId} for ${messageId}: ${description}`);
        return snapshot;
    },

    diff(messageId, versionAId, versionBId) {
        const versions = this.snapshots.get(messageId);
        if (!versions) return null;

        const verA = versions.find(v => v.id === versionAId);
        const verB = versions.find(v => v.id === versionBId);

        if (!verA || !verB) return null;

        const changes = [];
        
        // Compare files from B against A
        verB.artifacts.forEach(fileB => {
            const fileA = verA.artifacts.find(f => f.path === fileB.path);
            if (fileA) {
                if (fileA.code !== fileB.code) {
                    const diff = DiffUtils.generateDiff(fileA.code, fileB.code);
                    const stats = DiffUtils.calculateDiffStats(diff);
                    changes.push({
                        file: fileB.path,
                        type: 'modified',
                        diff,
                        stats
                    });
                }
            } else {
                changes.push({
                    file: fileB.path,
                    type: 'added'
                });
            }
        });

        // Check for deleted files
        verA.artifacts.forEach(fileA => {
            if (!verB.artifacts.find(f => f.path === fileA.path)) {
                changes.push({
                    file: fileA.path,
                    type: 'deleted'
                });
            }
        });

        return changes;
    },

    rollback(messageId, versionId) {
        const versions = this.snapshots.get(messageId);
        if (!versions) return false;

        const targetVersion = versions.find(v => v.id === versionId);
        if (!targetVersion) return false;

        const messageIndex = state.messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) return false;

        // Apply artifacts from target version
        state.messages[messageIndex].artifacts = JSON.parse(JSON.stringify(targetVersion.artifacts));
        
        // Update cache for diffing
        if (state.originalCodeCache) {
            state.originalCodeCache.set(messageId, JSON.parse(JSON.stringify(targetVersion.artifacts)));
        }

        if (typeof renderMessages === 'function') {
            renderMessages();
        }
        
        if (typeof addMessage === 'function') {
            addMessage({
                type: 'system',
                content: `↩️ Rolled back to version ${versionId}`,
                timestamp: Date.now(),
                role: 'system'
            });
        }

        return true;
    },
    
    getHistory(messageId) {
        return this.snapshots.get(messageId) || [];
    }
};