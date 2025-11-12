import mongoose from 'mongoose';

const calenderTypes = ['primary', 'holidays', 'ordinary'];

export const calendarModel = new mongoose.Schema(
    {
        type: { type: String, enum: calenderTypes, required: true },
        name: { type: String, required: true, trim: true },
        description: { type: String },
        color: { type: String },
    },
    { timestamps: true }
);

calendarModel.virtual('id').get(function () {
    return this._id.toHexString();
});

calendarModel.set('toJSON', {
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

// export const Calendars = mongoose.model('Calendars', calendarSchema);
