import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

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

    return app;
}