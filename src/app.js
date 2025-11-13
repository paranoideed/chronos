import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { initRepo } from './init/repo.js';
import { initServices } from './init/services.js';
import { initControllers } from './init/controllers.js';
import { initRoutes } from './init/routes.js';
import jwt from './pkg/jwt.js';
import { auth as authFactory } from './rest/middlewares/auth.js';
import { validate } from './rest/middlewares/validate.js';

export async function buildApp() {
    const app = express();

    app.use(helmet());
    app.use(cors({
        origin: process.env.FRONTEND_BASE_URL,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(morgan('dev'));

    const { repo } = await initRepo(process.env.MONGO_URI);
    const services = initServices({ repo, jwt });
    const controllers = initControllers(services);

    const middlewares = {
        auth: authFactory({ jwtLib: jwt }), 
        validate,
    };

    // --- Routes ---
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', message: 'Server is running' });
    });

    for (const { basePath, router } of initRoutes(controllers, middlewares)) {
        app.use(basePath, router);
    }

    app.use((err, req, res, next) => {
        const status = err.statusCode || (err.message === 'FORBIDDEN' ? 403 : err.message === 'NOT_FOUND' ? 404 : 500);
        res.status(status).json({ message: err.message || 'Internal error' });
    });

    return app;
}
