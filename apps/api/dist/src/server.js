"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const cart_1 = __importDefault(require("./routes/cart"));
const orders_1 = __importDefault(require("./routes/orders"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const admin_1 = __importDefault(require("./routes/admin"));
const addresses_1 = __importDefault(require("./routes/addresses"));
const customizations_1 = __importDefault(require("./routes/customizations"));
const upload_1 = __importDefault(require("./routes/upload"));
const visualizer_1 = __importDefault(require("./routes/visualizer"));
const customizerDesigns_1 = __importDefault(require("./routes/customizerDesigns"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const aiChat_1 = __importDefault(require("./routes/aiChat"));
const activityLogs_1 = __importDefault(require("./routes/activityLogs"));
const mongodb_1 = require("./lib/mongodb");
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT || 4000);
// Initialize MongoDB service for custom designs, reviews, AI chats & activity logs
(0, mongodb_1.connectMongoDB)().catch(err => console.warn('MongoDB connection notice:', err?.message || err));
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
// Allow both localhost and local network Wi-Fi origins for mobile phone AR access
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, express_rate_limit_1.default)({ windowMs: 60_000, max: 200, standardHeaders: true }));
// Serve static uploaded files
app.use('/uploads', express_1.default.static(path_1.default.resolve(process.cwd(), 'uploads')));
app.get('/api/v1/health', (_, res) => {
    const mongo = (0, mongodb_1.getMongoStatus)();
    res.json({
        success: true,
        message: 'Success',
        data: {
            status: 'healthy',
            service: 'interiorg-api',
            databases: {
                postgres: 'connected',
                mongodb: mongo
            },
            timestamp: new Date()
        }
    });
});
// Return host network IP for mobile QR code connectivity
app.get('/api/v1/network-info', (_, res) => {
    const interfaces = os_1.default.networkInterfaces();
    const addresses = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name] || []) {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push(iface.address);
            }
        }
    }
    const bestIp = addresses.find(ip => ip.startsWith('192.168.1.')) || addresses.find(ip => ip.startsWith('192.168.')) || addresses[0] || 'localhost';
    res.json({ success: true, ip: bestIp, allIps: addresses });
});
// Root route handler: serves a luxury status dashboard for browsers & JSON for API clients
app.get('/', (req, res) => {
    if (req.accepts('html')) {
        return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>InteriorG API — Server Online</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: #0d0d0d;
            color: #f5f5f7;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
          }
          .card {
            background: #18181b;
            border: 1px solid #27272a;
            border-radius: 16px;
            max-width: 640px;
            width: 100%;
            padding: 36px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(34, 197, 94, 0.15);
            color: #4ade80;
            border: 1px solid rgba(34, 197, 94, 0.3);
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 16px;
          }
          .pulse {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #22c55e;
            box-shadow: 0 0 10px #22c55e;
          }
          h1 {
            font-size: 26px;
            font-weight: 700;
            letter-spacing: -0.02em;
            margin-bottom: 8px;
            color: #ffffff;
          }
          p {
            color: #a1a1aa;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .links-title {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #71717a;
            font-weight: 600;
            margin-bottom: 12px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 24px;
          }
          .link-item {
            background: #27272a;
            border: 1px solid #3f3f46;
            border-radius: 10px;
            padding: 12px 14px;
            color: #e4e4e7;
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.2s ease;
          }
          .link-item:hover {
            background: #3f3f46;
            border-color: #71717a;
            color: #ffffff;
          }
          .link-item code {
            color: #a1a1aa;
            font-size: 11px;
          }
          .btn-row {
            display: flex;
            gap: 12px;
            border-top: 1px solid #27272a;
            padding-top: 20px;
          }
          .btn-primary {
            flex: 1;
            background: #c5a880;
            color: #0d0d0d;
            font-weight: 600;
            font-size: 14px;
            padding: 12px 18px;
            border-radius: 8px;
            text-align: center;
            text-decoration: none;
            transition: opacity 0.2s;
          }
          .btn-primary:hover { opacity: 0.9; }
          .btn-secondary {
            flex: 1;
            background: #27272a;
            color: #f4f4f5;
            font-weight: 600;
            font-size: 14px;
            padding: 12px 18px;
            border-radius: 8px;
            text-align: center;
            text-decoration: none;
            transition: background 0.2s;
          }
          .btn-secondary:hover { background: #3f3f46; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">
            <span class="pulse"></span>
            InteriorG API Active • Port 4000
          </div>
          <h1>InteriorG Core Backend API</h1>
          <p>The REST API and microservices for the InteriorG E-Commerce & Custom Interiors platform are running smoothly.</p>
          
          <div class="links-title">Available Endpoints</div>
          <div class="grid">
            <a href="/api/v1/health" class="link-item" target="_blank">
              <span>Health Check</span>
              <code>/health</code>
            </a>
            <a href="/api/v1/products" class="link-item" target="_blank">
              <span>Products Catalog</span>
              <code>/products</code>
            </a>
            <a href="/api/v1/products/categories" class="link-item" target="_blank">
              <span>Categories</span>
              <code>/categories</code>
            </a>
            <a href="/api/v1/customizations/calculate" class="link-item" target="_blank">
              <span>Wall Calculator</span>
              <code>/customizations</code>
            </a>
          </div>

          <div class="btn-row">
            <a href="http://localhost:5174" class="btn-primary" id="web-btn">Open Web App Storefront</a>
            <a href="/api/v1/health" class="btn-secondary" target="_blank">View JSON Health</a>
          </div>
        </div>
        <script>
          // Detect whether port 5174 or 5173 is the active web app
          fetch('http://localhost:5173', { mode: 'no-cors' })
            .then(() => { document.getElementById('web-btn').href = 'http://localhost:5173'; })
            .catch(() => {});
        </script>
      </body>
      </html>
    `);
    }
    res.json({
        success: true,
        service: 'interiorg-api',
        status: 'healthy',
        message: 'InteriorG API is running',
        version: '1.0.0',
        endpoints: {
            health: '/api/v1/health',
            auth: '/api/v1/auth',
            products: '/api/v1/products',
            cart: '/api/v1/cart',
            orders: '/api/v1/orders',
            inventory: '/api/v1/inventory',
            customizations: '/api/v1/customizations',
            upload: '/api/v1/upload',
            visualizer: '/api/v1/visualizer',
            customizerDesigns: '/api/v1/customizer-designs',
            reviews: '/api/v1/reviews',
            aiChat: '/api/v1/ai-chat',
            activityLogs: '/api/v1/activity-logs'
        }
    });
});
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/products', products_1.default);
app.use('/api/v1/cart', cart_1.default);
app.use('/api/v1/orders', orders_1.default);
app.use('/api/v1/inventory', inventory_1.default);
app.use('/api/v1/admin', admin_1.default);
app.use('/api/v1/addresses', addresses_1.default);
app.use('/api/v1/customizations', customizations_1.default);
app.use('/api/v1/upload', upload_1.default);
app.use('/api/v1/visualizer', visualizer_1.default);
app.use('/api/v1/customizer-designs', customizerDesigns_1.default);
app.use('/api/v1/reviews', reviews_1.default);
app.use('/api/v1/ai-chat', aiChat_1.default);
app.use('/api/v1/activity-logs', activityLogs_1.default);
// 404 Catch-All Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.path}`,
        suggestion: 'Visit http://localhost:4000/ or /api/v1/health for available endpoints'
    });
});
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => console.log(`InteriorG API → http://localhost:${PORT}`));
