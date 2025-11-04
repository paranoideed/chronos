import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js'
export function buildApp() {
    const app = express();

    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(morgan('dev'));

    // --- Routes ---
        app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', message: 'Server is running' });
    });

    app.use('/api/auth', authRoutes);

    return app;
}