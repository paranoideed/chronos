import mongoose from "mongoose";
import "dotenv/config";
import { User } from "../models/User.js";
import { Calendar } from "../models/Calendar.js";
import { CalendarMember } from "../models/CalendarMember.js";
import {
    Event,
    ArrangementEvent,
    TaskEvent,
} from "../models/Event.js";

const MONGO_URI = process.env.MONGO_URI;

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Database connected for seeding...");

        console.log("Cleaning old data...");
        await User.deleteMany({});
        await Calendar.deleteMany({});
        await CalendarMember.deleteMany({});
        await Event.deleteMany({});

        console.log("Creating user...");
        const user = new User({
            secret: {
                email: "test@example.com",
                passwordHash: "some-hash",
            },
            name: "Test User",
        });
        await user.save();
        console.log(`User created with id: ${user.id}`);

        console.log("Creating primary calendar...");
        const calendar = new Calendar({
            type: "primary",
            name: "My Calendar",
            color: "#007bff",
        });
        await calendar.save();
        console.log(`Calendar created with id: ${calendar.id}`);

        console.log("Linking user and calendar...");
        const member = new CalendarMember({
            calendarId: calendar.id,
            userId: user.id,
            role: "owner",
            status: "accepted",
        });
        await member.save();
        console.log("User linked as owner.");

        console.log("Creating events...");

        const arrangement = new ArrangementEvent({
            calendarId: calendar.id,
            createdBy: user.id,
            title: "Team Meeting",
            startAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
            endAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
        });
        await arrangement.save();

        const task = new TaskEvent({
            calendarId: calendar.id,
            createdBy: user.id,
            title: "Finish report",
            dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        });
        await task.save();

        console.log("Seeding completed successfully!");
    } catch (error) {
        console.error("Error during seeding:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed.");
    }
};

seedDatabase();
