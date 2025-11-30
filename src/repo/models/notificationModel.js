import mongoose from 'mongoose';

const NotificationChannels = ['email', 'profile'];
const NotificationStatuses = ['pending', 'sent', 'failed'];

export const notificationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Events', required: true },
        channel: { type: String, enum: NotificationChannels, required: true },
        status: { type: String, enum: NotificationStatuses, required: true, default: 'pending' },
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

    /**
     * @param {any} _
     * @param {any} ret
     */
    transform: function (_, ret) {
        delete ret._id;
    }
});

notificationSchema.index({ userId: 1 });
notificationSchema.index({ eventId: 1 });

export const notificationModel = mongoose.model('Notifications', notificationSchema);