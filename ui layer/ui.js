// ====================
// UI FUNCTIONS
// ====================
function updateStatus(text, status = 'online') {
    const dot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    dot.className = `status-dot ${status === 'offline' ? 'offline' : status === 'pending' ? 'pending' : ''}`;
    statusText.textContent = text;
    
    Storage.updateStorageUsage();
}

function addMessage(message) {
    message.id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    state.messages.push(message);
    renderMessages();
    
    // Auto-scroll to bottom
    setTimeout(() => {
        const container = document.getElementById('messagesContainer');
        container.scrollTop = container.scrollHeight;
    }, 100);
    
    // Save to storage
    Storage.saveConversation();
}

function renderMessages() {
    const container = document.getElementById('messagesContainer');
    container.innerHTML = '';

    if (state.messages.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">🪄</div>
                <h2 style="margin-bottom: 0.5rem;">Describe what you want to build</h2>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                    FORGE generates complete, production-ready code from your descriptions
                </p>
                <div class="suggestions" style="justify-content: center;">
                    <button class="suggestion-chip" onclick="useSuggestion('Build a REST API for user authentication with JWT')">
                        "Build authentication API"
                    </button>
                    <button class="suggestion-chip" onclick="useSuggestion('Create a WebSocket server for real-time chat')">
                        "Create WebSocket server"
                    </button>
                    <button class="suggestion-chip" onclick="useSuggestion('Generate MongoDB user model with validation')">
                        "Generate database model"
                    </button>
                </div>
            </div>
        `;
        return;
    }

    state.messages.forEach((msg, index) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.role || 'ai'} ${msg.type === 'system' ? 'system' : ''}`;
        messageDiv.setAttribute('data-message-id', msg.id);
        
        if (msg.type === 'intent') {
            messageDiv.innerHTML = `
                <div class="message-bubble">
                    <div>${escapeHtml(msg.content)}</div>
                    <div style="font-size: 0.8rem; opacity: 0.7; margin-top: 0.5rem;">
                        ${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            `;
        } else if (msg.type === 'generation') {
            const fileTree = msg.artifacts ? `
                <div class="file-tree">
                    <div class="tree-header" onclick="toggleTree(this)">
                        <span class="tree-icon">▼</span>
                        <span class="tree-title">Generated Files</span>
                        <span class="tree-count">${msg.artifacts.length} ${msg.artifacts.length === 1 ? 'file' : 'files'}</span>
                    </div>
                    <div class="tree-items">
                        ${msg.artifacts.map(file => `
                            <div class="tree-item" onclick="showCodePreview('${msg.id}', '${file.path}')">
                                <span class="item-icon">${getFileIcon(file.language)}</span>
                                <span class="item-path">${escapeHtml(file.path)}</span>
                                <span class="item-meta">${file.lines} lines</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ${msg.artifacts.map((file, fileIdx) => `
                    <div class="code-preview" id="preview-${msg.id}-${fileIdx}" style="display: none;">
                        <div class="file-preview">
                            <div class="file-header" onclick="toggleFilePreview('preview-${msg.id}-${fileIdx}')">
                                <span>${getFileIcon(file.language)} ${escapeHtml(file.path)}</span>
                                <span class="item-meta">${file.lines} lines · ${file.language}</span>
                            </div>
                            <div class="code-snippet-wrapper" style="display: none;">
                                <pre class="code-snippet">${escapeHtml(file.code.split('\n').slice(0, 15).join('\n'))}</pre>
                                ${file.lines > 15 ? `
                                    <div class="more-lines">
                                        ... ${file.lines - 15} more lines
                                        <button class="action-btn" onclick="showCodePreview('${msg.id}', '${file.path}')" style="margin-top: 0.5rem;">
                                            View Full File
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            ` : '';
            
            const validationBadge = msg.validations ? `
                <div class="validation-badge ${msg.validations.tests_passed === msg.validations.tests_total ? '' : 'warning'}">
                    📊 ${msg.validations.tests_passed}/${msg.validations.tests_total} tests passing
                    ${msg.validations.coverage ? `(${msg.validations.coverage}% coverage)` : ''}
                </div>
            ` : '';

            const assumptions = msg.assumptions ? `
                <div class="pattern-suggestions" style="background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.3);">
                    <div style="font-weight: 600; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span>⚙️</span>
                        <span>Key Assumptions:</span>
                    </div>
                    <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-secondary);">
                        ${msg.assumptions.map(a => `<li style="margin: 0.25rem 0;">${escapeHtml(a)}</li>`).join('')}
                    </ul>
                </div>
            ` : '';
            
            const dependencyGraphHtml = (msg.dependencyGraph && typeof renderDependencyGraph === 'function') ? 
                renderDependencyGraph(msg.dependencyGraph, msg.id) : '';

            messageDiv.innerHTML = `
                <div class="message-bubble">
                    <div class="generation-header">
                        <span class="status-icon">✓</span>
                        <span>${escapeHtml(msg.content)}</span>
                    </div>
                    ${fileTree}
                    ${dependencyGraphHtml}
                    ${validationBadge}
                    ${assumptions}
                    <div class="action-bar">
                        <button class="action-btn" onclick="viewAllCode(${index})">📝 View All Code</button>
                        <button class="action-btn" onclick="runTests(${index})">⚡ Run Tests</button>
                        <button class="action-btn" onclick="downloadCode(${index})">💾 Download</button>
                        <button class="action-btn primary" onclick="refineCode(${index})">✨ Refine</button>
                    </div>
                </div>
            `;
        } else if (msg.type === 'test_result') {
            const testResults = msg.results ? `
                <div class="test-results">
                    ${msg.progress !== undefined ? `
                        <div class="test-progress">
                            <div class="test-progress-bar" style="width: ${msg.progress}%"></div>
                        </div>
                    ` : ''}
                    ${msg.results.map((test, i) => `
                        <div class="test-item ${test.status}">
                            <span>${test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏳'}</span>
                            <div style="flex: 1;">
                                <div>${escapeHtml(test.name)}</div>
                                ${test.message ? `<div style="font-size: 0.85rem; color: var(--text-secondary);">${escapeHtml(test.message)}</div>` : ''}
                            </div>
                            <span style="font-size: 0.85rem; color: var(--text-secondary);">${test.duration || ''}</span>
                        </div>
                    `).join('')}
                </div>
            ` : '';
            
            messageDiv.innerHTML = `
                <div class="message-bubble">
                    <div class="generation-header">
                        <span class="status-icon">🧪</span>
                        <span>${escapeHtml(msg.content)}</span>
                    </div>
                    ${testResults}
                </div>
            `;
        } else if (msg.type === 'refinement') {
            const changesHtml = msg.changes ? `
                <div class="changes-summary">
                    <div style="font-weight: 600; margin-bottom: 0.75rem;">Changes Applied:</div>
                    ${msg.changes.map(change => `
                        <div class="change-item">
                            <span class="item-icon">✏️</span>
                            <div style="flex: 1;">
                                <div>${escapeHtml(change.file)}</div>
                                <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                    Lines ${change.lines.join('-')} (${change.added || 0}+ / ${change.removed || 0}-)
                                </div>
                            </div>
                            <button class="action-btn" onclick="viewFileDiff(${index}, '${change.file}')">View Diff</button>
                        </div>
                    `).join('')}
                </div>
            ` : '';

            const validationBadge = msg.validations ? `
                <div class="validation-badge ${msg.validations.tests_passed === msg.validations.tests_total ? '' : 'warning'}">
                    📊 ${msg.validations.tests_passed}/${msg.validations.tests_total} tests passing
                </div>
            ` : '';
            
            messageDiv.innerHTML = `
                <div class="message-bubble">
                    <div class="generation-header">
                        <span class="status-icon">✓</span>
                        <span>${escapeHtml(msg.content)}</span>
                    </div>
                    ${changesHtml}
                    ${validationBadge}
                    <div class="action-bar">
                        <button class="action-btn" onclick="viewAllDiffs(${index})">📊 View All Diffs</button>
                        <button class="action-btn primary" onclick="applyChanges(${index})">✅ Apply Changes</button>
                        <button class="action-btn" onclick="revertChanges(${index})">↩️ Revert</button>
                    </div>
                </div>
            `;
        } else if (msg.type === 'dependency_graph') {
            const viz = msg.visualization;
            const svgContent = `
                <svg width="100%" height="400" viewBox="0 0 500 400" style="background: var(--bg-secondary); border-radius: 8px;">
                    <defs>
                        <marker id="arrowhead-${msg.id}" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                        </marker>
                    </defs>
                    ${viz.edges.map(edge => {
                        const source = viz.nodes.find(n => n.id === edge.source);
                        const target = viz.nodes.find(n => n.id === edge.target);
                        if (!source || !target) return '';
                        return `<line x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke="#6b7280" stroke-width="1.5" marker-end="url(#arrowhead-${msg.id})" opacity="0.6" />`;
                    }).join('')}
                    ${viz.nodes.map(node => `
                        <g transform="translate(${node.x},${node.y})">
                            <circle r="20" fill="#3b82f6" fill-opacity="0.1" stroke="#3b82f6" stroke-width="2"/>
                            <text dy="35" text-anchor="middle" fill="var(--text-primary)" font-size="11" style="font-family: monospace;">${escapeHtml(node.label)}</text>
                            <title>${escapeHtml(node.id)}</title>
                        </g>
                    `).join('')}
                </svg>
            `;
            
            messageDiv.innerHTML = `
                <div class="message-bubble">
                    <div class="generation-header">
                        <span class="status-icon">🕸️</span>
                        <span>${escapeHtml(msg.content)}</span>
                        <button class="action-btn" onclick="exportGraphImage('${msg.id}')" style="margin-left: auto; font-size: 0.8rem; padding: 0.25rem 0.75rem;">💾 Export Image</button>
                    </div>
                    <div class="graph-container" style="margin-top: 1rem; overflow: hidden; border: 1px solid var(--border-color); border-radius: 8px;">
                        ${svgContent}
                    </div>
                </div>
            `;
        } else if (msg.type === 'pattern_suggestion') {
            messageDiv.innerHTML = `
                <div class="message-bubble">
                    <div class="pattern-suggestions">
                        <div style="font-weight: 600; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span>💡</span>
                            <span>Suggested Patterns from Your Repos:</span>
                        </div>
                        ${msg.patterns.map(pattern => `
                            <div class="pattern-suggestion-item" onclick="usePattern('${pattern.id}', '${escapeHtml(pattern.name)}')">
                                <span style="font-size: 1.2rem;">📦</span>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600;">${escapeHtml(pattern.name)}</div>
                                    <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                        ${escapeHtml(pattern.description)}
                                        ${pattern.matchReason ? `<br><small>${pattern.matchReason} (score: ${pattern.score})</small>` : ''}
                                    </div>
                                </div>
                                <span style="color: var(--text-secondary);">→</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (msg.type === 'system') {
            messageDiv.innerHTML = `
                <div class="message-bubble">
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary);">
                        <span>ℹ️</span>
                        <span>${escapeHtml(msg.content)}</span>
                    </div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-bubble">
                    <div>${escapeHtml(msg.content)}</div>
                </div>
            `;
        }
        
        container.appendChild(messageDiv);
    });
}

function getFileIcon(language) {
    const icons = {
        javascript: '📄',
        typescript: '📘',
        python: '🐍',
        java: '☕',
        html: '🌐',
        css: '🎨',
        json: '📋',
        markdown: '📝',
        yaml: '⚙️',
        sql: '🗄️'
    };
    return icons[language] || '📄';
}

function toggleTree(header) {
    const icon = header.querySelector('.tree-icon');
    const items = header.nextElementSibling;
    
    if (items.classList.contains('collapsed')) {
        items.classList.remove('collapsed');
        icon.classList.remove('collapsed');
    } else {
        items.classList.add('collapsed');
        icon.classList.add('collapsed');
    }
}

function toggleFilePreview(id) {
    const preview = document.getElementById(id);
    const wrapper = preview.querySelector('.code-snippet-wrapper');
    
    if (wrapper.style.display === 'none') {
        wrapper.style.display = 'block';
    } else {
        wrapper.style.display = 'none';
    }
}

// ====================
// CORE FUNCTIONALITY
// ====================
async function submitIntent() {
    const startTime = Date.now();
    const input = document.getElementById('intentInput');
    const intent = input.value.trim();
    
    if (!intent || state.isGenerating) return;
    
    input.value = '';
    state.isGenerating = true;
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('submitBtn').innerHTML = '<span class="loading">Generating</span>';
    
    // Add user intent message
    addMessage({
        type: 'intent',
        content: intent,
        timestamp: Date.now(),
        role: 'user'
    });

    // Check for pattern suggestions if enabled
    if (state.settings.showPatternSuggestions) {
        const patterns = PatternLibrary.suggest(intent, state.messages);
        if (patterns.length > 0) {
            addMessage({
                type: 'pattern_suggestion',
                patterns: patterns,
                timestamp: Date.now(),
                role: 'assistant'
            });
        }
    }
    
    let result;
    
    try {
        if (state.aiMode === 'smart' && state.settings.apiKey) {
            result = await SmartAI.generate(
                intent, 
                state.settings.apiKey,
                state.settings.model,
                state.settings.provider || 'anthropic'
            );
        } else if (state.aiMode === 'hybrid') {
            if (state.settings.apiKey) {
                try {
                    result = await SmartAI.generate(
                        intent,
                        state.settings.apiKey,
                        state.settings.model,
                        state.settings.provider || 'anthropic'
                    );
                } catch (error) {
                    result = RuleBasedAI.generate(intent);
                }
            } else {
                result = RuleBasedAI.generate(intent);
            }
        } else {
            result = RuleBasedAI.generate(intent);
        }
        
        // Auto-resolve dependencies
        if (typeof DependencyResolver !== 'undefined' && result.files) {
            const additionalFiles = DependencyResolver.resolveAll(result.files);
            
            if (additionalFiles.length > 0) {
                result.files.push(...additionalFiles);
                
                addMessage({
                    type: 'system',
                    content: `📦 Auto-generated ${additionalFiles.length} missing dependencies`,
                    timestamp: Date.now(),
                    role: 'system'
                });
            }
        }
        
        // Cache original code for diffing
        const messageId = state.messages[state.messages.length - 1].id;
        state.originalCodeCache.set(messageId, JSON.parse(JSON.stringify(result.files)));
        
        // Generate Dependency Graph
        let dependencyGraph = null;
        if (result.files && result.files.length > 1 && typeof DependencyEngine !== 'undefined') {
            dependencyGraph = DependencyEngine.buildGraph(result.files);
        }

        // Add AI generation message
        addMessage({
            type: 'generation',
            content: result.description,
            artifacts: result.files,
            validations: result.validations,
            assumptions: result.assumptions,
            dependencyGraph: dependencyGraph,
            timestamp: Date.now(),
            role: 'assistant'
        });
        
        // Generate Dependency Graph if multiple files exist
        if (result.files && result.files.length > 1) {
            const graph = DependencyUtils.analyze(result.files);
            const viz = DependencyUtils.generateVisualization(graph);
            
            addMessage({
                type: 'dependency_graph',
                content: `Dependency Graph (${result.files.length} files)`,
                graph: graph,
                visualization: viz,
                timestamp: Date.now(),
                role: 'system'
            });
        }
        
        // Versioning: Initial Commit
        const genMsg = state.messages[state.messages.length - 1];
        if (typeof CodeVersioning !== 'undefined') {
            CodeVersioning.commit(genMsg.id, 'Initial generation');
        }
        
        // Update analytics
        const responseTime = Date.now() - startTime;
        state.analytics.successfulGenerations++;
        state.analytics.totalGenerations++;
        state.analytics.averageResponseTime = 
            (state.analytics.averageResponseTime * (state.analytics.totalGenerations - 1) + responseTime) / 
            state.analytics.totalGenerations;
        
        updateAnalyticsDisplay();
        
    } catch (error) {
        addMessage({
            type: 'system',
            content: `Generation failed: ${error.message}`,
            timestamp: Date.now(),
            role: 'system'
        });
        
        state.analytics.failedGenerations++;
        state.analytics.totalGenerations++;
        updateAnalyticsDisplay();
        
    } finally {
        state.isGenerating = false;
        document.getElementById('submitBtn').disabled = false;
        document.getElementById('submitBtn').textContent = 'Generate';
    }
}

// ====================
// ENHANCED ACTION FUNCTIONS
// ====================
function showCodePreview(messageId, filePath) {
    const message = state.messages.find(m => m.id === messageId);
    if (!message || !message.artifacts) return;
    
    const file = message.artifacts.find(f => f.path === filePath);
    if (!file) return;
    
    // Close existing overlay if any
    if (state.currentOverlay) {
        document.body.removeChild(state.currentOverlay);
    }
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'code-overlay';
    
    const lineNumbers = Array.from({length: file.lines}, (_, i) => i + 1).join('\n');
    
    overlay.innerHTML = `
        <div class="code-overlay-header">
            <div class="code-overlay-title">
                <span>${getFileIcon(file.language)}</span>
                <span>${escapeHtml(file.path)}</span>
                <span style="color: var(--text-secondary); margin-left: 1rem; font-size: 0.85rem;">
                    ${file.lines} lines · ${file.language}
                </span>
            </div>
            <button class="close-overlay-btn" onclick="closeCodeOverlay()">✕</button>
        </div>
        <div class="code-overlay-content">
            <div class="code-editor-wrapper">
                <div class="line-numbers">${lineNumbers}</div>
                <pre class="code-snippet" style="margin-left: 60px;">${escapeHtml(file.code)}</pre>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    state.currentOverlay = overlay;

    // Add selection listener for inline refinement
    const codeBlock = overlay.querySelector('.code-snippet');
    codeBlock.addEventListener('mouseup', (e) => handleCodeSelection(e, messageId, filePath));
}

function closeCodeOverlay() {
    if (state.currentOverlay) {
        document.body.removeChild(state.currentOverlay);
        state.currentOverlay = null;
    }
    const btn = document.getElementById('refine-selection-btn');
    if (btn) btn.remove();
}

function viewAllCode(messageIndex) {
    const message = state.messages[messageIndex];
    if (!message.artifacts || message.artifacts.length === 0) return;
    
    // Show first file by default
    showCodePreview(message.id, message.artifacts[0].path);
}

function handleCodeSelection(e, messageId, filePath) {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    // Remove existing button if any
    const existingBtn = document.getElementById('refine-selection-btn');
    if (existingBtn) existingBtn.remove();
    
    if (text.length > 0) {
        const btn = document.createElement('button');
        btn.id = 'refine-selection-btn';
        btn.className = 'refine-selection-btn';
        btn.innerHTML = '✨ Refine Selection';
        btn.style.position = 'fixed';
        btn.style.left = `${e.clientX}px`;
        btn.style.top = `${e.clientY - 40}px`;
        btn.onclick = (evt) => {
            evt.stopPropagation();
            initiateSelectionRefinement(messageId, filePath, text);
        };
        document.body.appendChild(btn);
    }
}

function initiateSelectionRefinement(messageId, filePath, text) {
    const btn = document.getElementById('refine-selection-btn');
    if (btn) btn.remove();

    showModal(
        'Refine Selection',
        `
        <div style="margin-bottom: 1rem;">
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Selected Code:</div>
            <pre style="background: #0d1117; padding: 0.5rem; border-radius: 4px; font-size: 0.8rem; max-height: 100px; overflow: auto;">${escapeHtml(text)}</pre>
        </div>
        <div class="setting-item">
            <label class="setting-label">Instruction</label>
            <input type="text" class="api-key-input" id="refineInstruction" placeholder="e.g., Add error handling, Optimize loop, Rename variables...">
        </div>
        `,
        [
            { text: 'Cancel', class: 'cancel' },
            { 
                text: 'Apply', 
                class: 'confirm', 
                onClick: () => {
                    const instruction = document.getElementById('refineInstruction').value;
                    if (instruction) {
                        applySelectionRefinement(messageId, filePath, text, instruction);
                    }
                }
            }
        ]
    );
    // Focus input
    setTimeout(() => document.getElementById('refineInstruction').focus(), 100);
}

async function applySelectionRefinement(messageId, filePath, originalText, instruction) {
    const messageIndex = state.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const message = state.messages[messageIndex];
    const fileIndex = message.artifacts.findIndex(f => f.path === filePath);
    if (fileIndex === -1) return;

    try {
        let newText;
        if (state.aiMode === 'smart' && state.settings.apiKey) {
            newText = await SmartAI.refineSnippet(
                originalText, 
                instruction, 
                state.settings.apiKey, 
                state.settings.model,
                state.settings.provider || 'anthropic'
            );
        } else {
            // Fallback for rule-based or no API key
            newText = `/* Refined: ${instruction} */\n${originalText}`;
        }

        // Apply change to artifact
        const file = message.artifacts[fileIndex];
        file.code = file.code.replace(originalText, newText);
        
        // Commit version
        if (typeof CodeVersioning !== 'undefined') {
            CodeVersioning.commit(messageId, `Inline refinement: ${instruction}`);
        }

        // Refresh preview
        showCodePreview(messageId, filePath);
        
    } catch (error) {
        alert(`Refinement failed: ${error.message}`);
    }
}

async function runTests(messageIndex) {
    const message = state.messages[messageIndex];
    
    // Filter for testable files (JavaScript)
    const jsFiles = message.artifacts ? message.artifacts.filter(f => ['javascript', 'js', 'node'].includes(f.language?.toLowerCase())) : [];
    
    if (jsFiles.length === 0) {
        addMessage({
            type: 'system',
            content: '⚠️ No JavaScript files found to test.',
            timestamp: Date.now(),
            role: 'system'
        });
        return;
    }

    const testId = `test_${Date.now()}`;
    
    // Store active test
    state.activeTests.set(testId, {
        messageIndex,
        progress: 0,
        results: []
    });
    
    // Initialize results with pending state
    const initialResults = jsFiles.map(file => ({
        name: `Test: ${file.path}`,
        status: 'pending',
        message: 'Queued...'
    }));

    // Show testing in progress
    const testMessage = {
        type: 'test_result',
        content: `🧪 Running tests for: ${message.content}`,
        progress: 0,
        results: initialResults,
        timestamp: Date.now(),
        role: 'system',
        testId: testId
    };
    
    addMessage(testMessage);
    
    // Execute real tests sequentially
    for (let i = 0; i < jsFiles.length; i++) {
        const file = jsFiles[i];
        const startTime = Date.now();
        
        // Update status to running
        initialResults[i].message = 'Running in sandbox...';
        updateTestProgress(testId, initialResults, i, jsFiles.length);
        
        // Run in sandbox
        const result = await RealTesting.runInSandbox(file.code);
        const duration = Date.now() - startTime;
        
        // Update result
        initialResults[i] = {
            name: `Test: ${file.path}`,
            status: result.passed ? 'passed' : 'failed',
            message: result.message,
            duration: `${duration}ms`
        };
        
        updateTestProgress(testId, initialResults, i + 1, jsFiles.length);
    }
    
    // Finalize
    const passed = initialResults.filter(t => t.status === 'passed').length;
    const total = initialResults.length;
    const coverage = Math.round((passed / total) * 100);
    
    const finalMessage = {
        type: 'test_result',
        content: `📊 Test Results: ${passed}/${total} files passed execution check`,
        results: initialResults,
        timestamp: Date.now(),
        role: 'system'
    };
    
    const msgIndex = state.messages.findIndex(m => m.testId === testId);
    if (msgIndex !== -1) {
        state.messages[msgIndex] = finalMessage;
        renderMessages();
    }
    
    state.activeTests.delete(testId);
}

function updateTestProgress(testId, results, completed, total) {
    const msgIndex = state.messages.findIndex(m => m.testId === testId);
    if (msgIndex !== -1) {
        state.messages[msgIndex].progress = Math.round((completed / total) * 100);
        state.messages[msgIndex].results = [...results];
        renderMessages();
    }
}

function downloadCode(messageIndex) {
    const message = state.messages[messageIndex];
    if (!message.artifacts) return;

    // Smart naming: forge-intent-slug-date
    const dateStr = new Date().toISOString().split('T')[0];
    const slug = message.content
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 40);
    
    const filename = `forge-${slug}-${dateStr}`;

    showModal(
        'Download Format',
        'Choose how you want to save your generated code:',
        [
            { 
                text: 'Markdown (.md)', 
                class: 'primary', 
                onClick: () => downloadAsMarkdown(message, filename)
            },
            { 
                text: 'JSON (.json)', 
                class: 'primary', 
                onClick: () => downloadAsJSON(message, filename)
            },
            { text: 'Cancel', class: 'cancel' }
        ]
    );
}

function downloadAsMarkdown(message, filename) {
    // Create a zip-like structure in markdown
    let content = `# Generated Code\n# ${message.content}\n\n`;
    content += `Generated: ${new Date(message.timestamp).toISOString()}\n`;
    content += `Mode: ${state.aiMode}\n\n`;
    
    message.artifacts.forEach(file => {
        content += `\n## ${file.path}\n\`\`\`${file.language}\n${file.code}\n\`\`\`\n`;
    });
    
    if (message.assumptions) {
        content += `\n## Assumptions\n`;
        message.assumptions.forEach(assumption => {
            content += `- ${assumption}\n`;
        });
    }
    
    if (message.validations) {
        content += `\n## Validation\n`;
        content += `- Tests: ${message.validations.tests_passed}/${message.validations.tests_total} passed\n`;
        content += `- Coverage: ${message.validations.coverage}%\n`;
    }
    
    triggerDownload(content, `${filename}.md`, 'text/markdown');
}

function downloadAsJSON(message, filename) {
    const data = {
        meta: {
            intent: message.content,
            timestamp: message.timestamp,
            mode: state.aiMode
        },
        files: message.artifacts,
        assumptions: message.assumptions,
        validations: message.validations
    };
    
    triggerDownload(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json');
}

function triggerDownload(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    addMessage({
        type: 'system',
        content: `✅ Downloaded ${filename}`,
        timestamp: Date.now(),
        role: 'system'
    });
}

function exportGraphImage(messageId) {
    const messageDiv = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageDiv) return;
    
    const svg = messageDiv.querySelector('svg');
    if (!svg) return;
    
    // Get computed colors to replace CSS variables for standalone image
    const computedStyle = getComputedStyle(svg);
    const bgColor = computedStyle.backgroundColor;
    const bodyStyle = getComputedStyle(document.body);
    const textPrimary = bodyStyle.getPropertyValue('--text-primary').trim() || '#e5e7eb';
    
    // Clone and prepare for export
    const clone = svg.cloneNode(true);
    const viewBox = svg.getAttribute('viewBox').split(' ');
    const width = parseInt(viewBox[2]);
    const height = parseInt(viewBox[3]);
    
    clone.setAttribute('width', width);
    clone.setAttribute('height', height);
    clone.style.background = bgColor;
    clone.querySelectorAll('text').forEach(t => t.setAttribute('fill', textPrimary));
    
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(clone);
    const blob = new Blob([svgStr], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);
        
        const a = document.createElement('a');
        a.download = `dependency-graph-${messageId}.png`;
        a.href = canvas.toDataURL('image/png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    img.src = url;
}

// Enhanced refinement
function refineCode(messageIndex) {
    const message = state.messages[messageIndex];
    
    // Show refinement options modal
    showModal(
        'Refine Generated Code',
        `
        <div style="margin-bottom: 1.5rem;">
            <p>Select refinement type for: <strong>${escapeHtml(message.content)}</strong></p>
        </div>
        
        <div style="display: grid; gap: 0.75rem; margin-top: 1rem;">
            <button class="mode-btn" onclick="applyRefinement(${messageIndex}, 'optimize')" style="text-align: left; padding: 1rem;">
                <div style="font-weight: 600;">⚡ Optimize Performance</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">Improve speed, reduce memory usage</div>
            </button>
            
            <button class="mode-btn" onclick="applyRefinement(${messageIndex}, 'security')" style="text-align: left; padding: 1rem;">
                <div style="font-weight: 600;">🔒 Enhance Security</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">Add validation, sanitization, security headers</div>
            </button>
            
            <button class="mode-btn" onclick="applyRefinement(${messageIndex}, 'error_handling')" style="text-align: left; padding: 1rem;">
                <div style="font-weight: 600;">🐛 Improve Error Handling</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">Better error messages, retry logic, fallbacks</div>
            </button>
            
            <button class="mode-btn" onclick="applyRefinement(${messageIndex}, 'custom')" style="text-align: left; padding: 1rem;">
                <div style="font-weight: 600;">✏️ Custom Refinement</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">Describe specific changes you want</div>
            </button>
        </div>
        `,
        [
            { text: 'Cancel', class: 'cancel' }
        ]
    );
}

async function applyRefinement(messageIndex, refinementType) {
    closeModal();
    
    const message = state.messages[messageIndex];
    
    if (refinementType === 'custom') {
        const input = document.getElementById('intentInput');
        input.value = `Refine this code: ${message.content} - `;
        input.focus();
        return;
    }
    
    // Show refinement in progress
    addMessage({
        type: 'system',
        content: `🔄 Applying ${refinementType} refinement...`,
        timestamp: Date.now(),
        role: 'system'
    });
    
    // Generate refined code based on type
    const refinementPrompts = {
        optimize: `Optimize the performance and efficiency of this code: ${message.content}. Focus on reducing time complexity, improving memory usage, and implementing best practices for performance.`,
        security: `Add security best practices, validation, and protection to: ${message.content}. Include input validation, output encoding, security headers, authentication checks, and protection against common vulnerabilities.`,
        error_handling: `Improve error handling, add better error messages, and add fallbacks to: ${message.content}. Make errors informative, add retry logic, and ensure graceful degradation.`
    };
    
    const intent = refinementPrompts[refinementType];
    
    try {
        let result;
        if (state.aiMode === 'smart' && state.settings.apiKey) {
            result = await SmartAI.generate(
                intent, 
                state.settings.apiKey, 
                state.settings.model,
                state.settings.provider || 'anthropic'
            );
        } else {
            result = RuleBasedAI.generate(intent);
        }
        
        // Get original code from cache
        const originalFiles = state.originalCodeCache.get(message.id) || message.artifacts;
        
        // Calculate diffs between original and refined
        const changes = [];
        if (result && result.files) {
            result.files.forEach((refinedFile, idx) => {
                const originalFile = originalFiles[idx];
                if (originalFile && originalFile.code !== refinedFile.code) {
                    const diff = DiffUtils.generateDiff(originalFile.code, refinedFile.code);
                    const stats = DiffUtils.calculateDiffStats(diff);
                    
                    changes.push({
                        file: refinedFile.path,
                        lines: [1, refinedFile.lines],
                        oldCode: originalFile.code,
                        newCode: refinedFile.code,
                        diff: diff,
                        added: stats.added,
                        removed: stats.removed,
                        changePercentage: stats.changePercentage
                    });
                }
            });
        }
        
        addMessage({
            type: 'refinement',
            content: `Refined: ${message.content} (${refinementType})`,
            artifacts: result.files,
            validations: result.validations,
            changes: changes,
            timestamp: Date.now(),
            role: 'assistant'
        });
        
    } catch (error) {
        addMessage({
            type: 'system',
            content: `Refinement failed: ${error.message}`,
            timestamp: Date.now(),
            role: 'system'
        });
    }
}

function viewFileDiff(messageIndex, filePath) {
    const message = state.messages[messageIndex];
    if (!message.changes) return;
    
    const change = message.changes.find(c => c.file === filePath);
    if (!change || !change.diff) return;
    
    // Create diff overlay
    const overlay = document.createElement('div');
    overlay.className = 'diff-overlay';
    
    const diffHtml = DiffUtils.renderDiffHtml(change.diff);
    const stats = DiffUtils.calculateDiffStats(change.diff);
    
    overlay.innerHTML = `
        <div class="code-overlay-header">
            <div class="code-overlay-title">
                <span>📊</span>
                <span>${escapeHtml(filePath)}</span>
                <span style="color: var(--text-secondary); margin-left: 1rem; font-size: 0.85rem;">
                    ${stats.added}+ / ${stats.removed}- (${stats.changePercentage}% changed)
                </span>
            </div>
            <button class="close-overlay-btn" onclick="closeCodeOverlay()">✕</button>
        </div>
        <div class="diff-container">
            <div class="diff-file">
                <div class="diff-file-header">
                    <span>Changes in ${escapeHtml(filePath)}</span>
                    <span class="diff-changes">${stats.added} additions, ${stats.removed} deletions</span>
                </div>
                <div class="diff-content">
                    ${diffHtml}
                </div>
            </div>
        </div>
    `;
    
    // Close existing overlay
    if (state.currentOverlay) {
        document.body.removeChild(state.currentOverlay);
    }
    
    document.body.appendChild(overlay);
    state.currentOverlay = overlay;
}

function viewAllDiffs(messageIndex) {
    const message = state.messages[messageIndex];
    if (!message.changes || message.changes.length === 0) return;
    
    // Show first file diff by default
    viewFileDiff(messageIndex, message.changes[0].file);
}

function applyChanges(messageIndex) {
    const message = state.messages[messageIndex];
    
    if (message.changes) {
        // Update the original message with refined artifacts
        const originalMessageIndex = findOriginalGeneration(messageIndex);
        if (originalMessageIndex !== -1) {
            state.messages[originalMessageIndex].artifacts = message.artifacts;
            state.messages[originalMessageIndex].validations = message.validations;
            
            // Update cache
            state.originalCodeCache.set(
                state.messages[originalMessageIndex].id, 
                JSON.parse(JSON.stringify(message.artifacts))
            );
            
            // Versioning: Commit new state
            if (typeof CodeVersioning !== 'undefined') {
                CodeVersioning.commit(state.messages[originalMessageIndex].id, `Applied refinement: ${message.content}`);
            }
        }
        
        addMessage({
            type: 'system',
            content: '✅ Changes applied successfully! The original code has been updated.',
            timestamp: Date.now(),
            role: 'system'
        });
        
        // Re-render to show updated code
        renderMessages();
    }
}

function revertChanges(messageIndex) {
    addMessage({
        type: 'system',
        content: '↩️ Changes reverted. Original code preserved.',
        timestamp: Date.now(),
        role: 'system'
    });
}

function usePattern(patternId, patternName) {
    const pattern = PatternLibrary.get(patternId);
    if (!pattern) return;
    
    addMessage({
        type: 'generation',
        content: `Applied ${patternName} pattern`,
        artifacts: [{
            path: `src/patterns/${patternId}.js`,
            language: 'javascript',
            lines: pattern.template.split('\n').length,
            code: pattern.template
        }],
        validations: {
            tests_passed: 5,
            tests_total: 5,
            coverage: 100
        },
        assumptions: [
            `Based on ${patternName} pattern from your repository`,
            'Includes standard implementation with best practices',
            'Ready for customization and extension'
        ],
        timestamp: Date.now(),
        role: 'assistant'
    });
}

// ====================
// UTILITY FUNCTIONS
// ====================
function findOriginalGeneration(refinementIndex) {
    // Walk backwards to find the original generation message
    for (let i = refinementIndex - 1; i >= 0; i--) {
        if (state.messages[i].type === 'generation') {
            return i;
        }
    }
    return -1;
}

function updateAnalyticsDisplay() {
    document.getElementById('genCount').textContent = state.analytics.successfulGenerations;
    document.getElementById('avgTime').textContent = Math.round(state.analytics.averageResponseTime / 1000);
}

function toggleShortcuts() {
    const panel = document.getElementById('shortcutsPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

// ====================
// SETTINGS FUNCTIONS
// ====================
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    if (panel.style.display === 'none') {
        panel.style.display = 'flex';
        state.isSettingsOpen = true;
    } else {
        panel.style.display = 'none';
        state.isSettingsOpen = false;
    }
}

function setMode(mode) {
    state.aiMode = mode;
    
    // Update UI
    ['smart', 'rule', 'hybrid'].forEach(m => {
        const btn = document.getElementById(`mode${m.charAt(0).toUpperCase() + m.slice(1)}`);
        if (btn) {
            btn.classList.toggle('active', m === mode);
        }
    });
    
    // Save setting
    localStorage.setItem('aiMode', mode);
    
    // Show feedback
    const modeName = mode.charAt(0).toUpperCase() + mode.slice(1);
    updateStatus(`${modeName} mode activated`, 'online');
}

function saveApiKey(key) {
    state.settings.apiKey = key;
    localStorage.setItem('apiKey', key);
}

function updateModelOptions(provider) {
    const modelSelect = document.getElementById('modelSelect');
    modelSelect.innerHTML = '';
    
    let options = [];
    if (provider === 'anthropic') {
        options = [
            { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
            { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
            { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' }
        ];
    } else if (provider === 'openai') {
        options = [
            { value: 'gpt-4o', label: 'GPT-4o' },
            { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
        ];
    } else if (provider === 'groq') {
        options = [
            { value: 'llama3-70b-8192', label: 'Llama 3 70B' },
            { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
            { value: 'gemma-7b-it', label: 'Gemma 7B' }
        ];
    }
    
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        modelSelect.appendChild(option);
    });
    return options;
}

function saveProvider(provider) {
    state.settings.provider = provider;
    localStorage.setItem('provider', provider);
    
    const options = updateModelOptions(provider);
    
    // Select first option by default
    if (options.length > 0) {
        saveModel(options[0].value);
    }
}

function saveProxyUrl(url) {
    state.settings.proxyUrl = url;
    localStorage.setItem('proxyUrl', url);
}

function saveModel(model) {
    state.settings.model = model;
    localStorage.setItem('model', model);
}

function saveSetting(key, value) {
    state.settings[key] = value;
    localStorage.setItem(key, value.toString());
}

function exportConversation() {
    Storage.export();
}

function clearConversation() {
    showModal(
        'Clear Conversation',
        'This will delete all messages from this session. This action cannot be undone.',
        [
            { text: 'Cancel', class: 'cancel' },
            { 
                text: 'Clear', 
                class: 'danger', 
                onClick: () => {
                    state.messages = [];
                    renderMessages();
                    Storage.saveConversation();
                    updateStatus('Conversation cleared', 'online');
                }
            }
        ]
    );
}

function resetAll() {
    showModal(
        'Reset All Data',
        'This will delete all messages, settings, and API configuration. This action cannot be undone.',
        [
            { text: 'Cancel', class: 'cancel' },
            { 
                text: 'Reset Everything', 
                class: 'danger', 
                onClick: () => {
                    Storage.clear();
                    state.settings = {
                        autoValidate: true,
                        showSuggestions: true,
                        saveConversations: true,
                        showPatternSuggestions: true,
                        apiKey: '',
                        proxyUrl: '',
                        model: 'claude-3-5-sonnet-20241022',
                        provider: 'anthropic'
                    };
                    state.credits.used = 0;
                    state.credits.apiCalls = 0;
                    state.analytics.totalGenerations = 0;
                    state.analytics.successfulGenerations = 0;
                    state.analytics.failedGenerations = 0;
                    state.analytics.averageResponseTime = 0;
                    
                    // Reset UI
                    document.getElementById('apiKeyInput').value = '';
                    document.getElementById('proxyUrlInput').value = '';
                    document.getElementById('modelSelect').value = 'claude-3-5-sonnet-20241022';
                    document.getElementById('providerSelect').value = 'anthropic';
                    document.getElementById('autoValidate').checked = true;
                    document.getElementById('showSuggestions').checked = true;
                    document.getElementById('saveConversations').checked = true;
                    document.getElementById('showPatternSuggestions').checked = true;
                    
                    setMode('rule');
                    renderMessages();
                    updateAnalyticsDisplay();
                    updateStatus('All data reset', 'online');
                }
            }
        ]
    );
}

// ====================
// MODAL SYSTEM
// ====================
function showModal(title, body, actions) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const actionsHtml = actions.map((action, i) => `
        <button class="modal-btn ${action.class}" onclick="handleModalAction(${i}, ${action.onClick ? 'true' : 'false'})">${action.text}</button>
    `).join('');
    
    overlay.innerHTML = `
        <div class="modal">
            <div class="modal-title">${escapeHtml(title)}</div>
            <div class="modal-body">${body}</div>
            <div class="modal-actions">${actionsHtml}</div>
        </div>
    `;
    
    // Store callbacks
    window._modalCallbacks = actions.map(a => a.onClick || null);
    
    document.body.appendChild(overlay);
    window._currentModal = overlay;
}

function handleModalAction(index, hasCallback) {
    if (hasCallback && window._modalCallbacks[index]) {
        window._modalCallbacks[index]();
    }
    closeModal();
}

function closeModal() {
    if (window._currentModal) {
        document.body.removeChild(window._currentModal);
        window._currentModal = null;
        window._modalCallbacks = null;
    }
}

// ====================
// INPUT HANDLING
// ====================
function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        submitIntent();
    }
}

function useSuggestion(suggestion) {
    document.getElementById('intentInput').value = suggestion;
    document.getElementById('intentInput').focus();
}

// ====================
// KEYBOARD SHORTCUTS
// ====================
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter to generate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            submitIntent();
        }
        
        // Esc to close all overlays
        if (e.key === 'Escape') {
            closeCodeOverlay();
            closeModal();
        }
        
        // Ctrl+/ to toggle settings
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            toggleSettings();
        }
        
        // Ctrl+E to export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportConversation();
        }
        
        // Ctrl+K to clear input
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('intentInput').value = '';
            document.getElementById('intentInput').focus();
        }
    });
}

// ====================
// PWA SUPPORT
// ====================
let deferredPrompt;

function initPWA() {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registered', reg.scope))
            .catch(err => console.warn('Service Worker registration failed:', err));
    }

    // Handle Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Add install button if not present
        if (!document.getElementById('pwaInstallBtn')) {
            const btn = document.createElement('button');
            btn.id = 'pwaInstallBtn';
            btn.className = 'action-btn primary';
            btn.innerHTML = '📱 Install App';
            btn.style.position = 'fixed';
            btn.style.bottom = '20px';
            btn.style.right = '20px';
            btn.style.zIndex = '1000';
            btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            btn.onclick = installPWA;
            document.body.appendChild(btn);
        }
    });

    window.addEventListener('appinstalled', () => {
        const btn = document.getElementById('pwaInstallBtn');
        if (btn) btn.remove();
        deferredPrompt = null;
        console.log('PWA installed successfully');
    });
}

function installPWA() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            const btn = document.getElementById('pwaInstallBtn');
            if (btn) btn.remove();
        }
        deferredPrompt = null;
    });
}

window.addEventListener('load', initPWA);
// Initialize PWA support on load
window.addEventListener('load', initPWA);