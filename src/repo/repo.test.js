import mongoose from "mongoose";
import "dotenv/config";
import { Users } from "../repo/models/UserModel.js";
import { Calendars } from "../repo/models/CalendarModel.js";
import { CalendarMembers } from "../repo/models/CalendarMemberModel.js";
import {
    Events,
    ArrangementEvent,
    TaskEvent,
} from "../repo/models/EventModel.js";

const MONGO_URI = process.env.MONGO_URI;

// If u want use it u should to remade it)
// const seedDatabase = async () => {
//     try {
//         await mongoose.connect(MONGO_URI);
//         console.log("Database connected for seeding...");
//
//         console.log("Cleaning old data...");
//         await Users.deleteMany({});
//         await Calendars.deleteMany({});
//         await CalendarMembers.deleteMany({});
//         await Events.deleteMany({});
//
//         console.log("Creating user...");
//         const user = new Users({
//             secret: {
//                 email: "tests@example.com",
//                 passwordHash: "some-hash",
//             },
//             name: "Test User",
//         });
//         await user.save();
//         console.log(`User created with id: ${user.id}`);
//
//         console.log("Creating primary calendar...");
//         const calendar = new Calendars({
//             type: "primary",
//             name: "My Calendar",
//             color: "#007bff",
//         });
//         await calendar.save();
//         console.log(`Calendar created with id: ${calendar.id}`);
//
//         console.log("Linking user and calendar...");
//         const member = new CalendarMembers({
//             calendarId: calendar.id,
//             userId: user.id,
//             role: "owner",
//             status: "accepted",
//         });
//         await member.save();
//         console.log("Users linked as owner.");
//
//         console.log("Creating events...");
//
//         const arrangement = new ArrangementEvent({
//             calendarId: calendar.id,
//             createdBy: user.id,
//             title: "Team Meeting",
//             startAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
//             endAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
//         });
//         await arrangement.save();
//
//         const task = new TaskEvent({
//             calendarId: calendar.id,
//             createdBy: user.id,
//             title: "Finish report",
//             dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
//         });
//         await task.save();
//
//         console.log("Seeding completed successfully!");
//     } catch (error) {
//         console.error("Error during seeding:", error);
//     } finally {
//         await mongoose.connection.close();
//         console.log("Database connection closed.");
//     }
// };
//
// seedDatabase();
