import mongoose from 'mongoose';

const baseEventSchema = new mongoose.Schema(
    {
        calendarId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Calendar',
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: { type: String, required: true, trim: true },
        description: { type: String },
        color: { type: String },
    },
    { timestamps: true, discriminatorKey: 'type' }
);

baseEventSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

baseEventSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (_, ret) {
        delete ret._id;
    }
});

export const Event = mongoose.model('Event', baseEventSchema);

const arrangementSchema = new mongoose.Schema({
    startAt: {
        type: Date,
        required: function () {
            return this.allDay !== true;
        },
    },
    endAt: {
        type: Date,
        required: function () {
            return this.allDay !== true;
        },
    },
    allDay: { type: Boolean, default: false },
});

arrangementSchema.pre('save', function (next) {
    if (this.allDay) {
        this.startAt = undefined;
        this.endAt = undefined;
    }
    next();
});

export const ArrangementEvent = Event.discriminator(
    'arrangement',
    arrangementSchema
);

export const ReminderEvent = Event.discriminator(
    'reminder',
    new mongoose.Schema({
        remindAt: { type: Date, required: true },
    })
);

export const TaskEvent = Event.discriminator(
    'task',
    new mongoose.Schema({
        dueAt: { type: Date, required: true },
        isDone: { type: Boolean, default: false },
    })
);
