import mongoose from 'mongoose';

const NotificationChannels = ['email', 'profile'];
const NotificationStatuses = ['pending', 'sent', 'failed'];

export const notificationModel = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Events', required: true },
        channel: { type: String, enum: NotificationChannels, required: true },
        status: { type: String, enum: NotificationStatuses, required: true, default: 'pending' },
        sentTime: { type: Date, required: true }
    },
    { timestamps: true }
);

notificationModel.virtual('id').get(function () {
    return this._id.toHexString();
});

notificationModel.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (_, ret) {
        delete ret._id;
    }
});

// export const Notifications = mongoose.model('Notifications', notificationSchema);