import mongoose from 'mongoose';

export const eventSchema = new mongoose.Schema(
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

eventSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

eventSchema.set('toJSON', {
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


export const eventModel = mongoose.model('Events', eventSchema);

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

// я вообще не выкупаю зачем все эти 3 эти штуки нужны объясни мне в тг пожалуйста
export const ArrangementEvent = eventModel.discriminator(
    'arrangement',
    arrangementSchema
);

export const ReminderEvent = eventModel.discriminator(
    'reminder',
    new mongoose.Schema({
        remindAt: { type: Date, required: true },
    })
);

export const TaskEvent = eventModel.discriminator(
    'task',
    new mongoose.Schema({
        dueAt: { type: Date, required: true },
        isDone: { type: Boolean, default: false },
    })
);
