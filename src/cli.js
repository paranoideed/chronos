import {Repo} from "./repo/Repo.js";
import Router from "./rest/Router.js";
import AuthCore from "./core/AuthCore.js";
import EventCore from "./core/EventCore.js";
import AuthController from "./rest/controllers/AuthController.js";
import CalendarController from "./rest/controllers/CalendarController.js";
import CalendarCore from "./core/CalendarCore.js";
import UserCore from "./core/UserCore.js";
import EventController from "./rest/controllers/EventController.js";

export async function runService() {
    const repo = new Repo(process.env.MONGO_URI);
    await repo.connect();

    const services = initServices(repo);
    const controllers = initControllers(services);

    const router = new Router(controllers);
    return await router.run();
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
        auth: new AuthController(
            services.auth,
            services.user,
        ),
        calendar: new CalendarController(services.calendar),
        events: new EventController(services.event),
    };
}

