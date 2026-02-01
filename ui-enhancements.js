// ====================
// DEPENDENCY-ENHANCED UI INTEGRATION
// ====================
// Add this to your existing ui.js or create as ui-enhancements.js

/**
 * Enhanced submitIntent with automatic dependency resolution
 */
async function submitIntentWithDependencies() {
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

    // Pattern suggestions (if enabled)
    if (state.settings.showPatternSuggestions && typeof PatternLibrary !== 'undefined') {
        const patterns = PatternLibrary.suggest(intent);
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
        // STEP 1: Initial code generation
        if (state.aiMode === 'smart' && state.settings.apiKey) {
            result = await SmartAI.generate(intent, state.settings.apiKey, state.settings.model);
        } else if (state.aiMode === 'hybrid') {
            if (state.settings.apiKey) {
                try {
                    result = await SmartAI.generate(intent, state.settings.apiKey, state.settings.model);
                } catch (error) {
                    result = RuleBasedAI.generate(intent);
                }
            } else {
                result = RuleBasedAI.generate(intent);
            }
        } else {
            result = RuleBasedAI.generate(intent);
        }
        
        // STEP 2: Dependency analysis and auto-generation
        if (typeof DependencyEngine !== 'undefined' && result.files) {
            const graph = DependencyEngine.buildGraph(result.files);
            const missing = DependencyEngine.findMissing(graph);
            
            if (missing.length > 0) {
                addMessage({
                    type: 'system',
                    content: `🔍 Analyzing dependencies... Found ${missing.length} missing ${missing.length === 1 ? 'file' : 'files'}`,
                    timestamp: Date.now(),
                    role: 'system'
                });
                
                const generated = DependencyEngine.autoGenerate(missing);
                
                if (generated.length > 0) {
                    result.files.push(...generated);
                    
                    addMessage({
                        type: 'system',
                        content: `✅ Auto-generated: ${generated.map(f => f.path.split('/').pop()).join(', ')}`,
                        timestamp: Date.now(),
                        role: 'system'
                    });
                }
            }
        }
        
        // STEP 3: Build final dependency graph
        const finalGraph = typeof DependencyEngine !== 'undefined' ? 
            DependencyEngine.buildGraph(result.files) : null;
        
        // Cache original code for versioning
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        state.originalCodeCache.set(messageId, JSON.parse(JSON.stringify(result.files)));
        
        // STEP 4: Add generation message with graph
        addMessage({
            type: 'generation',
            content: result.description,
            artifacts: result.files,
            validations: result.validations,
            assumptions: result.assumptions,
            dependencyGraph: finalGraph,
            timestamp: Date.now(),
            role: 'assistant',
            id: messageId
        });
        
        // Update analytics
        const responseTime = Date.now() - startTime;
        state.analytics.successfulGenerations++;
        state.analytics.totalGenerations++;
        state.analytics.averageResponseTime = 
            (state.analytics.averageResponseTime * (state.analytics.totalGenerations - 1) + responseTime) / 
            state.analytics.totalGenerations;
        
        if (typeof updateAnalyticsDisplay === 'function') {
            updateAnalyticsDisplay();
        }
        
    } catch (error) {
        addMessage({
            type: 'system',
            content: `Generation failed: ${error.message}`,
            timestamp: Date.now(),
            role: 'system'
        });
        
        state.analytics.failedGenerations++;
        state.analytics.totalGenerations++;
        
        if (typeof updateAnalyticsDisplay === 'function') {
            updateAnalyticsDisplay();
        }
        
    } finally {
        state.isGenerating = false;
        document.getElementById('submitBtn').disabled = false;
        document.getElementById('submitBtn').textContent = 'Generate';
    }
}

/**
 * Render dependency graph in message
 */
function renderDependencyGraph(graph, messageId) {
    if (!graph || !graph.nodes || graph.nodes.length === 0) {
        return '';
    }
    
    const containerId = `dep-graph-${messageId}`;
    const autoGenCount = graph.nodes.filter(n => n.autoGenerated).length;
    const missingCount = graph.edges.filter(e => !e.exists).length;
    
    // Schedule graph rendering after DOM update
    setTimeout(() => {
        if (typeof DependencyEngine !== 'undefined') {
            DependencyEngine.renderGraph(graph, containerId);
        }
    }, 100);
    
    return `
        <div class="dependency-graph-container" style="background: var(--bg-tertiary); border-radius: 8px; padding: 1rem; margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <div style="font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                    <span>📊</span>
                    <span>Dependency Graph</span>
                </div>
                <div style="color: var(--text-secondary); font-size: 0.85rem;">
                    ${graph.nodes.length} files • ${graph.edges.length} dependencies
                    ${autoGenCount > 0 ? ` • <span style="color: var(--accent-green)">${autoGenCount} auto-generated</span>` : ''}
                    ${missingCount > 0 ? ` • <span style="color: var(--accent-red)">${missingCount} missing</span>` : ''}
                </div>
            </div>
            <div id="${containerId}" style="min-height: 300px; background: var(--bg-primary); border-radius: 4px;"></div>
            <div style="display: flex; gap: 1rem; margin-top: 1rem; font-size: 0.85rem; color: var(--text-secondary); padding: 0.75rem; background: var(--bg-secondary); border-radius: 4px;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: var(--accent-blue);"></div>
                    <span>Generated</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: var(--accent-green);"></div>
                    <span>Auto-generated</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 20px; height: 2px; background: var(--border-color);"></div>
                    <span>Dependency</span>
                </div>
                ${missingCount > 0 ? `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="width: 20px; height: 2px; background: var(--accent-red); border-top: 2px dashed;"></div>
                    <span>Missing</span>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Enhanced message rendering with dependency graph support
 * Add this to your renderMessages() function in the generation block
 */
function enhanceGenerationMessage(msg) {
    // This should be called in your existing renderMessages() for 'generation' type messages
    const dependencyGraphHtml = msg.dependencyGraph ? 
        renderDependencyGraph(msg.dependencyGraph, msg.id) : '';
    
    return dependencyGraphHtml;
}

/**
 * Override submitIntent with dependency-aware version
 * Call this after all modules are loaded
 */
function enableDependencyAutoGeneration() {
    if (typeof window !== 'undefined') {
        // Store original if it exists
        if (typeof window.submitIntent !== 'undefined') {
            window.submitIntentOriginal = window.submitIntent;
        }
        
        // Replace with enhanced version
        window.submitIntent = submitIntentWithDependencies;
        
        console.log('[FORGE] Dependency auto-generation enabled');
    }
}

// Auto-enable when this script loads (if in browser)
if (typeof window !== 'undefined' && document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enableDependencyAutoGeneration);
} else if (typeof window !== 'undefined') {
    enableDependencyAutoGeneration();
}