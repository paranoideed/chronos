import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';

export function buildApp() {
    const app = express();

    app.use(helmet());
    app.use(cors({
        origin: process.env.FRONTEND_BASE_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(express.json());
    app.use(morgan('dev'));

    // --- Routes ---
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', message: 'Server is running' });
    });

    app.use('/api/auth', authRoutes);

    // DEV: uncomment for email verifying
    // app.get('/verify', (req, res) => {
    //     const { token } = req.query;
    //     if (!token) return res.status(400).send('Token is required');
    //     res.redirect(
    //         `/api/auth/verify-email?token=${encodeURIComponent(token)}`
    //     );
    // });

    return app;
}
