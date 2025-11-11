import mongoose, {Model} from "mongoose";
import {userModel} from "./models/user.js";
import {calendarMemberModel} from "./models/calendar_member.js";
import {notificationModel} from "./models/notification.js";
import {calendarModel} from "./models/calendar.js";
import {eventAttendeeModel} from "./models/event_attendee.js";
import {eventModel, Events} from "./models/event.js";
import {ApprovalTokenModel} from "./models/approval_token.js";

export class Repo {
    private uri: string

    constructor(uri: string) {
        this.uri = uri
    }

    public async connect() : Promise<void> {
        try {
            const conn = await mongoose.connect(this.uri);
            console.log(`Database connected successfully: ${conn.connection.host}`);
        } catch (error) {
            console.error(`Error connecting to database: ${error.message}`);
            process.exit(1);
        }
    }

    public users(): Model {
        return mongoose.model('Users', userModel);
    }

    public approvalTokens(): Model {
        return mongoose.model('ApprovalTokens', ApprovalTokenModel);
    }

    public calendars(): Model {
        return mongoose.model('Calendars', calendarModel)
    }
    
    public calendarMembers(): Model {
        return mongoose.model('CalendarMembers', calendarMemberModel);
    }

    public events(): Model {
        return Events
    }

    public eventAttendees(eventType: string): Model {
        return mongoose.model('EventAttendees', eventAttendeeModel);
    }

    public notification(): Model {
        return mongoose.model('Notifications', notificationModel);
    }
}

const repo = new Repo(process.env.MONGO_URI);
export default repo;