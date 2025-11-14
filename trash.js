import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import { Repo } from './src/repo/Repo.js';
import createRouter from './src/rest/Router.js';

import AuthCore from './src/core/AuthCore.js';
import EventCore from './src/core/EventCore.js';
import CalendarCore from './src/core/CalendarCore.js';
import UserCore from './src/core/UserCore.js';

import AuthController from './src/rest/controllers/AuthController.js';
import CalendarController from './src/rest/controllers/CalendarController.js';
import EventController from './src/rest/controllers/EventController.js';

import { errorRendererMiddleware } from './src/rest/middlewares/errorRendererMiddleware.js';

export default class App {
    repo;

    constructor(mongoUri) {
        this.repo = new Repo(mongoUri);
    }

    async run(port) {
        await this.repo.connect();

        const services = initServices(this.repo);
        const controllers = initControllers(services);

        const app = express();

        // Глобальные мидлвары – здесь как раз json
        app.use(helmet());
        app.use(
            cors({
                origin: process.env.FRONTEND_BASE_URL,
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                allowedHeaders: ['Content-Type', 'Authorization'],
            }),
        );
        app.use(express.json({ limit: '1mb' }));
        app.use(express.urlencoded({ extended: true }));
        app.use(morgan('dev'));

        const router = createRouter(controllers);

        // ВСЕ API под /api
        app.use('/api', router);

        app.use(errorRendererMiddleware);

        return new Promise((resolve) => {
            app.listen(port, () => {
                console.log(`Server is running on port ${port}`);
                resolve(app);
            });
        });
    }
}

function initServices(repo) {
    return {
        auth: new AuthCore(repo),
        calendar: new CalendarCore(repo),
        event: new EventCore(repo),
        user: new UserCore(repo),
    };
}

export function initControllers(services) {
    return {
        auth: new AuthController(services.auth, services.user),
        calendar: new CalendarController(services.calendar),
        event: new EventController(services.event),
    };
}
import 'dotenv/config';
import App from './src/app.js';

const PORT = Number(process.env.PORT ?? 3000);
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('MONGO_URI is not set');
    process.exit(1);
}

const start = async () => {
    const app = new App(MONGO_URI);
    await app.run(PORT);
};

start().catch((e) => {
    console.error('Failed to start server', e);
    process.exit(1);
});

import { Router } from 'express';
import { authMiddleware } from './middlewares/authMiddleware.js';

export default function createRouter({ auth, calendar, event }) {
    const router = Router();

    // /api/ping
    router.get('/ping', (req, res) => {
        res.status(200).json({ status: 'ok', message: 'pong!' });
    });

    // ==== Auth ====
    // Итоговые пути: POST /api/register, /api/login, ...
    router.post('/register',
        (req, res, next) => {
            auth.registerUser(req, res, next);
        });

    router.post('/login',
        (req, res, next) => {
            auth.loginUser(req, res, next);
        });

    router.post('/verify-email', auth.verifyEmail.bind(auth));
    router.post(
        '/verify-email/resend',
        auth.resendVerification.bind(auth),
    );

    // ==== Calendars ====
    router.get(
        '/calendars',
        authMiddleware,
        calendar.listMineCalendars.bind(calendar),
    );
    router.post(
        '/calendars',
        authMiddleware,
        calendar.createCalendar.bind(calendar),
    );
    router.get(
        '/calendars/:id',
        authMiddleware,
        calendar.getCalendar.bind(calendar),
    );
    router.put(
        '/calendars/:id',
        authMiddleware,
        calendar.updateCalendar.bind(calendar),
    );
    router.delete(
        '/calendars/:id',
        authMiddleware,
        calendar.deleteCalendar.bind(calendar),
    );

    // ==== Events ====
    router.get(
        '/events',
        authMiddleware,
        event.listEvents.bind(event),
    );
    router.post(
        '/events',
        authMiddleware,
        event.createEvent.bind(event),
    );
    router.get(
        '/events/:id',
        authMiddleware,
        event.getEvent.bind(event),
    );
    router.put(
        '/events/:id',
        authMiddleware,
        event.updateEvent.bind(event),
    );
    router.delete(
        '/events/:id',
        authMiddleware,
        event.deleteEvent.bind(event),
    );

    return router;
}
