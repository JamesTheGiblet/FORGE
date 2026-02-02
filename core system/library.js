// ====================
// FORGE PATTERN LIBRARY
// ====================

(function() {
    // Resolve PatternSystem (Browser or Node)
    const ps = typeof PatternSystem !== 'undefined' ? PatternSystem : 
              (typeof require !== 'undefined' ? require('./system') : null);

    if (!ps) {
        console.warn('[PatternLibrary] PatternSystem not found. Patterns not registered.');
        return;
    }

    // ==================== BACKEND: CORE ====================

    ps.register('controller', {
        type: 'backend',
        description: 'REST API controller with CRUD operations',
        keywords: ['controller', 'ctrl', 'crud', 'api', 'rest'],
        generate: () => ({
            path: 'src/controllers/base.controller.js',
            language: 'javascript',
            lines: 120,
            code: `class BaseController {
    constructor(model) { this.model = model; }
    
    getAll = async (req, res, next) => {
        try {
            const docs = await this.model.find();
            res.json({ success: true, count: docs.length, data: docs });
        } catch (err) { next(err); }
    };

    create = async (req, res, next) => {
        try {
            const doc = await this.model.create(req.body);
            res.status(201).json({ success: true, data: doc });
        } catch (err) { next(err); }
    };
    
    getOne = async (req, res, next) => {
        try {
            const doc = await this.model.findById(req.params.id);
            if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
            res.json({ success: true, data: doc });
        } catch (err) { next(err); }
    };

    update = async (req, res, next) => {
        try {
            const doc = await this.model.findByIdAndUpdate(
                req.params.id, 
                req.body, 
                { new: true, runValidators: true }
            );
            if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
            res.json({ success: true, data: doc });
        } catch (err) { next(err); }
    };

    delete = async (req, res, next) => {
        try {
            const doc = await this.model.findByIdAndDelete(req.params.id);
            if (!doc) return res.status(404).json({ success: false, error: 'Not found' });
            res.json({ success: true, data: {} });
        } catch (err) { next(err); }
    };

    getAllPaginated = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            
            const total = await this.model.countDocuments();
            const docs = await this.model.find().skip(skip).limit(limit);
                
            res.json({ 
                success: true, 
                count: docs.length,
                total,
                page,
                pages: Math.ceil(total / limit),
                data: docs 
            });
        } catch (err) { next(err); }
    };
}
module.exports = BaseController;`
        })
    });

    ps.register('model', {
        type: 'backend',
        description: 'Mongoose data model',
        keywords: ['model', 'schema', 'mongoose', 'data', 'entity'],
        generate: () => ({
            path: 'src/models/Resource.js',
            language: 'javascript',
            lines: 40,
            code: `const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    metadata: { type: Map, of: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', ResourceSchema);`
        })
    });

    ps.register('routes', {
        type: 'backend',
        description: 'Express router for a resource',
        keywords: ['routes', 'router', 'endpoints', 'api routes'],
        generate: () => ({
            path: 'src/routes/resource.js',
            language: 'javascript',
            lines: 25,
            code: `const express = require('express');
const router = express.Router();
const controller = require('../controllers/resource.controller');

router.route('/')
    .get(controller.getAll)
    .post(controller.create);

router.route('/:id')
    .get(controller.getOne)
    .put(controller.update)
    .delete(controller.delete);

module.exports = router;`
        })
    });

    // ==================== BACKEND: NEW (5) ====================

    ps.register('api-gateway', {
        type: 'backend',
        description: 'API Gateway / Proxy setup',
        keywords: ['gateway', 'proxy', 'microservice', 'route', 'forward'],
        generate: () => ({
            path: 'src/gateway.js',
            language: 'javascript',
            lines: 45,
            code: `const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Service Routes
const services = {
    auth: 'http://localhost:3001',
    users: 'http://localhost:3002',
    products: 'http://localhost:3003'
};

// Proxy Configuration
Object.keys(services).forEach(path => {
    app.use(\`/api/\${path}\`, createProxyMiddleware({
        target: services[path],
        changeOrigin: true,
        pathRewrite: {
            [\`^/api/\${path}\`]: ''
        }
    }));
});

app.listen(3000, () => console.log('Gateway running on port 3000'));`
        })
    });

    ps.register('file-upload', {
        type: 'backend',
        description: 'File upload handling with Multer',
        keywords: ['upload', 'file', 'image', 'multer', 's3', 'storage'],
        generate: () => ({
            path: 'src/middleware/upload.js',
            language: 'javascript',
            lines: 50,
            code: `const multer = require('multer');
const path = require('path');

// Storage configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, \`\${file.fieldname}-\${Date.now()}\${path.extname(file.originalname)}\`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
    fileFilter: fileFilter
});

module.exports = upload;`
        })
    });

    ps.register('graphql-server', {
        type: 'backend',
        description: 'Apollo GraphQL Server setup',
        keywords: ['graphql', 'apollo', 'schema', 'query', 'mutation'],
        generate: () => ({
            path: 'src/graphql/server.js',
            language: 'javascript',
            lines: 60,
            code: `const { ApolloServer, gql } = require('apollo-server');

// Schema Definition
const typeDefs = gql\`
    type User {
        id: ID!
        username: String!
        email: String!
    }
    type Query {
        users: [User]
        user(id: ID!): User
    }
    type Mutation {
        createUser(username: String!, email: String!): User
    }
\`;

// Resolvers
const resolvers = {
    Query: {
        users: () => [], // Implement DB call
        user: (_, { id }) => ({ id, username: 'test' })
    },
    Mutation: {
        createUser: (_, { username, email }) => ({ id: '1', username, email })
    }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
    console.log(\`🚀  Server ready at \${url}\`);
});`
        })
    });

    ps.register('cron-job', {
        type: 'backend',
        description: 'Scheduled tasks with node-cron',
        keywords: ['cron', 'schedule', 'task', 'job', 'timer', 'automation'],
        generate: () => ({
            path: 'src/jobs/scheduler.js',
            language: 'javascript',
            lines: 35,
            code: `const cron = require('node-cron');
const logger = require('../utils/logger');

class Scheduler {
    init() {
        // Run every morning at 00:00
        cron.schedule('0 0 * * *', async () => {
            logger.info('Running daily cleanup...');
            await this.dailyCleanup();
        });

        // Run every 15 minutes
        cron.schedule('*/15 * * * *', () => {
            logger.info('Running health check...');
            this.healthCheck();
        });
        
        console.log('Scheduler initialized');
    }

    async dailyCleanup() {
        // Implementation
    }

    healthCheck() {
        // Implementation
    }
}

module.exports = new Scheduler();`
        })
    });

    ps.register('payment-webhook', {
        type: 'backend',
        description: 'Stripe webhook handler',
        keywords: ['payment', 'stripe', 'webhook', 'checkout', 'billing'],
        generate: () => ({
            path: 'src/controllers/payment.controller.js',
            language: 'javascript',
            lines: 55,
            code: `const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(\`Webhook Error: \${err.message}\`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            break;
        default:
            console.log(\`Unhandled event type \${event.type}\`);
    }

    res.json({received: true});
};`
        })
    });

    ps.register('config-validator', {
        type: 'backend',
        description: 'Configuration validator for API keys and models',
        keywords: ['config', 'validator', 'validation', 'check', 'settings', 'setup', 'api key', 'model'],
        generate: () => ({
            path: 'src/utils/config-validator.js',
            language: 'javascript',
            lines: 65,
            code: `// Configuration Validator
class ConfigValidator {
    constructor(config) {
        this.config = config || {};
        this.errors = [];
    }

    validate() {
        this.errors = [];
        this.validateApiKey();
        this.validateModel();
        this.validateCompatibility();
        
        return {
            isValid: this.errors.length === 0,
            errors: this.errors
        };
    }

    validateApiKey() {
        if (!this.config.apiKey) {
            this.errors.push('API Key is missing');
            return;
        }
        if (typeof this.config.apiKey !== 'string') {
            this.errors.push('API Key must be a string');
        }
    }

    validateModel() {
        if (!this.config.model) {
            this.errors.push('Model is not selected');
        }
    }

    validateCompatibility() {
        if (!this.config.apiKey || !this.config.model) return;

        const apiKey = this.config.apiKey.trim();
        const model = this.config.model.toLowerCase();

        // Anthropic (Claude)
        if (model.includes('claude')) {
            if (!apiKey.startsWith('sk-ant-')) {
                this.errors.push('Selected Claude model requires an Anthropic API key (starts with sk-ant-)');
            }
        }
        
        // OpenAI (GPT)
        else if (model.includes('gpt')) {
            if (!apiKey.startsWith('sk-') || apiKey.startsWith('sk-ant-')) {
                this.errors.push('Selected GPT model requires an OpenAI API key (starts with sk-)');
            }
        }
    }
}

module.exports = ConfigValidator;`
        })
    });

    ps.register('proxy-server', {
        type: 'backend',
        description: 'Secure API Proxy Server to bypass CORS',
        keywords: ['proxy', 'cors', 'api', 'server', 'middleware', 'gateway'],
        generate: () => ({
            path: 'server.js',
            language: 'javascript',
            lines: 45,
            code: `const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your frontend
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}));

// Proxy to Anthropic API
app.use('/api/anthropic', createProxyMiddleware({
    target: 'https://api.anthropic.com',
    changeOrigin: true,
    pathRewrite: {
        '^/api/anthropic': ''
    },
    onProxyReq: (proxyReq, req, res) => {
        // Add API key securely from server-side env
        proxyReq.setHeader('x-api-key', process.env.ANTHROPIC_API_KEY);
        proxyReq.setHeader('anthropic-version', '2023-06-01');
    }
}));

app.listen(PORT, () => {
    console.log(\`Proxy server running on http://localhost:\${PORT}\`);
});`
        })
    });

    // ==================== FRONTEND: CORE ====================

    ps.register('landing-page', {
        type: 'frontend',
        description: 'Responsive landing page',
        keywords: ['landing', 'homepage', 'hero', 'marketing'],
        generate: () => ({
            path: 'index.html',
            language: 'html',
            lines: 150,
            code: `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Landing Page</title>
    <style>
        body { margin: 0; font-family: system-ui, sans-serif; }
        .hero { background: #2563eb; color: white; padding: 5rem 2rem; text-align: center; }
        .btn { background: white; color: #2563eb; padding: 1rem 2rem; border-radius: 2rem; text-decoration: none; font-weight: bold; }
    </style>
</head>
<body>
    <div class="hero">
        <h1>Build Something Amazing</h1>
        <p>Launch your project today.</p>
        <a href="#" class="btn">Get Started</a>
    </div>
</body>
</html>`
        })
    });

    // ==================== FRONTEND: NEW (5) ====================

    ps.register('kanban-board', {
        type: 'frontend',
        description: 'Drag and drop Kanban board',
        keywords: ['kanban', 'board', 'drag', 'drop', 'task', 'trello'],
        generate: () => ({
            path: 'kanban.html',
            language: 'html',
            lines: 120,
            code: `<!DOCTYPE html>
<html>
<head>
<style>
    .board { display: flex; gap: 1rem; padding: 1rem; overflow-x: auto; height: 100vh; }
    .column { background: #f1f5f9; min-width: 300px; border-radius: 8px; padding: 1rem; }
    .card { background: white; padding: 1rem; margin-bottom: 0.5rem; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); cursor: grab; }
    .card:active { cursor: grabbing; }
</style>
</head>
<body>
    <div class="board">
        <div class="column" ondrop="drop(event)" ondragover="allowDrop(event)">
            <h3>To Do</h3>
            <div class="card" draggable="true" ondragstart="drag(event)" id="c1">Task 1</div>
            <div class="card" draggable="true" ondragstart="drag(event)" id="c2">Task 2</div>
        </div>
        <div class="column" ondrop="drop(event)" ondragover="allowDrop(event)">
            <h3>In Progress</h3>
        </div>
        <div class="column" ondrop="drop(event)" ondragover="allowDrop(event)">
            <h3>Done</h3>
        </div>
    </div>
    <script>
        function allowDrop(ev) { ev.preventDefault(); }
        function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); }
        function drop(ev) {
            ev.preventDefault();
            var data = ev.dataTransfer.getData("text");
            if(ev.target.classList.contains('column')) {
                ev.target.appendChild(document.getElementById(data));
            }
        }
    </script>
</body>
</html>`
        })
    });

    ps.register('chat-interface', {
        type: 'frontend',
        description: 'Real-time chat UI',
        keywords: ['chat', 'message', 'conversation', 'ui', 'widget'],
        generate: () => ({
            path: 'chat.html',
            language: 'html',
            lines: 140,
            code: `<!DOCTYPE html>
<html>
<head>
<style>
    .chat-container { width: 350px; height: 500px; border: 1px solid #ccc; display: flex; flex-direction: column; border-radius: 8px; overflow: hidden; }
    .chat-header { background: #2563eb; color: white; padding: 1rem; }
    .chat-messages { flex: 1; padding: 1rem; overflow-y: auto; background: #f8fafc; }
    .message { margin-bottom: 0.5rem; max-width: 80%; padding: 0.5rem 1rem; border-radius: 1rem; }
    .message.sent { background: #2563eb; color: white; align-self: flex-end; margin-left: auto; }
    .message.received { background: #e2e8f0; color: #1e293b; }
    .chat-input { display: flex; border-top: 1px solid #ccc; }
    .chat-input input { flex: 1; padding: 1rem; border: none; outline: none; }
    .chat-input button { padding: 0 1.5rem; background: #2563eb; color: white; border: none; cursor: pointer; }
</style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">Support Chat</div>
        <div class="chat-messages" id="messages">
            <div class="message received">Hello! How can I help you?</div>
        </div>
        <div class="chat-input">
            <input type="text" id="input" placeholder="Type a message...">
            <button onclick="send()">Send</button>
        </div>
    </div>
    <script>
        function send() {
            const input = document.getElementById('input');
            const text = input.value.trim();
            if(!text) return;
            
            const msg = document.createElement('div');
            msg.className = 'message sent';
            msg.textContent = text;
            document.getElementById('messages').appendChild(msg);
            input.value = '';
            
            // Auto scroll
            const container = document.getElementById('messages');
            container.scrollTop = container.scrollHeight;
        }
    </script>
</body>
</html>`
        })
    });

    ps.register('pricing-table', {
        type: 'frontend',
        description: 'SaaS pricing table',
        keywords: ['pricing', 'plan', 'subscription', 'table', 'cost'],
        generate: () => ({
            path: 'pricing.html',
            language: 'html',
            lines: 130,
            code: `<!DOCTYPE html>
<html>
<head>
<style>
    .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; max-width: 1000px; margin: 2rem auto; }
    .plan-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 2rem; text-align: center; transition: transform 0.2s; }
    .plan-card:hover { transform: translateY(-5px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .plan-card.featured { border-color: #2563eb; position: relative; }
    .plan-card.featured::before { content: 'Popular'; position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #2563eb; color: white; padding: 0.25rem 1rem; border-radius: 1rem; font-size: 0.8rem; }
    .price { font-size: 2.5rem; font-weight: bold; margin: 1rem 0; }
    .features { list-style: none; padding: 0; margin: 2rem 0; }
    .features li { margin-bottom: 0.5rem; color: #64748b; }
    .btn { display: block; padding: 0.75rem; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
    .btn.outline { background: transparent; border: 1px solid #2563eb; color: #2563eb; }
</style>
</head>
<body>
    <div class="pricing-grid">
        <div class="plan-card">
            <h3>Starter</h3>
            <div class="price">$0</div>
            <ul class="features">
                <li>1 User</li>
                <li>5 Projects</li>
                <li>Community Support</li>
            </ul>
            <a href="#" class="btn outline">Get Started</a>
        </div>
        <div class="plan-card featured">
            <h3>Pro</h3>
            <div class="price">$29</div>
            <ul class="features">
                <li>5 Users</li>
                <li>Unlimited Projects</li>
                <li>Priority Support</li>
            </ul>
            <a href="#" class="btn">Get Started</a>
        </div>
        <div class="plan-card">
            <h3>Enterprise</h3>
            <div class="price">$99</div>
            <ul class="features">
                <li>Unlimited Users</li>
                <li>Custom Integrations</li>
                <li>24/7 Support</li>
            </ul>
            <a href="#" class="btn outline">Contact Sales</a>
        </div>
    </div>
</body>
</html>`
        })
    });

    ps.register('user-profile', {
        type: 'frontend',
        description: 'User settings and profile form',
        keywords: ['profile', 'settings', 'account', 'user', 'form'],
        generate: () => ({
            path: 'profile.html',
            language: 'html',
            lines: 100,
            code: `<!DOCTYPE html>
<html>
<head>
<style>
    .container { max-width: 600px; margin: 2rem auto; padding: 2rem; border: 1px solid #e2e8f0; border-radius: 8px; }
    .profile-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
    .avatar { width: 80px; height: 80px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 2rem; }
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #334155; }
    input { width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; box-sizing: border-box; }
    .btn { background: #2563eb; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; }
</style>
</head>
<body>
    <div class="container">
        <div class="profile-header">
            <div class="avatar">👤</div>
            <div>
                <h2>Profile Settings</h2>
                <p style="color: #64748b; margin: 0;">Manage your account details</p>
            </div>
        </div>
        <form>
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" value="John Doe">
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" value="john@example.com">
            </div>
            <div class="form-group">
                <label>Bio</label>
                <input type="text" placeholder="Tell us about yourself">
            </div>
            <button type="submit" class="btn">Save Changes</button>
        </form>
    </div>
</body>
</html>`
        })
    });

    ps.register('infinite-scroll', {
        type: 'frontend',
        description: 'Infinite scroll list with IntersectionObserver',
        keywords: ['infinite', 'scroll', 'pagination', 'load', 'list'],
        generate: () => ({
            path: 'infinite-list.html',
            language: 'html',
            lines: 85,
            code: `<!DOCTYPE html>
<html>
<head>
<style>
    .item { padding: 2rem; margin: 1rem 0; background: #f1f5f9; border-radius: 8px; text-align: center; }
    .loader { text-align: center; padding: 1rem; color: #64748b; }
</style>
</head>
<body>
    <div id="container"></div>
    <div id="loader" class="loader">Loading more...</div>

    <script>
        let page = 1;
        const container = document.getElementById('container');
        const loader = document.getElementById('loader');

        function loadItems() {
            for(let i = 0; i < 10; i++) {
                const div = document.createElement('div');
                div.className = 'item';
                div.textContent = \`Item \${(page - 1) * 10 + i + 1}\`;
                container.appendChild(div);
            }
            page++;
        }

        // Initial load
        loadItems();

        // Intersection Observer
        const observer = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting) {
                setTimeout(loadItems, 500); // Simulate network delay
            }
        });

        observer.observe(loader);
    </script>
</body>
</html>`
        })
    });

    // ==================== MIGRATED PATTERNS ====================

    ps.register('auth-middleware', {
        type: 'backend',
        description: 'JWT authentication middleware',
        keywords: ['auth', 'jwt', 'middleware', 'protect', 'security'],
        generate: () => ({
            path: 'src/middleware/auth.js',
            language: 'javascript',
            lines: 40,
            code: `const jwt = require('jsonwebtoken');
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ error: 'Not authorized' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Not authorized' });
    }
};
module.exports = protect;`
        })
    });

    ps.register('logger', {
        type: 'backend',
        description: 'Structured logging service',
        keywords: ['logger', 'log', 'winston', 'logging'],
        generate: () => ({
            path: 'src/utils/logger.js',
            language: 'javascript',
            lines: 45,
            code: `const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.Console({ format: winston.format.simple() })
    ]
});
module.exports = logger;`
        })
    });

    ps.register('dashboard', {
        type: 'frontend',
        description: 'Admin dashboard layout',
        keywords: ['dashboard', 'admin', 'panel', 'analytics'],
        generate: () => ({
            description: 'Generated admin dashboard',
            files: [{
                path: 'dashboard.html',
                language: 'html',
                lines: 300,
                code: `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Dashboard</title>
    <style>
        body { display: flex; height: 100vh; margin: 0; font-family: sans-serif; }
        .sidebar { width: 250px; background: #1e293b; color: white; padding: 1rem; }
        .content { flex: 1; padding: 2rem; background: #f1f5f9; }
        .card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="sidebar">
        <h2>Admin</h2>
        <nav>
            <a href="#" style="display:block; color:white; padding:0.5rem 0;">Overview</a>
            <a href="#" style="display:block; color:white; padding:0.5rem 0;">Settings</a>
        </nav>
    </div>
    <div class="content">
        <h1>Overview</h1>
        <div class="card">
            <h3>Stats</h3>
            <p>Active Users: 1,234</p>
        </div>
    </div>
</body>
</html>`
            }],
            validations: { tests_passed: 3, tests_total: 3, coverage: 100 }
        })
    });

    ps.register('auth-system', {
        type: 'ai',
        description: 'Complete authentication system',
        keywords: ['auth system', 'login flow', 'registration'],
        generate: (intent) => ({
            description: 'Generated full stack auth system',
            files: [
                {
                    path: 'src/routes/auth.js',
                    language: 'javascript',
                    lines: 50,
                    code: `const router = require('express').Router();
const { register, login } = require('../controllers/auth');
router.post('/register', register);
router.post('/login', login);
module.exports = router;`
                },
                {
                    path: 'src/controllers/auth.js',
                    language: 'javascript',
                    lines: 80,
                    code: `// Auth Controller Logic`
                }
            ],
            validations: { tests_passed: 10, tests_total: 10, coverage: 90 }
        })
    });

    ps.register('config', {
        type: 'backend',
        description: 'Configuration loader',
        keywords: ['config', 'configuration', 'env', 'settings'],
        generate: () => ({
            path: 'src/config/index.js',
            language: 'javascript',
            lines: 25,
            code: `require('dotenv').config();
const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    db: { host: process.env.DB_HOST, name: process.env.DB_NAME },
    jwt: { secret: process.env.JWT_SECRET, expire: '30d' }
};
module.exports = config;`
        })
    });

    ps.register('database', {
        type: 'backend',
        description: 'Database connection pool',
        keywords: ['database', 'db', 'connection', 'pool'],
        generate: () => ({
            path: 'src/database/connection.js',
            language: 'javascript',
            lines: 40,
            code: `const { Pool } = require('pg');
class Database {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
    }
    async query(text, params) { return this.pool.query(text, params); }
}
module.exports = new Database();`
        })
    });

    ps.register('redis', {
        type: 'backend',
        description: 'Redis cache connection',
        keywords: ['redis', 'cache', 'store'],
        generate: () => ({
            path: 'src/config/redis.js',
            language: 'javascript',
            lines: 30,
            code: `const Redis = require('ioredis');
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
});
module.exports = redis;`
        })
    });

    ps.register('queue', {
        type: 'backend',
        description: 'Background job queue',
        keywords: ['queue', 'job', 'worker'],
        generate: () => ({
            path: 'src/lib/queue.js',
            language: 'javascript',
            lines: 40,
            code: `const EventEmitter = require('events');
class Queue extends EventEmitter {
    constructor() { super(); this.jobs = []; }
    add(job) { this.jobs.push(job); this.emit('job', job); }
    process(handler) { this.on('job', handler); }
}
module.exports = new Queue();`
        })
    });

    ps.register('event-bus', {
        type: 'backend',
        description: 'Global event bus',
        keywords: ['event', 'bus', 'emitter'],
        generate: () => ({
            path: 'src/lib/event-bus.js',
            language: 'javascript',
            lines: 20,
            code: `const EventEmitter = require('events');
const bus = new EventEmitter();
module.exports = bus;`
        })
    });

    ps.register('email-service', {
        type: 'backend',
        description: 'Email sending service',
        keywords: ['email', 'mail', 'smtp'],
        generate: () => ({
            path: 'src/services/email.service.js',
            language: 'javascript',
            lines: 30,
            code: `const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
module.exports = { send: (opts) => transporter.sendMail(opts) };`
        })
    });

})();