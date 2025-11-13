import AuthController from "../rest/controllers/auth.js";
import ApprovalController from "../rest/controllers/approval.js";
import CalendarController from "../rest/controllers/calendar.js";
import EventsController from "../rest/controllers/events.js";

export function initControllers(services) {
    return {
        auth: new AuthController(services.auth),
        approval: new ApprovalController(
            services.approval,
            services.auth,
            services.mail
        ),
        calendar: new CalendarController(services.calendar),
        events: new EventsController(services.event, services.calendar),
    };
}
