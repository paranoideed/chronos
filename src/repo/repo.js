import mongoose, {Model} from "mongoose";
import {userModel} from "./models/user.js";
import {calendarMemberModel} from "./models/calendarMember.js";
import {notificationModel} from "./models/notification.js";
import {calendarModel} from "./models/calendar.js";
import {eventAttendeeModel} from "./models/event_attendee.js";
import {eventModel, Events} from "./models/event.js";
import {ApprovalTokenModel} from "./models/approval_token.js";

export class Repo {
    uri;
    
    /**
     * @param {string} uri - The MongoDB connection URI.
     */
    constructor(uri) {
        this.uri = uri;
    }

    async connect() {    
        try {        
        const conn = await mongoose.connect(this.uri);        
        console.log(`Database connected successfully: ${conn.connection.host}`);    
    } catch (error) {        
        console.error(`Error connecting to database: ${error.message}`);        
        process.exit(1);
    }}

    /**
     * @returns {Model}
     */
    users() {
        return mongoose.model("Users", userModel);
    }

    /**
     * @returns {Model}
     */
    approvalTokens() {
        return mongoose.model("ApprovalTokens", ApprovalTokenModel);
    }

    /**
     * @returns {Model}
     */
    calendars() {
        return mongoose.model("Calendars", calendarModel);
    }

    /**
     * @returns {Model}
     */
    calendarMembers() {
        return mongoose.model("CalendarMembers", calendarMemberModel);
    }

    /**
     * @returns {Model}
     */
    events() {
        return Events;
    }

    /**
     * @param {string} eventType
     * @returns {Model}
     */
    eventAttendees(eventType) {
        return mongoose.model("EventAttendees", eventAttendeeModel);
    }

    /**
     * @returns {Model}
     */
    notification() {
        return mongoose.model("Notifications", notificationModel);
    }
}

const repo = new Repo(process.env.MONGO_URI);
export default repo;