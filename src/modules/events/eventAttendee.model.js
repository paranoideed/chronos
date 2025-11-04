import mongoose from 'mongoose';

const ATTENDEES_STATUS = ['pending', 'accepted', 'declined'];

const eventAttendeeSchema = new mongoose.Schema(
    {
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ATTENDEES_STATUS, required: true, default: 'pending' }
    },
    { timestamps: true }
);

eventAttendeeSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

eventAttendeeSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (_, ret) {
        delete ret._id;
    }
});

export const EventAttendee = mongoose.model('EventAttendee', eventAttendeeSchema);