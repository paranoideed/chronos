import {errorRendererMiddleware} from "./rest/middlewares/errorRendererMiddleware.js";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
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
import createUserRouter from "./rest/routes/userRouters.js";
import UserController from "./rest/controllers/UserController.js";
import Approver from "./approvaler/Approver.js";
import Mailer from "./mailer/Mailer.js";
import {Bucket} from "./repo/aws/Bucket.js";

export default class App {
    repository
    core

    constructor(mongoUri) {
        this.repository = new Repo(mongoUri);

        const mailer = new Mailer()
        const approver = new Approver(this.repository, mailer);
        const S3Bucket = new Bucket({
            bucketName: process.env.AWS_BUCKET_NAME,
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });

        this.core = {
            authCore: new AuthCore(this.repository, approver),
            eventCore: new EventCore(this.repository),
            calendarCore: new CalendarCore(this.repository),
            userCore: new UserCore(this.repository, S3Bucket),
        };
    }

    async startHttpServer(port) {

        const service = express()

        service.use(helmet());
        service.use(cors());
        service.use(morgan('dev'));

        service.use(express.json());
        service.use(express.urlencoded({ extended: true }));

        await this.repository.connect();

        // initialize controllers
        const authController = new AuthController(this.core.authCore, this.core.userCore);
        const calendarController = new CalendarController(this.core.calendarCore);
        const eventController = new EventController(this.core.eventCore);
        const userController = new UserController(this.core.userCore);

        // routers
        const authRouter = createAuthRouter(authController);
        const calendarRouter = createCalendarRouter(calendarController);
        const eventRouter = createEventRouter(eventController);
        const userRouter = createUserRouter(userController);

        service.get('/ping', (req, res) => {
            res.status(200).json({ status: 'ok', message: 'pong!' });
        });
        service.use(
            '/api/auth', authRouter,
        );
        service.use(
            '/api/calendars', calendarRouter,
        );
        service.use(
            '/api/calendars', eventRouter,
        );
        service.use(
            '/api/users', userRouter,
        );
        service.use(errorRendererMiddleware);

        service.listen(port, () => {
            console.log(`Server is running on port http://localhost:${port}`);
        });
    }
}