"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
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
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT || 4000);
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use((0, cors_1.default)({ origin: process.env.WEB_URL || 'http://localhost:5173', credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, express_rate_limit_1.default)({ windowMs: 60_000, max: 200, standardHeaders: true }));
// Serve static uploaded files
app.use('/uploads', express_1.default.static(path_1.default.resolve(process.cwd(), 'uploads')));
app.get('/api/v1/health', (_, res) => res.json({ success: true, message: 'Success', data: { status: 'healthy', service: 'interiorg-api', timestamp: new Date() } }));
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
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => console.log(`InteriorG API → http://localhost:${PORT}`));
