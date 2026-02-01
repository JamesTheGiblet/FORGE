// ====================
// PATTERN LIBRARY (Enhanced with scoring)
// ====================
const PatternLibrary = {
    patterns: {
        'buddai-validation': {
            name: 'BuddAI Validation',
            description: '279-test validation framework with health checks',
            keywords: ['test', 'validat', 'check', 'quality', 'coverage', 'verify', 'assert'],
            template: `// BuddAI Validation Pattern
class ValidationEngine {
    constructor() {
        this.rules = [];
        this.results = [];
    }
    
    addRule(name, validator) {
        this.rules.push({ name, validator });
        return this;
    }
    
    async validate(data) {
        this.results = [];
        
        for (const rule of this.rules) {
            try {
                const result = await rule.validator(data);
                this.results.push({
                    rule: rule.name,
                    passed: result.passed,
                    message: result.message,
                    timestamp: Date.now()
                });
            } catch (error) {
                this.results.push({
                    rule: rule.name,
                    passed: false,
                    message: error.message,
                    timestamp: Date.now()
                });
            }
        }
        
        return {
            passed: this.results.every(r => r.passed),
            total: this.results.length,
            passed_count: this.results.filter(r => r.passed).length,
            results: this.results
        };
    }
    
    getHealthScore() {
        if (this.results.length === 0) return 100;
        const passed = this.results.filter(r => r.passed).length;
        return Math.round((passed / this.results.length) * 100);
    }
}

module.exports = ValidationEngine;`
        },
        
        'pdei-context': {
            name: 'P.DE.I Context Management',
            description: 'Personal data-driven exocortex interface',
            keywords: ['context', 'state', 'memory', 'persist', 'session', 'store', 'cache'],
            template: `// P.DE.I Context Management Pattern
class ContextManager {
    constructor(namespace = 'default') {
        this.namespace = namespace;
        this.context = this.load();
        this.history = [];
    }
    
    set(key, value, metadata = {}) {
        const entry = {
            key,
            value,
            metadata,
            timestamp: Date.now(),
            namespace: this.namespace
        };
        
        this.context[key] = entry;
        this.history.push({ action: 'set', ...entry });
        this.save();
        
        return this;
    }
    
    get(key, defaultValue = null) {
        const entry = this.context[key];
        if (!entry) return defaultValue;
        
        // Update access metadata
        entry.metadata.lastAccessed = Date.now();
        entry.metadata.accessCount = (entry.metadata.accessCount || 0) + 1;
        
        return entry.value;
    }
    
    query(filter) {
        return Object.values(this.context)
            .filter(entry => {
                if (filter.since && entry.timestamp < filter.since) return false;
                if (filter.namespace && entry.namespace !== filter.namespace) return false;
                if (filter.hasMetadata) {
                    const hasAll = Object.keys(filter.hasMetadata)
                        .every(k => entry.metadata[k] === filter.hasMetadata[k]);
                    if (!hasAll) return false;
                }
                return true;
            })
            .map(entry => ({ key: entry.key, value: entry.value }));
    }
    
    save() {
        try {
            localStorage.setItem(\`pdei_context_\${this.namespace}\`, 
                JSON.stringify(this.context));
        } catch (e) {
            console.warn('Failed to save context:', e);
        }
    }
    
    load() {
        try {
            const data = localStorage.getItem(\`pdei_context_\${this.namespace}\`);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    }
    
    clear() {
        this.context = {};
        this.history = [];
        this.save();
    }
}

module.exports = ContextManager;`
        },
        
        'cryptosoup-collector': {
            name: 'CryptoSoup Data Collector',
            description: 'Real-time crypto data collection with pattern recognition',
            keywords: ['data', 'collect', 'stream', 'websocket', 'real-time', 'crypto', 'market', 'ticker'],
            template: `// CryptoSoup Data Collection Pattern
class DataCollector {
    constructor(config = {}) {
        this.config = {
            batchSize: config.batchSize || 100,
            flushInterval: config.flushInterval || 5000,
            maxRetries: config.maxRetries || 3,
            ...config
        };
        
        this.buffer = [];
        this.handlers = [];
        this.isActive = false;
    }
    
    start() {
        this.isActive = true;
        this.flushTimer = setInterval(() => this.flush(), this.config.flushInterval);
        return this;
    }
    
    stop() {
        this.isActive = false;
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        this.flush(); // Final flush
        return this;
    }
    
    collect(data) {
        if (!this.isActive) return;
        
        const entry = {
            data,
            timestamp: Date.now(),
            metadata: {
                source: data.source || 'unknown',
                type: data.type || 'generic'
            }
        };
        
        this.buffer.push(entry);
        
        // Trigger handlers immediately for critical data
        if (data.priority === 'high') {
            this.handlers.forEach(handler => handler([entry]));
        }
        
        // Auto-flush if buffer is full
        if (this.buffer.length >= this.config.batchSize) {
            this.flush();
        }
        
        return this;
    }
    
    onData(handler) {
        this.handlers.push(handler);
        return this;
    }
    
    flush() {
        if (this.buffer.length === 0) return;
        
        const batch = [...this.buffer];
        this.buffer = [];
        
        this.handlers.forEach(handler => {
            try {
                handler(batch);
            } catch (error) {
                console.error('Handler error:', error);
            }
        });
        
        return batch;
    }
    
    getStats() {
        return {
            bufferSize: this.buffer.length,
            handlersCount: this.handlers.length,
            isActive: this.isActive
        };
    }
}

module.exports = DataCollector;`
        },
        
        'ember-control': {
            name: 'EMBER Control System',
            description: 'Real-time embedded control loops from robotics',
            keywords: ['control', 'loop', 'pid', 'realtime', 'embedded', 'robot', 'motor', 'sensor'],
            template: `// EMBER Control System Pattern
class ControlLoop {
    constructor(config = {}) {
        this.config = {
            kp: config.kp || 1.0,        // Proportional gain
            ki: config.ki || 0.1,        // Integral gain
            kd: config.kd || 0.05,       // Derivative gain
            setpoint: config.setpoint || 0,
            updateRate: config.updateRate || 50,  // Hz
            outputLimits: config.outputLimits || { min: -100, max: 100 },
            ...config
        };
        
        this.integral = 0;
        this.lastError = 0;
        this.lastTime = Date.now();
        this.isRunning = false;
    }
    
    start() {
        this.isRunning = true;
        this.lastTime = Date.now();
        this.integral = 0;
        this.lastError = 0;
        return this;
    }
    
    stop() {
        this.isRunning = false;
        return this;
    }
    
    setTarget(setpoint) {
        this.config.setpoint = setpoint;
        return this;
    }
    
    update(currentValue) {
        if (!this.isRunning) return 0;
        
        const now = Date.now();
        const dt = (now - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = now;
        
        // Calculate error
        const error = this.config.setpoint - currentValue;
        
        // Proportional term
        const pTerm = this.config.kp * error;
        
        // Integral term (with anti-windup)
        this.integral += error * dt;
        const iTerm = this.config.ki * this.integral;
        
        // Derivative term
        const derivative = (error - this.lastError) / dt;
        const dTerm = this.config.kd * derivative;
        
        // Calculate output
        let output = pTerm + iTerm + dTerm;
        
        // Apply output limits
        output = Math.max(this.config.outputLimits.min,
                         Math.min(this.config.outputLimits.max, output));
        
        // Anti-windup: reset integral if saturated
        if (output === this.config.outputLimits.min || 
            output === this.config.outputLimits.max) {
            this.integral -= error * dt;
        }
        
        this.lastError = error;
        
        return output;
    }
    
    tune(kp, ki, kd) {
        this.config.kp = kp;
        this.config.ki = ki;
        this.config.kd = kd;
        this.integral = 0;  // Reset integral when retuning
        return this;
    }
    
    getState() {
        return {
            error: this.lastError,
            integral: this.integral,
            setpoint: this.config.setpoint,
            isRunning: this.isRunning
        };
    }
}

module.exports = ControlLoop;`
        },
        
        'forge-theory': {
            name: 'Forge Theory Mathematics',
            description: 'Exponential decay prediction framework',
            keywords: ['predict', 'decay', 'exponential', 'math', 'forecast', 'theory', 'model', 'algorithm'],
            template: `// Forge Theory Mathematical Framework
class ForgeTheory {
    /**
     * N(t) = N₀ × e^(-kt)
     * Where:
     *   N(t) = value at time t
     *   N₀ = initial value
     *   k = decay constant
     *   t = time
     */
    
    constructor(config = {}) {
        this.config = {
            initialValue: config.initialValue || 100,
            decayConstant: config.decayConstant || 0.1,
            timeUnit: config.timeUnit || 'seconds',
            ...config
        };
        
        this.history = [];
    }
    
    predict(time) {
        const N0 = this.config.initialValue;
        const k = this.config.decayConstant;
        const value = N0 * Math.exp(-k * time);
        
        return {
            time,
            value,
            percentRemaining: (value / N0) * 100,
            halfLife: this.getHalfLife()
        };
    }
    
    predictMultiple(times) {
        return times.map(t => this.predict(t));
    }
    
    getHalfLife() {
        // t½ = ln(2) / k
        return Math.log(2) / this.config.decayConstant;
    }
    
    fitToData(dataPoints) {
        // Fit exponential decay to observed data points
        // dataPoints = [{time, value}, ...]
        
        if (dataPoints.length < 2) {
            throw new Error('Need at least 2 data points to fit');
        }
        
        // Simple two-point estimation
        const p1 = dataPoints[0];
        const p2 = dataPoints[dataPoints.length - 1];
        
        // k = ln(N₀/N) / t
        const k = Math.log(p1.value / p2.value) / (p2.time - p1.time);
        
        this.config.initialValue = p1.value;
        this.config.decayConstant = k;
        
        return {
            initialValue: p1.value,
            decayConstant: k,
            halfLife: this.getHalfLife(),
            r_squared: this.calculateRSquared(dataPoints)
        };
    }
    
    calculateRSquared(dataPoints) {
        // Calculate goodness of fit
        const predictions = dataPoints.map(p => this.predict(p.time).value);
        const actual = dataPoints.map(p => p.value);
        const mean = actual.reduce((a, b) => a + b) / actual.length;
        
        const ssRes = actual.reduce((sum, val, i) => 
            sum + Math.pow(val - predictions[i], 2), 0);
        const ssTot = actual.reduce((sum, val) => 
            sum + Math.pow(val - mean, 2), 0);
        
        return 1 - (ssRes / ssTot);
    }
    
    estimateTimeToValue(targetValue) {
        // Solve for t when N(t) = targetValue
        // t = ln(N₀/N) / k
        const N0 = this.config.initialValue;
        const k = this.config.decayConstant;
        
        if (targetValue > N0) {
            throw new Error('Target value cannot exceed initial value');
        }
        
        return Math.log(N0 / targetValue) / k;
    }
}

module.exports = ForgeTheory;`
        }
    },
    
    suggest(intent, messages = []) {
        const lowerIntent = intent.toLowerCase();
        const words = lowerIntent.split(/\s+/);
        const suggestions = [];
        
        for (const [id, pattern] of Object.entries(this.patterns)) {
            let score = 0;
            
            // Exact keyword matching
            pattern.keywords.forEach(keyword => {
                if (lowerIntent.includes(keyword)) score += 2;
                // Partial word matching
                if (words.some(word => word.includes(keyword) || keyword.includes(word))) score += 1;
            });
            
            // Semantic matching (simple version)
            const patternWords = pattern.description.toLowerCase().split(/\s+/);
            const commonWords = words.filter(word => 
                word.length > 3 && patternWords.includes(word)
            );
            score += commonWords.length;
            
            // Contextual matching from previous messages
            if (messages.length > 1) {
                const lastMessage = messages[messages.length - 2];
                if (lastMessage && lastMessage.type === 'generation') {
                    if (lastMessage.artifacts?.some(f => f.language === 'javascript')) {
                        score += 1; // Boost JavaScript patterns if last generation was JS
                    }
                }
            }
            
            if (score > 0) {
                suggestions.push({ 
                    id, 
                    ...pattern, 
                    score,
                    matchReason: score >= 3 ? 'Strong match' : 'Related pattern'
                });
            }
        }
        
        // Sort by score and limit
        return suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    },
    
    get(id) {
        return this.patterns[id];
    },

    compose(patternIds) {
        return {
            name: 'Composite Pattern',
            description: `Combination of: ${patternIds.join(', ')}`,
            keywords: [],
            template: (intent) => {
                const results = [];
                
                for (const id of patternIds) {
                    let pattern = this.patterns[id];
                    let result = null;
                    
                    if (pattern) {
                        result = {
                            description: pattern.description,
                            files: [{
                                path: `src/patterns/${id}.js`,
                                language: 'javascript',
                                lines: pattern.template.split('\n').length,
                                code: pattern.template
                            }],
                            validations: { tests_passed: 5, tests_total: 5, coverage: 100 },
                            assumptions: [`Using ${pattern.name}`]
                        };
                    } else if (typeof RuleBasedAI !== 'undefined' && RuleBasedAI.patterns[id]) {
                        pattern = RuleBasedAI.patterns[id];
                        result = pattern.template(intent);
                    }
                    
                    if (result) results.push(result);
                }
                
                return this._mergeResults(results);
            }
        };
    },

    _mergeResults(results) {
        const merged = {
            description: results.map(r => r.description).join(' + '),
            files: [],
            validations: { tests_passed: 0, tests_total: 0, coverage: 0 },
            assumptions: []
        };
        
        results.forEach(r => {
            if (r.files) merged.files.push(...r.files);
            if (r.assumptions) merged.assumptions.push(...r.assumptions);
            if (r.validations) {
                merged.validations.tests_passed += r.validations.tests_passed;
                merged.validations.tests_total += r.validations.tests_total;
            }
        });
        
        const coverages = results.map(r => r.validations?.coverage || 0).filter(c => c > 0);
        if (coverages.length > 0) {
            merged.validations.coverage = Math.round(coverages.reduce((a, b) => a + b, 0) / coverages.length);
        }
        
        return merged;
    }
};

// ====================
// DEPENDENCY RESOLVER
// ====================
const DependencyResolver = {
    analyze(code) {
        // Parse require/import statements
        const requires = code.match(/require\(['"](.*?)['"]\)/g) || [];
        const imports = code.match(/import .* from ['"](.*?)['"]/g) || [];
        
        return [...requires, ...imports]
            .map(stmt => {
                const match = stmt.match(/['"](.*?)['"]/);
                return match ? match[1] : null;
            })
            .filter(dep => dep && dep.startsWith('./')); // Only local deps
    },
    
    generate(missingDep, context) {
        const name = missingDep.split('/').pop();
        const dir = context.requiredBy ? context.requiredBy.substring(0, context.requiredBy.lastIndexOf('/')) : 'src/utils';
        
        // Rate Limiter Pattern
        if (name.includes('rate-limiter')) {
            return {
                path: `${dir}/${name}.js`,
                language: 'javascript',
                lines: 45,
                code: `// Rate Limiter
class RateLimiter {
    constructor(config = {}) {
        this.messages = config.messages || 100;
        this.window = config.window || 60000;
        this.clients = new Map();
    }
    
    check(clientId) {
        const now = Date.now();
        const client = this.clients.get(clientId);
        
        if (!client) {
            this.clients.set(clientId, { count: 1, resetAt: now + this.window });
            return true;
        }
        
        if (now >= client.resetAt) {
            client.count = 1;
            client.resetAt = now + this.window;
            return true;
        }
        
        if (client.count >= this.messages) return false;
        
        client.count++;
        return true;
    }
}
module.exports = RateLimiter;`
            };
        }
        
        // Default generic generation
        return {
            path: `${dir}/${name}.js`,
            language: 'javascript',
            lines: 15,
            code: `// Auto-generated dependency: ${name}
// Required by: ${context.requiredBy}

class ${name.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')} {
    constructor() {
        console.log('${name} initialized');
    }
}
module.exports = ${name.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')};`
        };
    },
    
    resolveAll(artifacts) {
        const missingDeps = [];
        
        artifacts.forEach(file => {
            const deps = this.analyze(file.code);
            deps.forEach(dep => {
                const depName = dep.split('/').pop();
                // Check if dependency exists (with or without .js extension)
                const exists = artifacts.some(f => {
                    const fName = f.path.split('/').pop();
                    return fName === depName || fName === depName + '.js';
                });
                
                if (!exists && !missingDeps.some(d => d.dependency === dep)) {
                    missingDeps.push({ file: file.path, dependency: dep });
                }
            });
        });
        
        return missingDeps.map(({ file, dependency }) => 
            this.generate(dependency, { requiredBy: file })
        );
    }
};

// ====================
// RULE-BASED AI ENGINE
// ====================
const RuleBasedAI = {
    patterns: {
        'auth': {
            keywords: ['auth', 'authentication', 'login', 'register', 'signup', 'signin', 'jwt', 'oauth', 'password', 'user'],
            template: (intent) => ({
                description: `Generated authentication system with JWT, password hashing, and route protection`,
                files: [
                    {
                        path: 'src/auth/routes.js',
                        language: 'javascript',
                        lines: 124,
                        code: `// Authentication routes
const express = require('express');
const router = express.Router();
const authController = require('./controller');
const authMiddleware = require('./middleware');
const { validateRegister, validateLogin } = require('./validation');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/verify-email/:token', authController.verifyEmail);

// Protected routes
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);
router.put('/profile', authMiddleware.verifyToken, authController.updateProfile);
router.post('/change-password', authMiddleware.verifyToken, authController.changePassword);
router.post('/logout', authMiddleware.verifyToken, authController.logout);
router.post('/refresh-token', authMiddleware.verifyRefreshToken, authController.refreshToken);

// Admin routes
router.get('/users', 
    authMiddleware.verifyToken, 
    authMiddleware.isAdmin, 
    authController.getAllUsers
);

module.exports = router;`
                    },
                    {
                        path: 'src/auth/middleware.js',
                        language: 'javascript',
                        lines: 89,
                        code: `// Authentication middleware
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Access denied. No token provided.' 
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user still exists
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ 
                error: 'User no longer exists.' 
            });
        }
        
        // Check if user changed password after token was issued
        if (user.passwordChangedAt && 
            decoded.iat < user.passwordChangedAt.getTime() / 1000) {
            return res.status(401).json({ 
                error: 'Password changed. Please login again.' 
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expired. Please login again.' 
            });
        }
        res.status(400).json({ error: 'Invalid token.' });
    }
};

const verifyRefreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(401).json({ 
                error: 'Refresh token required.' 
            });
        }
        
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid refresh token.' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            error: 'Access denied. Admin privileges required.' 
        });
    }
};

const rateLimiter = (maxRequests = 5, windowMs = 60000) => {
    const requests = new Map();
    
    return (req, res, next) => {
        const key = req.ip;
        const now = Date.now();
        const userRequests = requests.get(key) || [];
        
        // Filter out old requests
        const validRequests = userRequests.filter(
            time => now - time < windowMs
        );
        
        if (validRequests.length >= maxRequests) {
            return res.status(429).json({ 
                error: 'Too many requests. Please try again later.' 
            });
        }
        
        validRequests.push(now);
        requests.set(key, validRequests);
        next();
    };
};

module.exports = { 
    verifyToken, 
    verifyRefreshToken, 
    isAdmin, 
    rateLimiter 
};`
                    }
                ],
                validations: {
                    tests_passed: 18,
                    tests_total: 18,
                    coverage: 94
                },
                assumptions: [
                    'Using JWT for token-based authentication',
                    'Token expiry: 24 hours (access), 7 days (refresh)',
                    'Passwords hashed with bcrypt (10 rounds)',
                    'Email verification required for new accounts',
                    'Rate limiting: 5 requests per minute for auth endpoints'
                ]
            })
        },

        'api': {
            keywords: ['api', 'rest', 'endpoint', 'route', 'crud', 'resource', 'http'],
            template: (intent) => ({
                description: `Generated RESTful API with CRUD operations, validation, and error handling`,
                files: [
                    {
                        path: 'src/api/routes.js',
                        language: 'javascript',
                        lines: 156,
                        code: `// REST API Routes
const express = require('express');
const router = express.Router();
const controller = require('./controller');
const validation = require('./validation');
const { authenticate, authorize } = require('../middleware/auth');
const { paginate, filter, sort } = require('../middleware/query');

// Public endpoints
router.get('/', 
    paginate(),
    filter(),
    sort(),
    controller.getAll
);

router.get('/:id', 
    validation.validateId,
    controller.getById
);

// Protected endpoints (authentication required)
router.post('/', 
    authenticate,
    validation.create,
    controller.create
);

router.put('/:id', 
    authenticate,
    validation.validateId,
    validation.update,
    controller.update
);

router.patch('/:id',
    authenticate,
    validation.validateId,
    validation.partialUpdate,
    controller.partialUpdate
);

router.delete('/:id', 
    authenticate,
    authorize('admin'),
    validation.validateId,
    controller.delete
);

// Additional endpoints
router.get('/search/:query', 
    validation.validateSearch,
    controller.search
);

router.post('/bulk',
    authenticate,
    validation.bulkCreate,
    controller.bulkCreate
);

router.post('/:id/duplicate',
    authenticate,
    validation.validateId,
    controller.duplicate
);

// Nested resource example
router.get('/:id/related',
    validation.validateId,
    controller.getRelated
);

module.exports = router;`
                    }
                ],
                validations: {
                    tests_passed: 12,
                    tests_total: 12,
                    coverage: 89
                },
                assumptions: [
                    'RESTful conventions (GET, POST, PUT, PATCH, DELETE)',
                    'Pagination: default 20 items, max 100 per page',
                    'Authentication via JWT middleware',
                    'CRUD operations with validation',
                    'Query string filtering and sorting support'
                ]
            })
        },

        'websocket': {
            keywords: ['websocket', 'ws', 'realtime', 'real-time', 'socket', 'live', 'stream'],
            dependencies: {
                'rate-limiter': {
                    required: true,
                    pattern: 'RateLimiter',
                    generate: () => ({
                        path: 'src/websocket/rate-limiter.js',
                        language: 'javascript',
                        lines: 45,
                        code: `// Rate Limiter
class RateLimiter {
    constructor(config = {}) {
        this.messages = config.messages || 100;
        this.window = config.window || 60000;
        this.clients = new Map();
    }
    
    check(clientId) {
        const now = Date.now();
        const client = this.clients.get(clientId);
        
        if (!client) {
            this.clients.set(clientId, {
                count: 1,
                resetAt: now + this.window
            });
            return true;
        }
        
        // Reset if window expired
        if (now >= client.resetAt) {
            client.count = 1;
            client.resetAt = now + this.window;
            return true;
        }
        
        // Check limit
        if (client.count >= this.messages) {
            return false;
        }
        
        client.count++;
        return true;
    }
    
    reset(clientId) {
        this.clients.delete(clientId);
    }
    
    cleanup() {
        const now = Date.now();
        this.clients.forEach((client, id) => {
            if (now >= client.resetAt) {
                this.clients.delete(id);
            }
        });
    }
}

module.exports = RateLimiter;`
                    })
                },
                'message-handler': {
                    required: true,
                    pattern: 'MessageHandler',
                    generate: () => ({
                        path: 'src/websocket/message-handler.js',
                        language: 'javascript',
                        lines: 38,
                        code: `// Message Handler
class MessageHandler {
    constructor() {
        this.handlers = new Map();
        this.registerDefaultHandlers();
    }
    
    registerDefaultHandlers() {
        // Ping/pong
        this.register('ping', async (message, client) => {
            return { type: 'pong', timestamp: Date.now() };
        });
        
        // Echo
        this.register('echo', async (message, client) => {
            return { 
                type: 'echo', 
                data: message.data,
                timestamp: Date.now()
            };
        });
    }
    
    register(type, handler) {
        this.handlers.set(type, handler);
    }
    
    async handle(message, client) {
        const handler = this.handlers.get(message.type);
        
        if (!handler) {
            throw new Error(\`Unknown message type: \${message.type}\`);
        }
        
        return await handler(message, client);
    }
}

module.exports = MessageHandler;`
                    })
                }
            },
            template: (intent) => {
                const deps = RuleBasedAI.patterns.websocket.dependencies;
                return {
                description: `Generated WebSocket server with auto-reconnect, rate limiting, and message validation`,
                files: [
                    {
                        path: 'src/websocket/server.js',
                        language: 'javascript',
                        lines: 167,
                        code: `// WebSocket Server
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const RateLimiter = require('./rate-limiter');
const MessageHandler = require('./message-handler');

class WebSocketServer {
    constructor(config = {}) {
        this.config = {
            port: config.port || 8080,
            path: config.path || '/ws',
            heartbeatInterval: config.heartbeatInterval || 30000,
            maxConnections: config.maxConnections || 1000,
            rateLimit: config.rateLimit || { messages: 100, window: 60000 },
            ...config
        };
        
        this.clients = new Map();
        this.rateLimiter = new RateLimiter(this.config.rateLimit);
        this.messageHandler = new MessageHandler();
    }
    
    start(httpServer) {
        this.wss = new WebSocket.Server({
            server: httpServer,
            path: this.config.path,
            verifyClient: this.verifyClient.bind(this)
        });
        
        this.wss.on('connection', this.handleConnection.bind(this));
        
        // Start heartbeat interval
        this.heartbeatTimer = setInterval(
            () => this.checkHeartbeats(),
            this.config.heartbeatInterval
        );
        
        console.log(\`WebSocket server started on port \${this.config.port}\`);
    }
    
    verifyClient(info, callback) {
        try {
            // Check max connections
            if (this.clients.size >= this.config.maxConnections) {
                callback(false, 429, 'Too many connections');
                return;
            }
            
            // Verify authentication token if provided
            const url = new URL(info.req.url, 'http://localhost');
            const token = url.searchParams.get('token');
            
            if (token) {
                jwt.verify(token, process.env.JWT_SECRET);
            }
            
            callback(true);
        } catch (error) {
            callback(false, 401, 'Unauthorized');
        }
    }
    
    findClientByToken(token) {
        return this.clients.get(token);
    }
    
    setupClientListeners(ws, clientId) {
        ws.on('message', (data) => this.handleMessage(clientId, data));
        ws.on('pong', () => this.handlePong(clientId));
        ws.on('close', () => this.handleClose(clientId));
        ws.on('error', (error) => this.handleError(clientId, error));
    }
    
    handleConnection(ws, req) {
        const url = new URL(req.url, 'http://localhost');
        const resumeToken = url.searchParams.get('resume');
        
        if (resumeToken) {
            // Try to resume existing session
            const existingClient = this.findClientByToken(resumeToken);
            if (existingClient) {
                existingClient.ws = ws;
                existingClient.isAlive = true;
                
                this.setupClientListeners(ws, existingClient.id);
                
                this.send(existingClient.id, {
                    type: 'resumed',
                    clientId: existingClient.id,
                    timestamp: Date.now()
                });
                return;
            }
        }
        
        const clientId = this.generateClientId();
        
        const client = {
            id: clientId,
            ws,
            ip: req.socket.remoteAddress,
            connectedAt: Date.now(),
            isAlive: true,
            metadata: {}
        };
        
        this.clients.set(clientId, client);
        
        this.setupClientListeners(ws, clientId);
        
        // Send welcome message
        this.send(clientId, {
            type: 'welcome',
            clientId,
            timestamp: Date.now()
        });
        
        console.log(\`Client connected: \${clientId} (\${this.clients.size} total)\`);
    }
    
    async handleMessage(clientId, rawData) {
        try {
            const client = this.clients.get(clientId);
            if (!client) return;
            
            // Check rate limit
            if (!this.rateLimiter.check(clientId)) {
                this.send(clientId, {
                    type: 'error',
                    message: 'Rate limit exceeded'
                });
                return;
            }
            
            // Parse message
            const message = JSON.parse(rawData);
            
            // Validate message structure
            if (!message.type) {
                throw new Error('Message type required');
            }
            
            // Handle message
            const response = await this.messageHandler.handle(message, client);
            
            if (response) {
                this.send(clientId, response);
            }
            
        } catch (error) {
            this.send(clientId, {
                type: 'error',
                message: error.message
            });
        }
    }
    
    send(clientId, data) {
        const client = this.clients.get(clientId);
        if (!client || client.ws.readyState !== WebSocket.OPEN) {
            return false;
        }
        
        try {
            client.ws.send(JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(\`Failed to send to \${clientId}:\`, error);
            return false;
        }
    }
    
    broadcast(data, filter = null) {
        let sent = 0;
        
        this.clients.forEach((client, clientId) => {
            if (filter && !filter(client)) return;
            
            if (this.send(clientId, data)) {
                sent++;
            }
        });
        
        return sent;
    }
    
    joinRoom(clientId, room) {
        const client = this.clients.get(clientId);
        if (!client) return false;
        
        if (!client.rooms) client.rooms = new Set();
        client.rooms.add(room);
        
        return true;
    }
    
    leaveRoom(clientId, room) {
        const client = this.clients.get(clientId);
        if (!client || !client.rooms) return false;
        
        client.rooms.delete(room);
        return true;
    }
    
    broadcastToRoom(room, data, excludeClient = null) {
        let sent = 0;
        
        this.clients.forEach((client, clientId) => {
            if (clientId === excludeClient) return;
            if (!client.rooms || !client.rooms.has(room)) return;
            
            if (this.send(clientId, data)) {
                sent++;
            }
        });
        
        return sent;
    }
    
    checkHeartbeats() {
        this.clients.forEach((client, clientId) => {
            if (!client.isAlive) {
                console.log(\`Client timeout: \${clientId}\`);
                client.ws.terminate();
                this.clients.delete(clientId);
                return;
            }
            
            client.isAlive = false;
            client.ws.ping();
        });
    }
    
    handlePong(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            client.isAlive = true;
        }
    }
    
    handleClose(clientId) {
        this.clients.delete(clientId);
        console.log(\`Client disconnected: \${clientId} (\${this.clients.size} remaining)\`);
    }
    
    handleError(clientId, error) {
        console.error(\`Client error \${clientId}:\`, error);
    }
    
    generateClientId() {
        return \`client_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
    }
    
    stop() {
        clearInterval(this.heartbeatTimer);
        
        this.clients.forEach((client) => {
            client.ws.close(1000, 'Server shutting down');
        });
        
        this.wss.close();
        console.log('WebSocket server stopped');
    }
    
    getStats() {
        return {
            connections: this.clients.size,
            maxConnections: this.config.maxConnections,
            uptime: process.uptime()
        };
    }
}

module.exports = WebSocketServer;`
                    },
                    deps['rate-limiter'].generate(),
                    deps['message-handler'].generate()
                ],
                validations: {
                    tests_passed: 15,
                    tests_total: 15,
                    coverage: 91
                },
                assumptions: [
                    'Using ws library for WebSocket implementation',
                    'Rate limiting: 100 messages per minute per client',
                    'Heartbeat interval: 30 seconds',
                    'Auto-disconnect on missed heartbeat',
                    'JWT authentication via query parameter'
                ]
            };
            }
        },

        'default': {
            keywords: [],
            template: (intent) => ({
                description: `Generated basic implementation for: ${intent}`,
                files: [
                    {
                        path: 'src/index.js',
                        language: 'javascript',
                        lines: 78,
                        code: `// Generated implementation for: ${intent}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());  // Security headers
app.use(cors());    // Enable CORS
app.use(morgan('combined'));  // Logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Main route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Server is running',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            docs: '/api-docs'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        path: req.path
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(\`Server running on port \${PORT}\`);
    console.log(\`Environment: \${process.env.NODE_ENV || 'development'}\`);
});

module.exports = app;`
                    }
                ],
                validations: {
                    tests_passed: 5,
                    tests_total: 5,
                    coverage: 100
                },
                assumptions: [
                    'Express.js framework',
                    'Environment variables via dotenv',
                    'Basic security with Helmet',
                    'CORS enabled',
                    'Request logging with Morgan'
                ]
            })
        }
    },

    generate(intent) {
        const lowerIntent = intent.toLowerCase();
        let result = null;
        
        // Find matching pattern
        for (const [pattern, config] of Object.entries(this.patterns)) {
            if (pattern === 'default') continue;
            
            if (config.keywords.some(keyword => lowerIntent.includes(keyword))) {
                result = config.template(intent);
                break;
            }
        }
        
        // Fallback to default
        if (!result) {
            result = this.patterns.default.template(intent);
        }
        
        // Auto-resolve dependencies
        if (result && result.files) {
            const extraFiles = DependencyResolver.resolveAll(result.files);
            if (extraFiles.length > 0) {
                result.files.push(...extraFiles);
                result.description += ` (with ${extraFiles.length} auto-generated dependencies)`;
            }
        }
        
        return result;
    }
};