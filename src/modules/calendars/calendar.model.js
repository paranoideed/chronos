import mongoose from 'mongoose';

const CALENDAR_TYPES = ['primary', 'holidays', 'ordinary'];

const calendarSchema = new mongoose.Schema(
    {
        type: { type: String, enum: CALENDAR_TYPES, required: true },
        name: { type: String, required: true, trim: true },
        description: { type: String },
        color: { type: String },
    },
    { timestamps: true }
);

calendarSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

calendarSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (_, ret) {
        delete ret._id;
    }
});

export const Calendar = mongoose.model('Calendar', calendarSchema);
