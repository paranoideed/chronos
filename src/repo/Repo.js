import mongoose, {Model} from "mongoose";
import {userModel} from "./models/userModel.js";
import {approvalTokenModel} from "./models/approvalTokenModel.js";
import {calendarModel} from "./models/calendarModel.js";
import {calendarMemberModel} from "./models/calendarMemberModel.js";
import * as Events from "node:events";
import {eventModel} from "./models/eventModel.js";
import {eventMembersModel} from "./models/eventMembersModel.js";
import {notificationModel} from "./models/notificationModel.js";

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
        return userModel
    }

    /**
     * @returns {Model}
     */
    approvalTokens() {
        return approvalTokenModel;
    }

    /**
     * @returns {Model}
     */
    calendars() {
        return calendarModel
    }

    /**
     * @returns {Model}
     */
    calendarMembers() {
        return calendarMemberModel;
    }

    /**
     * @returns {Model}
     */
    events() {
        return eventModel;
    }

    /**
     * @param {string} eventType
     * @returns {Model}
     */
    eventAttendees(eventType) {
        return eventMembersModel;
    }

    /**
     * @returns {Model}
     */
    notification() {
        return notificationModel;
    }
}
