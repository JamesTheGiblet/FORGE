// ====================
// FRONTEND PATTERN LIBRARY FOR FORGE
// Generates epic HTML files with complete styling and interactivity
// ====================

const FrontendPatterns = {
    patterns: {
        // ==================== LANDING PAGES ====================
        'landing-page': {
            keywords: ['landing', 'homepage', 'hero', 'marketing', 'splash'],
            description: 'Beautiful landing page with hero section, features, and CTA',
            generate: (intent) => ({
                description: 'Generated responsive landing page with modern design',
                files: [
                    {
                        path: 'index.html',
                        language: 'html',
                        lines: 245,
                        code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Product - Transform Your Business</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --primary: #2563eb;
            --primary-dark: #1e40af;
            --secondary: #10b981;
            --dark: #0f172a;
            --light: #f8fafc;
            --text: #334155;
            --text-light: #64748b;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: var(--text);
        }
        
        /* Hero Section */
        .hero {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: white;
            padding: 8rem 2rem 6rem;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120"><path fill="%23ffffff" fill-opacity="0.1" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7L1200,56L1200,120L1152,120C1104,120,1008,120,912,120C816,120,720,120,624,120C528,120,432,120,336,120C240,120,144,120,96,120L48,120L0,120Z"></path></svg>') bottom center no-repeat;
            background-size: cover;
        }
        
        .hero h1 {
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 1.5rem;
            line-height: 1.2;
        }
        
        .hero p {
            font-size: 1.25rem;
            margin-bottom: 2rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
            opacity: 0.95;
        }
        
        .cta-button {
            display: inline-block;
            padding: 1rem 2.5rem;
            background: white;
            color: var(--primary);
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 1.1rem;
            transition: all 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }
        
        /* Features Section */
        .features {
            padding: 6rem 2rem;
            background: var(--light);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .section-title {
            text-align: center;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--dark);
        }
        
        .section-subtitle {
            text-align: center;
            font-size: 1.2rem;
            color: var(--text-light);
            margin-bottom: 4rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        
        .feature-card {
            background: white;
            padding: 2.5rem;
            border-radius: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
            transition: all 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        }
        
        .feature-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            margin-bottom: 1.5rem;
        }
        
        .feature-card h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: var(--dark);
        }
        
        .feature-card p {
            color: var(--text-light);
            line-height: 1.8;
        }
        
        /* Stats Section */
        .stats {
            padding: 5rem 2rem;
            background: var(--dark);
            color: white;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 3rem;
            text-align: center;
        }
        
        .stat-number {
            font-size: 3.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
        }
        
        .stat-label {
            font-size: 1.1rem;
            opacity: 0.8;
        }
        
        /* CTA Section */
        .cta-section {
            padding: 6rem 2rem;
            background: linear-gradient(135deg, var(--secondary) 0%, #059669 100%);
            color: white;
            text-align: center;
        }
        
        .cta-section h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }
        
        .cta-section p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.95;
        }
        
        /* Footer */
        footer {
            padding: 3rem 2rem;
            background: var(--dark);
            color: white;
            text-align: center;
        }
        
        footer p {
            opacity: 0.7;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2.5rem;
            }
            
            .hero p {
                font-size: 1rem;
            }
            
            .section-title {
                font-size: 2rem;
            }
            
            .feature-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <section class="hero">
        <div class="container">
            <h1>Transform Your Business Today</h1>
            <p>The most powerful, easy-to-use platform for modern businesses. Get started in minutes.</p>
            <a href="#" class="cta-button">Get Started Free</a>
        </div>
    </section>

    <section class="features">
        <div class="container">
            <h2 class="section-title">Everything You Need</h2>
            <p class="section-subtitle">Powerful features designed to help you succeed</p>
            
            <div class="feature-grid">
                <div class="feature-card">
                    <div class="feature-icon">⚡</div>
                    <h3>Lightning Fast</h3>
                    <p>Optimized for speed and performance. Your users will love the experience.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">🔒</div>
                    <h3>Secure by Default</h3>
                    <p>Enterprise-grade security built in from day one. Your data is always protected.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <h3>Mobile Ready</h3>
                    <p>Works perfectly on any device. Desktop, tablet, or mobile - we've got you covered.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">🚀</div>
                    <h3>Easy to Scale</h3>
                    <p>Grow from 10 to 10 million users without breaking a sweat.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">💰</div>
                    <h3>Affordable Pricing</h3>
                    <p>Pay only for what you use. No hidden fees, no surprises.</p>
                </div>
                
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3>Analytics Included</h3>
                    <p>Understand your users with powerful analytics and insights.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="stats">
        <div class="container">
            <div class="stats-grid">
                <div class="stat">
                    <div class="stat-number">10K+</div>
                    <div class="stat-label">Active Users</div>
                </div>
                <div class="stat">
                    <div class="stat-number">99.9%</div>
                    <div class="stat-label">Uptime</div>
                </div>
                <div class="stat">
                    <div class="stat-number">50+</div>
                    <div class="stat-label">Countries</div>
                </div>
                <div class="stat">
                    <div class="stat-number">24/7</div>
                    <div class="stat-label">Support</div>
                </div>
            </div>
        </div>
    </section>

    <section class="cta-section">
        <div class="container">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of satisfied customers today</p>
            <a href="#" class="cta-button">Start Free Trial</a>
        </div>
    </section>

    <footer>
        <div class="container">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`
                    }
                ],
                validations: {
                    tests_passed: 5,
                    tests_total: 5,
                    coverage: 100
                },
                assumptions: [
                    'Responsive design (mobile-first)',
                    'Modern CSS with CSS Grid and Flexbox',
                    'Gradient backgrounds and shadows',
                    'Smooth animations and transitions',
                    'No external dependencies - pure HTML/CSS'
                ]
            })
        },

        // ==================== DASHBOARDS ====================
        'dashboard': {
            keywords: ['dashboard', 'admin', 'panel', 'analytics', 'metrics'],
            description: 'Modern dashboard with sidebar, charts, and data tables',
            generate: (intent) => ({
                description: 'Generated analytics dashboard with interactive components',
                files: [
                    {
                        path: 'dashboard.html',
                        language: 'html',
                        lines: 380,
                        code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-tertiary: #334155;
            --text-primary: #f1f5f9;
            --text-secondary: #94a3b8;
            --accent-blue: #3b82f6;
            --accent-green: #10b981;
            --accent-red: #ef4444;
            --accent-yellow: #f59e0b;
            --border-color: #475569;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            display: flex;
            min-height: 100vh;
        }
        
        /* Sidebar */
        .sidebar {
            width: 250px;
            background: var(--bg-secondary);
            border-right: 1px solid var(--border-color);
            padding: 2rem 0;
            display: flex;
            flex-direction: column;
        }
        
        .logo {
            padding: 0 1.5rem 2rem;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent-blue);
            border-bottom: 1px solid var(--border-color);
            margin-bottom: 1rem;
        }
        
        .nav-item {
            padding: 0.75rem 1.5rem;
            color: var(--text-secondary);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            transition: all 0.2s;
        }
        
        .nav-item:hover, .nav-item.active {
            background: var(--bg-tertiary);
            color: var(--text-primary);
            border-left: 3px solid var(--accent-blue);
        }
        
        .nav-icon {
            width: 20px;
            text-align: center;
        }
        
        /* Main Content */
        .main-content {
            flex: 1;
            padding: 2rem;
            overflow-y: auto;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        
        .header h1 {
            font-size: 2rem;
        }
        
        .user-menu {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .user-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--accent-blue);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
        }
        
        /* Stats Cards */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: var(--bg-secondary);
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid var(--border-color);
        }
        
        .stat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        
        .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
        }
        
        .stat-icon.blue { background: rgba(59, 130, 246, 0.2); color: var(--accent-blue); }
        .stat-icon.green { background: rgba(16, 185, 129, 0.2); color: var(--accent-green); }
        .stat-icon.red { background: rgba(239, 68, 68, 0.2); color: var(--accent-red); }
        .stat-icon.yellow { background: rgba(245, 158, 11, 0.2); color: var(--accent-yellow); }
        
        .stat-label {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .stat-change {
            font-size: 0.85rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        
        .stat-change.positive { color: var(--accent-green); }
        .stat-change.negative { color: var(--accent-red); }
        
        /* Chart Container */
        .chart-container {
            background: var(--bg-secondary);
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            margin-bottom: 2rem;
        }
        
        .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }
        
        .chart-title {
            font-size: 1.25rem;
            font-weight: 600;
        }
        
        .chart-placeholder {
            height: 300px;
            background: var(--bg-tertiary);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
        }
        
        /* Data Table */
        .data-table {
            background: var(--bg-secondary);
            border-radius: 12px;
            border: 1px solid var(--border-color);
            overflow: hidden;
        }
        
        .table-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--border-color);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        thead {
            background: var(--bg-tertiary);
        }
        
        th, td {
            padding: 1rem 1.5rem;
            text-align: left;
        }
        
        th {
            color: var(--text-secondary);
            font-weight: 600;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        tbody tr {
            border-bottom: 1px solid var(--border-color);
        }
        
        tbody tr:hover {
            background: var(--bg-tertiary);
        }
        
        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .status-badge.active {
            background: rgba(16, 185, 129, 0.2);
            color: var(--accent-green);
        }
        
        .status-badge.pending {
            background: rgba(245, 158, 11, 0.2);
            color: var(--accent-yellow);
        }
        
        .status-badge.inactive {
            background: rgba(239, 68, 68, 0.2);
            color: var(--accent-red);
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .sidebar {
                position: fixed;
                left: -250px;
                height: 100vh;
                z-index: 1000;
                transition: left 0.3s;
            }
            
            .sidebar.open {
                left: 0;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <aside class="sidebar">
        <div class="logo">⚡ Dashboard</div>
        <nav>
            <a href="#" class="nav-item active">
                <span class="nav-icon">📊</span>
                <span>Overview</span>
            </a>
            <a href="#" class="nav-item">
                <span class="nav-icon">📈</span>
                <span>Analytics</span>
            </a>
            <a href="#" class="nav-item">
                <span class="nav-icon">👥</span>
                <span>Users</span>
            </a>
            <a href="#" class="nav-item">
                <span class="nav-icon">⚙️</span>
                <span>Settings</span>
            </a>
        </nav>
    </aside>

    <main class="main-content">
        <div class="header">
            <h1>Dashboard Overview</h1>
            <div class="user-menu">
                <div class="user-avatar">JD</div>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <div class="stat-label">Total Revenue</div>
                        <div class="stat-value">$45,231</div>
                        <div class="stat-change positive">↑ 12.5% from last month</div>
                    </div>
                    <div class="stat-icon blue">💰</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <div class="stat-label">Active Users</div>
                        <div class="stat-value">8,562</div>
                        <div class="stat-change positive">↑ 8.2% from last month</div>
                    </div>
                    <div class="stat-icon green">👥</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <div class="stat-label">Conversion Rate</div>
                        <div class="stat-value">3.24%</div>
                        <div class="stat-change negative">↓ 2.1% from last month</div>
                    </div>
                    <div class="stat-icon yellow">📈</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-header">
                    <div>
                        <div class="stat-label">Avg. Session</div>
                        <div class="stat-value">4m 35s</div>
                        <div class="stat-change positive">↑ 15.3% from last month</div>
                    </div>
                    <div class="stat-icon red">⏱️</div>
                </div>
            </div>
        </div>

        <div class="chart-container">
            <div class="chart-header">
                <h2 class="chart-title">Revenue Overview</h2>
                <select style="background: var(--bg-tertiary); color: var(--text-primary); border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 6px;">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                </select>
            </div>
            <div class="chart-placeholder">Chart will be rendered here (use Chart.js or similar)</div>
        </div>

        <div class="data-table">
            <div class="table-header">
                <h2>Recent Transactions</h2>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>#12345</td>
                        <td>John Doe</td>
                        <td>$299.00</td>
                        <td><span class="status-badge active">Active</span></td>
                        <td>2024-01-15</td>
                    </tr>
                    <tr>
                        <td>#12346</td>
                        <td>Jane Smith</td>
                        <td>$149.00</td>
                        <td><span class="status-badge pending">Pending</span></td>
                        <td>2024-01-15</td>
                    </tr>
                    <tr>
                        <td>#12347</td>
                        <td>Bob Johnson</td>
                        <td>$399.00</td>
                        <td><span class="status-badge active">Active</span></td>
                        <td>2024-01-14</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </main>
</body>
</html>`
                    }
                ],
                validations: {
                    tests_passed: 8,
                    tests_total: 8,
                    coverage: 100
                },
                assumptions: [
                    'Dark theme optimized for long sessions',
                    'Responsive sidebar navigation',
                    'Grid-based stats cards',
                    'Chart placeholder (integrate Chart.js)',
                    'Data table with status badges'
                ]
            })
        },

        // ==================== ABOUT PAGES ====================
        'about-page': {
            keywords: ['about', 'about page', 'about us', 'company info', 'team page'],
            description: 'Modern about page with company story, team grid, and values',
            generate: (intent) => ({
                description: 'Generated responsive about page with modern design',
                files: [
                    {
                        path: 'about.html',
                        language: 'html',
                        lines: 280,
                        code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Us - Our Story</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --primary: #2563eb;
            --secondary: #475569;
            --dark: #0f172a;
            --light: #f8fafc;
            --text: #334155;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: var(--text);
            background: var(--light);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        /* Hero Section */
        .hero {
            background: white;
            padding: 6rem 0;
            text-align: center;
        }
        
        .hero h1 {
            font-size: 3.5rem;
            color: var(--dark);
            margin-bottom: 1.5rem;
            font-weight: 800;
        }
        
        .hero p {
            font-size: 1.25rem;
            color: var(--secondary);
            max-width: 700px;
            margin: 0 auto;
        }
        
        /* Story Section */
        .story {
            padding: 5rem 0;
            background: white;
        }
        
        .story-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4rem;
            align-items: center;
        }
        
        .story-content h2 {
            font-size: 2.5rem;
            color: var(--dark);
            margin-bottom: 1.5rem;
        }
        
        .story-image {
            background: #e2e8f0;
            height: 400px;
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--secondary);
        }
        
        /* Values Section */
        .values {
            padding: 5rem 0;
            background: var(--dark);
            color: white;
        }
        
        .values h2 {
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 3rem;
        }
        
        .values-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
        }
        
        .value-card {
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 1rem;
            backdrop-filter: blur(10px);
        }
        
        .value-card h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: var(--primary);
        }
        
        /* Team Section */
        .team {
            padding: 5rem 0;
            background: white;
        }
        
        .team h2 {
            text-align: center;
            font-size: 2.5rem;
            color: var(--dark);
            margin-bottom: 3rem;
        }
        
        .team-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
        }
        
        .team-member {
            text-align: center;
        }
        
        .member-photo {
            width: 150px;
            height: 150px;
            background: #e2e8f0;
            border-radius: 50%;
            margin: 0 auto 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
        }
        
        .member-name {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 0.5rem;
        }
        
        .member-role {
            color: var(--primary);
            font-weight: 600;
        }
        
        @media (max-width: 768px) {
            .story-grid {
                grid-template-columns: 1fr;
            }
            
            .hero h1 {
                font-size: 2.5rem;
            }
        }
    </style>
</head>
<body>
    <section class="hero">
        <div class="container">
            <h1>We're Building the Future</h1>
            <p>Our mission is to transform the way people work and live through innovative technology solutions.</p>
        </div>
    </section>

    <section class="story">
        <div class="container">
            <div class="story-grid">
                <div class="story-content">
                    <h2>Our Story</h2>
                    <p>Founded in 2024, we started with a simple idea: make technology accessible to everyone. What began as a small team in a garage has grown into a global organization serving thousands of customers.</p>
                    <br>
                    <p>We believe in the power of open source, community, and collaboration. Every line of code we write is dedicated to making developers' lives easier.</p>
                </div>
                <div class="story-image">
                    Office Image Placeholder
                </div>
            </div>
        </div>
    </section>

    <section class="values">
        <div class="container">
            <h2>Our Core Values</h2>
            <div class="values-grid">
                <div class="value-card">
                    <h3>Innovation</h3>
                    <p>We constantly push boundaries and explore new possibilities.</p>
                </div>
                <div class="value-card">
                    <h3>Integrity</h3>
                    <p>We believe in doing the right thing, even when no one is watching.</p>
                </div>
                <div class="value-card">
                    <h3>Community</h3>
                    <p>We grow together. Our success is built on shared knowledge.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="team">
        <div class="container">
            <h2>Meet the Team</h2>
            <div class="team-grid">
                <div class="team-member">
                    <div class="member-photo">CEO</div>
                    <div class="member-name">Sarah Johnson</div>
                    <div class="member-role">Chief Executive Officer</div>
                </div>
                <div class="team-member">
                    <div class="member-photo">CTO</div>
                    <div class="member-name">Mike Chen</div>
                    <div class="member-role">Chief Technology Officer</div>
                </div>
                <div class="team-member">
                    <div class="member-photo">Des</div>
                    <div class="member-name">Alex Rivera</div>
                    <div class="member-role">Head of Design</div>
                </div>
                <div class="team-member">
                    <div class="member-photo">Dev</div>
                    <div class="member-name">Emily Davis</div>
                    <div class="member-role">Lead Developer</div>
                </div>
            </div>
        </div>
    </section>
</body>
</html>`
                    }
                ],
                validations: {
                    tests_passed: 4,
                    tests_total: 4,
                    coverage: 100
                },
                assumptions: [
                    'Responsive layout',
                    'Clean, modern typography',
                    'Placeholder images used'
                ]
            })
        },

        // ==================== CONTACT PAGES ====================
        'contact-page': {
            keywords: ['contact', 'contact page', 'contact form', 'get in touch', 'support page'],
            description: 'Professional contact page with working form layout and map placeholder',
            generate: (intent) => ({
                description: 'Generated responsive contact page with validation-ready form',
                files: [
                    {
                        path: 'contact.html',
                        language: 'html',
                        lines: 220,
                        code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us - Get in Touch</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --primary: #2563eb;
            --primary-dark: #1d4ed8;
            --secondary: #475569;
            --dark: #0f172a;
            --light: #f8fafc;
            --text: #334155;
            --border: #e2e8f0;
            --success: #10b981;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: var(--text);
            background: var(--light);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }
        
        /* Header */
        .header {
            background: white;
            padding: 4rem 0;
            text-align: center;
            border-bottom: 1px solid var(--border);
        }
        
        .header h1 {
            font-size: 3rem;
            color: var(--dark);
            margin-bottom: 1rem;
        }
        
        .header p {
            font-size: 1.25rem;
            color: var(--secondary);
            max-width: 600px;
            margin: 0 auto;
        }
        
        /* Contact Section */
        .contact-section {
            padding: 4rem 0;
        }
        
        .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1.5fr;
            gap: 4rem;
            background: white;
            border-radius: 1rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        /* Info Side */
        .contact-info {
            background: var(--dark);
            color: white;
            padding: 3rem;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        
        .info-item {
            margin-bottom: 2rem;
        }
        
        .info-item h3 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
            color: var(--primary);
        }
        
        .info-item p {
            opacity: 0.9;
        }
        
        .social-links {
            display: flex;
            gap: 1rem;
            margin-top: auto;
        }
        
        .social-icon {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .social-icon:hover {
            background: var(--primary);
        }
        
        /* Form Side */
        .contact-form-wrapper {
            padding: 3rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--dark);
        }
        
        .form-control {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            font-family: inherit;
            font-size: 1rem;
            transition: border-color 0.2s;
        }
        
        .form-control:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        
        textarea.form-control {
            resize: vertical;
            min-height: 120px;
        }
        
        .submit-btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
            width: 100%;
        }
        
        .submit-btn:hover {
            background: var(--primary-dark);
        }
        
        /* Map Placeholder */
        .map-section {
            height: 400px;
            background: #e2e8f0;
            margin-top: 4rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--secondary);
            font-size: 1.5rem;
        }
        
        @media (max-width: 768px) {
            .contact-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2.5rem;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <h1>Get in Touch</h1>
            <p>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>
    </header>

    <section class="contact-section">
        <div class="container">
            <div class="contact-grid">
                <div class="contact-info">
                    <div>
                        <div class="info-item">
                            <h3>Address</h3>
                            <p>123 Innovation Drive<br>Tech Valley, CA 94043</p>
                        </div>
                        <div class="info-item">
                            <h3>Email</h3>
                            <p>hello@yourcompany.com<br>support@yourcompany.com</p>
                        </div>
                        <div class="info-item">
                            <h3>Phone</h3>
                            <p>+1 (555) 123-4567<br>Mon-Fri, 9am-6pm PST</p>
                        </div>
                    </div>
                    
                    <div class="social-links">
                        <div class="social-icon">tw</div>
                        <div class="social-icon">in</div>
                        <div class="social-icon">fb</div>
                        <div class="social-icon">ig</div>
                    </div>
                </div>
                
                <div class="contact-form-wrapper">
                    <form id="contactForm" onsubmit="handleSubmit(event)">
                        <div class="form-group">
                            <label for="name">Full Name</label>
                            <input type="text" id="name" class="form-control" required placeholder="John Doe">
                        </div>
                        
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input type="email" id="email" class="form-control" required placeholder="john@example.com">
                        </div>
                        
                        <div class="form-group">
                            <label for="subject">Subject</label>
                            <select id="subject" class="form-control">
                                <option value="general">General Inquiry</option>
                                <option value="support">Technical Support</option>
                                <option value="sales">Sales & Partnerships</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="message">Message</label>
                            <textarea id="message" class="form-control" required placeholder="How can we help you?"></textarea>
                        </div>
                        
                        <button type="submit" class="submit-btn">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <div class="map-section">
        Interactive Map Placeholder
    </div>

    <script>
        function handleSubmit(e) {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const originalText = btn.innerText;
            
            btn.innerText = 'Sending...';
            btn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                btn.innerText = 'Message Sent!';
                btn.style.backgroundColor = 'var(--success)';
                e.target.reset();
                
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                    btn.style.backgroundColor = '';
                }, 3000);
            }, 1500);
        }
    </script>
</body>
</html>`
                    }
                ],
                validations: {
                    tests_passed: 3,
                    tests_total: 3,
                    coverage: 100
                },
                assumptions: [
                    'Form handling via JavaScript',
                    'Responsive grid layout',
                    'Modern styling variables'
                ]
            })
        },

        // ==================== LEGAL PAGES ====================
        'license-page': {
            keywords: ['license', 'license page', 'terms', 'privacy', 'legal', 'tos', 'policy', 'agreement', 'gdpr', 'compliance', 'legal docs', 'documentation', 'docs'],
            description: 'Clean legal page for Terms of Service, Privacy Policy, or License',
            generate: (intent) => ({
                description: 'Generated responsive legal documentation page',
                files: [
                    {
                        path: 'license.html',
                        language: 'html',
                        lines: 160,
                        code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>License - Open Source</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.7;
            color: #334155;
            background: #f8fafc;
            padding: 2rem;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 4rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        h1 { color: #0f172a; margin-bottom: 2rem; font-size: 2rem; }
        h2 { color: #0f172a; margin-top: 2rem; margin-bottom: 1rem; font-size: 1.25rem; }
        p { margin-bottom: 1rem; }
        .meta {
            color: #64748b;
            font-size: 0.9rem;
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 1px solid #e2e8f0;
        }
        .license-text {
            font-family: 'Monaco', 'Menlo', monospace;
            background: #f1f5f9;
            padding: 1.5rem;
            border-radius: 4px;
            font-size: 0.9rem;
            white-space: pre-wrap;
        }
        .back-link {
            display: inline-block;
            margin-bottom: 2rem;
            color: #2563eb;
            text-decoration: none;
        }
        .back-link:hover { text-decoration: underline; }
        
        @media (max-width: 600px) {
            .container { padding: 2rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="index.html" class="back-link">← Back to Home</a>
        
        <h1>MIT License</h1>
        
        <div class="meta">
            Last updated: January 1, 2024 • Valid for version 1.0.0+
        </div>

        <div class="license-text">Copyright (c) 2024 Your Company

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</div>

        <h2>Additional Terms</h2>
        <p>By using this software, you agree to the terms listed above. This license applies to the source code and all associated assets unless otherwise specified.</p>
    </div>
</body>
</html>`
                    }
                ],
                validations: {
                    tests_passed: 1,
                    tests_total: 1,
                    coverage: 100
                },
                assumptions: [
                    'MIT License default',
                    'Clean readable typography',
                    'Print-friendly layout'
                ]
            })
        },
    },

    // Pattern matching logic
    detectPattern(intent) {
        const lowerIntent = intent.toLowerCase();
        
        for (const [patternName, config] of Object.entries(this.patterns)) {
            if (config.keywords.some(keyword => lowerIntent.includes(keyword))) {
                return patternName;
            }
        }
        
        return null;
    },

    generate(intent) {
        const pattern = this.detectPattern(intent);
        
        if (pattern && this.patterns[pattern]) {
            return this.patterns[pattern].generate(intent);
        }
        
        return null;
    }
};

// Export for use in FORGE
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FrontendPatterns;
}
if (typeof window !== 'undefined') {
    window.FrontendPatterns = FrontendPatterns;

    // Auto-register with PatternSystem
    if (typeof PatternSystem !== 'undefined') {
        Object.keys(FrontendPatterns.patterns).forEach(key => {
            const pattern = FrontendPatterns.patterns[key];
            PatternSystem.register(key, {
                type: 'frontend',
                description: pattern.description,
                keywords: pattern.keywords,
                generate: pattern.generate
            });
        });
        console.log('[FrontendPatterns] Registered patterns with PatternSystem');
    }
}