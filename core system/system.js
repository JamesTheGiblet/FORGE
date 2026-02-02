// ====================
// FORGE PATTERN SYSTEM
// Central registry for all code generation patterns
// ====================

class PatternRegistry {
    constructor() {
        this.patterns = new Map();
        this.listeners = new Set();
        this.initialized = false;
    }

    /**
     * Register a new pattern
     * @param {string} id - Unique identifier
     * @param {Object} definition - Pattern definition
     */
    register(id, definition) {
        const pattern = {
            id,
            type: definition.type || 'general', // backend, frontend, ai, etc.
            name: definition.name || id,
            description: definition.description || '',
            keywords: definition.keywords || [],
            generate: definition.generate || definition.template, // Normalize
            dependencies: definition.dependencies || {},
            ...definition
        };

        this.patterns.set(id, pattern);
        console.log(`[PatternSystem] Registered: ${id}`);
        
        // Notify listeners
        this.notifyListeners(pattern);
    }

    notifyListeners(pattern) {
        this.listeners.forEach(listener => listener(pattern));
    }

    /**
     * Subscribe to pattern updates
     * @param {Function} callback 
     */
    onRegister(callback) {
        this.listeners.add(callback);
        // Replay existing patterns
        this.patterns.forEach(p => callback(p));
    }

    get(id) {
        return this.patterns.get(id);
    }

    getAll() {
        return Array.from(this.patterns.values());
    }

    /**
     * Find patterns matching an intent
     */
    findMatches(intent) {
        const lowerIntent = intent.toLowerCase();
        const matches = [];

        this.patterns.forEach(pattern => {
            if (pattern.keywords.some(k => lowerIntent.includes(k))) {
                matches.push(pattern);
            }
        });

        return matches;
    }
}

const PatternSystem = new PatternRegistry();

// Expose globally
if (typeof window !== 'undefined') {
    window.PatternSystem = PatternSystem;
}
if (typeof module !== 'undefined') {
    module.exports = PatternSystem;
}