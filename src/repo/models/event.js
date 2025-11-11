import mongoose from 'mongoose';

export const eventModel = new mongoose.Schema(
    {
        calendarId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Calendars',
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
        },
        title: { type: String, required: true, trim: true },
        description: { type: String },
        color: { type: String },
    },
    { timestamps: true, discriminatorKey: 'type' }
);

eventModel.virtual('id').get(function () {
    return this._id.toHexString();
});

eventModel.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (_, ret) {
        delete ret._id;
    }
});


//Зачем это нужно? Я крч не понял, но пусть будет закомментировано
//еси для теста то нужно пренести в папку для тестов
//export const Events = mongoose.model('Events', baseEventSchema);
// const arrangementSchema = new mongoose.Schema({
//     startAt: {
//         type: Date,
//         required: function () {
//             return this.allDay !== true;
//         },
//     },
//     endAt: {
//         type: Date,
//         required: function () {
//             return this.allDay !== true;
//         },
//     },
//     allDay: { type: Boolean, default: false },
// });
//
// arrangementSchema.pre('save', function (next) {
//     if (this.allDay) {
//         this.startAt = undefined;
//         this.endAt = undefined;
//     }
//     next();
// });
//
// export const ArrangementEvent = Events.discriminator(
//     'arrangement',
//     arrangementSchema
// );
//
// export const ReminderEvent = Events.discriminator(
//     'reminder',
//     new mongoose.Schema({
//         remindAt: { type: Date, required: true },
//     })
// );
//
// export const TaskEvent = Events.discriminator(
//     'task',
//     new mongoose.Schema({
//         dueAt: { type: Date, required: true },
//         isDone: { type: Boolean, default: false },
//     })
// );
