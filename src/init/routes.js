import makeAuthRoutes from '../rest/routes/auth.js';
import makeApprovalRoutes from '../rest/routes/approval.js';
import makeCalendarRoutes from '../rest/routes/calendarRoutes.js';
import makeEventRoutes from '../rest/routes/eventRoutes.js';

export function initRoutes(controllers, middlewares) {
  // middlewares: { auth: authMiddleware, ... }
  return [
    { basePath: '/api/auth', router: makeAuthRoutes({ controller: controllers.auth, mw: middlewares }) },
    { basePath: '/api/approval', router: makeApprovalRoutes({ controller: controllers.approval, mw: middlewares }) },
    { basePath: '/api/calendars', router: makeCalendarRoutes({ controller: controllers.calendar, mw: middlewares }) },
    { basePath: '/api/events', router: makeEventRoutes({ controller: controllers.events, mw: middlewares }) },
  ];
}
