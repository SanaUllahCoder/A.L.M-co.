import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import invoiceRoutes from './routes/invoices.js';
import productRoutes from './routes/products.js';
import shopkeeperRoutes from './routes/shopkeepers.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api', requireAuth);
app.use('/api/shopkeepers', shopkeeperRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use((req, res) => res.status(404).json({ message: 'The requested endpoint was not found.' }));
app.use(errorHandler);

export default app;
