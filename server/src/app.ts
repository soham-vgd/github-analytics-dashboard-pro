import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import profileRoutes from './routes/profile.routes';
import activityRoutes from './routes/activity.routes';
import { errorHandler } from './utils/AppError';

const app = express();

// Security & Middleware
app.use(helmet());
app.use(cors()); // In production, configure origin
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/profile', profileRoutes);
app.use('/api/activity', activityRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Error Handling
app.use(errorHandler);

export default app;
