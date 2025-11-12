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

    /**
     * @param {any} _
     * @param {any} ret
     */
    transform: function (_, ret) {
        delete ret._id;
    }
});


export const Events = mongoose.model('Events', eventModel);

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

export const ArrangementEvent = Events.discriminator(
    'arrangement',
    arrangementSchema
);

export const ReminderEvent = Events.discriminator(
    'reminder',
    new mongoose.Schema({
        remindAt: { type: Date, required: true },
    })
);

export const TaskEvent = Events.discriminator(
    'task',
    new mongoose.Schema({
        dueAt: { type: Date, required: true },
        isDone: { type: Boolean, default: false },
    })
);
