import mongoose from 'mongoose';

const eventAttendeeStatus = ['pending', 'accepted', 'declined'];

export const eventAttendeeModel = new mongoose.Schema(
    {
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Events', required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
        status: { type: String, enum: eventAttendeeStatus, required: true, default: 'pending' }
    },
    { timestamps: true }
);

eventAttendeeModel.virtual('id').get(function () {
    return this._id.toHexString();
});

eventAttendeeModel.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (_, ret) {
        delete ret._id;
    }
});
