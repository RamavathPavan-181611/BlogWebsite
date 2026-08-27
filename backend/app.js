import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import connectDatabase from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { getJwtSecret } from './config/auth.js';

dotenv.config();

const app = express();

getJwtSecret();

// Security middleware
app.use(helmet());

// CORS configuration - restrict to specific origins in production
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['http://localhost:8000', 'http://localhost:3000'];

if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('CORS_ORIGINS must be configured in production');
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

app.get('/', (req, res) => {
  res.send('Blog Platform Backend is running successfully!');
});

app.get('/healthz', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? 'ok' : 'unavailable',
    database: databaseReady ? 'connected' : 'disconnected'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export const startServer = async () => {
  await connectDatabase();
  const port = process.env.PORT || 8080;
  return app.listen(port, () => {
    console.log(`Backend server is running on port: ${port}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((error) => {
    console.error('Backend startup failed:', error);
    process.exit(1);
  });
}

export default app;
