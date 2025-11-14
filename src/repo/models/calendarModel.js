import mongoose from 'mongoose';

const calenderTypes = ['primary', 'holidays', 'ordinary'];

export const calendarSchema = new mongoose.Schema(
    {
        type: { type: String, enum: calenderTypes, required: true },
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

    /**
     * @param {any} _
     * @param {any} ret
     */
    transform: function (_, ret) {
        delete ret._id;
    }
});

export const calendarModel = mongoose.model('Calendars', calendarSchema);
