import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth';
import productsRouter from './routes/products';
import cartRouter from './routes/cart';
import ordersRouter from './routes/orders';
import inventoryRouter from './routes/inventory';
import adminRouter from './routes/admin';
import addressesRouter from './routes/addresses';
import customizationsRouter from './routes/customizations';
import uploadRouter from './routes/upload';
import visualizerRouter from './routes/visualizer';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({ origin: process.env.WEB_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimit({ windowMs: 60_000, max: 200, standardHeaders: true }));

// Serve static uploaded files
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/api/v1/health', (_, res) => res.json({ success: true, message: 'Success', data: { status: 'healthy', service: 'interiorg-api', timestamp: new Date() } }));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productsRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/inventory', inventoryRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/addresses', addressesRouter);
app.use('/api/v1/customizations', customizationsRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/visualizer', visualizerRouter);

app.use(errorHandler);

app.listen(PORT, () => console.log(`InteriorG API → http://localhost:${PORT}`));
