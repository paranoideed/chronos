import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import {authMiddleware} from "./middlewares/authMiddleware.js";

export default class Router {
    constructor({ authController, calendarController, eventController }) {
        this.authController = authController;
        this.calendarController = calendarController;
        this.eventController = eventController;
    }

    async run() {
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

        app.get('/ping', (req, res) => {
            res.status(200).json({ status: 'ok', message: 'pong!' });
        });

        // Auth
        app.post('/api/register', this.authController.registerUser);
        app.post('/api/login', this.authController.loginUser);
        app.post('/api/verify-email', this.authController.verifyEmail);
        app.post('/api/verify-email/resend', this.authController.resendVerification);

        // Calendars
        app.get('/api/calendars', authMiddleware, this.calendarController.listMineCalendars);
        app.post('/api/calendars', authMiddleware, this.calendarController.createCalendar);
        app.get('/api/calendars/:id', authMiddleware, this.calendarController.getCalendar);
        app.put('/api/calendars/:id', authMiddleware, this.calendarController.updateCalendar);
        app.delete('/api/calendars/:id', authMiddleware, this.calendarController.deleteCalendar);

        // Events
        app.get('/api/events', authMiddleware, this.eventController.listEvents);
        app.post('/api/events', authMiddleware, this.eventController.createEvent);
        app.get('/api/events/:id', authMiddleware, this.eventController.getEvent);
        app.put('/api/events/:id', authMiddleware, this.eventController.updateEvent);
        app.delete('/api/events/:id', authMiddleware, this.eventController.deleteEvent);

        return app;
    }
}
