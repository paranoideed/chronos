import AuthService from "../domain/auth.js";
import ApprovalService from "../domain/approval.js";
import CalendarService from "../domain/calendar.js";
import EventService from "../domain/event.js";
import Mail from "../domain/mail.js";

export function initServices({ repo }) {
  const mail = new Mail();

  return {
    auth: new AuthService(repo),
    approval: new ApprovalService(repo),
    calendar: new CalendarService(repo),
    event: new EventService(repo),
    mail,
  };
}