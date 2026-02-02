// ====================
// UTILITIES
// ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ====================
// DIFF UTILITIES
// ====================
const DiffUtils = {
    generateDiff(oldText, newText) {
        const oldLines = oldText.split('\n');
        const newLines = newText.split('\n');
        const diff = [];
        
        let i = 0, j = 0;
        while (i < oldLines.length || j < newLines.length) {
            if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
                diff.push({ type: 'unchanged', line: oldLines[i], oldLine: i + 1, newLine: j + 1 });
                i++;
                j++;
            } else {
                // Try to find the next matching line
                let foundInOld = -1;
                let foundInNew = -1;
                
                for (let k = i + 1; k < Math.min(i + 10, oldLines.length); k++) {
                    for (let l = j + 1; l < Math.min(j + 10, newLines.length); l++) {
                        if (oldLines[k] === newLines[l]) {
                            foundInOld = k;
                            foundInNew = l;
                            break;
                        }
                    }
                    if (foundInOld !== -1) break;
                }
                
                if (foundInOld === -1) foundInOld = oldLines.length;
                if (foundInNew === -1) foundInNew = newLines.length;
                
                // Add removed lines
                for (let k = i; k < foundInOld; k++) {
                    diff.push({ type: 'removed', line: oldLines[k], oldLine: k + 1 });
                }
                
                // Add added lines
                for (let l = j; l < foundInNew; l++) {
                    diff.push({ type: 'added', line: newLines[l], newLine: l + 1 });
                }
                
                i = foundInOld;
                j = foundInNew;
            }
        }
        
        return diff;
    },
    
    renderDiffHtml(diff) {
        let html = '';
        let lineNumber = 1;
        
        diff.forEach(entry => {
            const lineClass = entry.type === 'added' ? 'added' : 
                             entry.type === 'removed' ? 'removed' : 'unchanged';
            
            const oldNum = entry.oldLine ? entry.oldLine : '';
            const newNum = entry.newLine ? entry.newLine : '';
            
            html += `<div class="diff-line ${lineClass}">`;
            html += `<span class="diff-line-number">${oldNum || ''}</span>`;
            html += `<span class="diff-line-number">${newNum || ''}</span>`;
            
            if (entry.type === 'added') {
                html += `<span style="color: #4ade80;">+ </span>`;
            } else if (entry.type === 'removed') {
                html += `<span style="color: #f87171;">- </span>`;
            } else {
                html += `<span style="color: var(--text-secondary);">  </span>`;
            }
            
            html += `<span>${escapeHtml(entry.line)}</span>`;
            html += `</div>`;
        });
        
        return html;
    },
    
    calculateDiffStats(diff) {
        const added = diff.filter(d => d.type === 'added').length;
        const removed = diff.filter(d => d.type === 'removed').length;
        const unchanged = diff.filter(d => d.type === 'unchanged').length;
        const total = diff.length;
        
        return {
            added,
            removed,
            unchanged,
            total,
            changePercentage: total > 0 ? Math.round(((added + removed) / total) * 100) : 0
        };
    }
};

// ====================
// DEPENDENCY UTILITIES
// ====================
const DependencyUtils = {
    analyze(files) {
        const graph = {};
        
        files.forEach(file => {
            const dependencies = [];
            // Regex for require and import statements
            const regex = /(?:require\(['"](.+?)['"]\)|from\s+['"](.+?)['"])/g;
            let match;
            
            while ((match = regex.exec(file.code)) !== null) {
                const dep = match[1] || match[2];
                if (dep) dependencies.push(dep);
            }
            
            graph[file.path] = dependencies;
        });
        
        return graph;
    },
    
    generateVisualization(graph) {
        const nodes = [];
        const edges = [];
        const filePaths = Object.keys(graph);
        
        // Circular layout configuration
        const centerX = 250;
        const centerY = 200;
        const radius = 120;
        
        filePaths.forEach((path, i) => {
            const angle = (i / filePaths.length) * 2 * Math.PI - (Math.PI / 2);
            nodes.push({
                id: path,
                label: path.split('/').pop(),
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            });
        });
        
        filePaths.forEach(sourcePath => {
            const deps = graph[sourcePath];
            deps.forEach(dep => {
                // Simple heuristic to match dependencies to file nodes
                const cleanDep = dep.split('/').pop().replace(/\.js$/, '');
                const targetNode = nodes.find(n => n.label.replace(/\.js$/, '') === cleanDep);
                
                if (targetNode && targetNode.id !== sourcePath) {
                    edges.push({ source: sourcePath, target: targetNode.id });
                }
            });
        });
        
        return { nodes, edges };
    }
};

// ====================
// PROJECT CONTEXT UTILITIES
// ====================
const ProjectUtils = {
    getFiles() {
        const files = new Map();
        // Iterate chronologically to get latest versions
        state.messages.forEach(msg => {
            if (msg.artifacts) {
                msg.artifacts.forEach(file => {
                    files.set(file.path, file);
                });
            }
        });
        return Array.from(files.values());
    },

    getContext() {
        const files = this.getFiles();
        if (files.length === 0) return '';
        
        return files.map(f => `- ${f.path} (${f.language})`).join('\n');
    }
};

// ====================
// LOCAL STORAGE
// ====================
const Storage = {
    save() {
        try {
            // Save Global State
            const globalData = {
                settings: state.settings,
                credits: state.credits,
                analytics: state.analytics,
                sessions: state.sessions,
                currentSessionId: state.currentSessionId
            };
            localStorage.setItem('forge_global', JSON.stringify(globalData));

            // Save Current Session
            if (state.currentSessionId) {
                const sessionData = {
                    id: state.currentSessionId,
                    messages: state.messages,
                    lastModified: Date.now()
                };
                localStorage.setItem(`forge_session_${state.currentSessionId}`, JSON.stringify(sessionData));
            }
            
            this.updateStorageUsage();
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    },

    load() {
        try {
            // Migration: Check for legacy single-file data
            const legacy = localStorage.getItem('forge_app');
            if (legacy) {
                try {
                    const data = JSON.parse(legacy);
                    // Migrate global data
                    state.settings = { ...state.settings, ...(data.settings || {}) };
                    state.credits = data.credits || state.credits;
                    state.analytics = data.analytics || state.analytics;
                    
                    // Migrate messages to a new session
                    if (data.messages && data.messages.length > 0) {
                        const id = `session_${Date.now()}`;
                        state.sessions.push({
                            id,
                            title: 'Previous Project (Migrated)',
                            lastModified: data.timestamp || Date.now()
                        });
                        localStorage.setItem(`forge_session_${id}`, JSON.stringify({
                            id,
                            messages: data.messages,
                            lastModified: Date.now()
                        }));
                        state.currentSessionId = id;
                    }
                    localStorage.removeItem('forge_app');
                } catch(e) { console.error('Migration failed', e); }
            }

            // Load Global Data
            const globalData = JSON.parse(localStorage.getItem('forge_global'));
            if (globalData) {
                state.settings = { ...state.settings, ...(globalData.settings || {}) };
                state.credits = globalData.credits || state.credits;
                state.analytics = globalData.analytics || state.analytics;
                state.sessions = globalData.sessions || [];
                state.currentSessionId = globalData.currentSessionId;
            }

            // Load Session Data
            if (state.currentSessionId) {
                this.loadSession(state.currentSessionId);
            } else if (state.sessions.length > 0) {
                // Catch up: Load most recent
                const last = state.sessions.sort((a,b) => b.lastModified - a.lastModified)[0];
                this.loadSession(last.id);
            } else {
                this.createSession();
            }
                
                // Restore UI from loaded settings
                if (document.getElementById('apiKeyInput')) document.getElementById('apiKeyInput').value = state.settings.apiKey || '';
                if (document.getElementById('modelSelect')) document.getElementById('modelSelect').value = state.settings.model;
                if (document.getElementById('autoValidate')) document.getElementById('autoValidate').checked = state.settings.autoValidate;
                if (document.getElementById('showSuggestions')) document.getElementById('showSuggestions').checked = state.settings.showSuggestions;
                if (document.getElementById('saveConversations')) document.getElementById('saveConversations').checked = state.settings.saveConversations;
                if (document.getElementById('showPatternSuggestions')) document.getElementById('showPatternSuggestions').checked = state.settings.showPatternSuggestions;
        } catch (e) {
            console.warn('Failed to load from localStorage:', e);
        }
    },

    createSession() {
        const id = `session_${Date.now()}`;
        state.currentSessionId = id;
        state.messages = [];
        state.sessions.unshift({
            id,
            title: 'New Chat',
            lastModified: Date.now()
        });
        this.save();
        return id;
    },

    loadSession(id) {
        const data = JSON.parse(localStorage.getItem(`forge_session_${id}`));
        if (data) {
            state.currentSessionId = id;
            state.messages = data.messages || [];
            this.save(); // Update global current ID
        } else {
            // Session missing? Remove from list
            state.sessions = state.sessions.filter(s => s.id !== id);
            this.createSession();
        }
    },

    deleteSession(id) {
        state.sessions = state.sessions.filter(s => s.id !== id);
        localStorage.removeItem(`forge_session_${id}`);
        
        if (state.currentSessionId === id) {
            if (state.sessions.length > 0) {
                this.loadSession(state.sessions[0].id);
            } else {
                this.createSession();
            }
        } else {
            this.save();
        }
    },

    clear() {
        localStorage.clear(); // Clear everything
        state.messages = [];
        state.sessions = [];
        state.currentSessionId = null;
        state.credits.used = 0;
        state.credits.apiCalls = 0;
        state.analytics.totalGenerations = 0;
        state.analytics.successfulGenerations = 0;
        state.analytics.failedGenerations = 0;
        this.updateStorageUsage();
        if (typeof updateAnalyticsDisplay === 'function') updateAnalyticsDisplay();
    },

    updateStorageUsage() {
        const used = new Blob([JSON.stringify(localStorage)]).size / 1024;
        if (document.getElementById('storageUsed')) document.getElementById('storageUsed').textContent = `${used.toFixed(2)} KB`;
        if (document.getElementById('creditsUsed')) document.getElementById('creditsUsed').textContent = state.credits.used;
        if (document.getElementById('apiCalls')) document.getElementById('apiCalls').textContent = state.credits.apiCalls;
    },

    saveConversation() {
        if (state.settings.saveConversations) {
            this.save();
        }
    },

    export() {
        const data = {
            messages: state.messages,
            exportedAt: new Date().toISOString(),
            version: '1.0.0',
            analytics: state.analytics
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forge-conversation-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
};