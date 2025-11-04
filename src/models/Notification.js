import mongoose from 'mongoose';

const NOTIFICATION_CHANNELS = ['email', 'profile'];
const NOTIFICATION_STATUS = ['pending', 'sent', 'failed'];

const notificationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
        channel: { type: String, enum: NOTIFICATION_CHANNELS, required: true },
        status: { type: String, enum: NOTIFICATION_STATUS, required: true, default: 'pending' },
        sentTime: { type: Date, required: true }
    },
    { timestamps: true }
);

notificationSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

notificationSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (_, ret) {
        delete ret._id;
    }
});

export const Notification = mongoose.model('Notification', notificationSchema);