import {errorRendererMiddleware} from "./rest/middlewares/errorRendererMiddleware.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import jwt from "jsonwebtoken";
import {Repo} from "./repo/Repo.js";

import AuthCore from "./core/AuthCore.js";
import EventCore from "./core/EventCore.js";
import CalendarCore from "./core/CalendarCore.js";
import UserCore from "./core/UserCore.js";

import AuthController from "./rest/controllers/AuthController.js";
import CalendarController from "./rest/controllers/CalendarController.js";
import EventController from "./rest/controllers/EventController.js";

import createAuthRouter from "./rest/routes/authRoutes.js";
import createCalendarRouter from "./rest/routes/calendarRoutes.js";
import createEventRouter from "./rest/routes/eventRoutes.js";
import { createAuthMiddleware } from "./rest/middlewares/authMiddleware.js";
import createUserRouter from "./rest/routes/userRouters.js";
import UserController from "./rest/controllers/UserController.js";

export default class App {
    repository
    core

    constructor(mongoUri) {
        this.repository = new Repo(mongoUri);

        this.core = {
            authCore: new AuthCore(this.repository),
            eventCore: new EventCore(this.repository),
            calendarCore: new CalendarCore(this.repository),
            userCore: new UserCore(this.repository),
        };
    }

    async startHttpServer(port) {

        const service = express()

        service.use(helmet());
        service.use(cors());
        service.use(morgan('dev')); // 'dev' - это формат логгирования

        // 2. ПАРСЕР ТЕЛА ЗАПРОСА (Обязательно до маршрутов с POST/PUT)
        service.use(express.json());
        service.use(express.urlencoded({ extended: true }));

        await this.repository.connect();

        // initialize controllers
        const authController = new AuthController(this.core.authCore, this.core.userCore);
        const calendarController = new CalendarController(this.core.calendarCore);
        const eventController = new EventController(this.core.eventCore);
        const userController = new UserController(this.core.userCore);

        // middleware
        const authMiddleware = createAuthMiddleware({
            jwtLib: jwt,
            jwtSecret: process.env.JWT_SECRET,
        });

        // routers
        const authRouter = createAuthRouter(authController);
        const calendarRouter = createCalendarRouter(calendarController, authMiddleware);
        const eventRouter = createEventRouter(eventController, authMiddleware);
        const userRouter = createUserRouter(userController, authMiddleware);

        service.get('/ping', (req, res) => {
            res.status(200).json({ status: 'ok', message: 'pong!' });
        });
        service.use('/api/auth', authRouter);
        service.use('/api/calendars', calendarRouter);
        service.use('/api/calendars', eventRouter);
        service.use('/api/users', userRouter);
        service.use(errorRendererMiddleware);

        service.listen(port, () => {
            console.log(`Server is running on port http://localhost:${port}`);
        });
    }
}