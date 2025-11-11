import mongoose, {Model} from "mongoose";
import {userModel} from "./models/user.js";
import {sessionModel} from "./models/session.js";
import {calendarMemberModel} from "./models/calendar_member.js";
import {notificationModel} from "./models/notification.js";
import {calendarModel} from "./models/calendar.js";
import {eventAttendeeModel} from "./models/event_attendee.js";
import {eventModel} from "./models/event.js";

class repo {
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

    public sessions(): Model {
        return mongoose.model('UserSessions', sessionModel);
    }

    public calendars(): Model {
        return mongoose.model('Calendars', calendarModel)
    }
    
    public calendarMembers(): Model {
        return mongoose.model('CalendarMembers', calendarMemberModel);
    }

    public events(): Model {
        return mongoose.model('Events', eventModel);
    }

    public eventAttendees(eventType: string): Model {
        return mongoose.model('EventAttendees', eventAttendeeModel);
    }

    public notification(): Model {
        return mongoose.model('Notifications', notificationModel);
    }
}

const Repo = new repo(process.env.MONGO_URI);