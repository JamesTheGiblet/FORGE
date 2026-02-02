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
// LOCAL STORAGE
// ====================
const Storage = {
    save() {
        try {
            const data = {
                messages: state.messages,
                settings: state.settings,
                credits: state.credits,
                analytics: state.analytics,
                timestamp: Date.now(),
                version: '1.0.0'
            };
            localStorage.setItem('forge_app', JSON.stringify(data));
            this.updateStorageUsage();
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    },

    load() {
        try {
            const data = JSON.parse(localStorage.getItem('forge_app'));
            if (data) {
                state.messages = data.messages || [];
                state.settings = { ...state.settings, ...(data.settings || {}) };
                state.credits = data.credits || state.credits;
                state.analytics = data.analytics || state.analytics;
                
                // Restore UI from loaded settings
                if (document.getElementById('apiKeyInput')) document.getElementById('apiKeyInput').value = state.settings.apiKey || '';
                if (document.getElementById('modelSelect')) document.getElementById('modelSelect').value = state.settings.model;
                if (document.getElementById('autoValidate')) document.getElementById('autoValidate').checked = state.settings.autoValidate;
                if (document.getElementById('showSuggestions')) document.getElementById('showSuggestions').checked = state.settings.showSuggestions;
                if (document.getElementById('saveConversations')) document.getElementById('saveConversations').checked = state.settings.saveConversations;
                if (document.getElementById('showPatternSuggestions')) document.getElementById('showPatternSuggestions').checked = state.settings.showPatternSuggestions;
            }
        } catch (e) {
            console.warn('Failed to load from localStorage:', e);
        }
    },

    clear() {
        localStorage.removeItem('forge_app');
        state.messages = [];
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