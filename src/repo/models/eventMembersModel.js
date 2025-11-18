import mongoose from 'mongoose';

const eventAttendeeStatus = ['pending', 'accepted', 'declined'];

export const eventMembersSchema = new mongoose.Schema(
    {
        eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Events', required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
        status: { type: String, enum: eventAttendeeStatus, required: true, default: 'pending' }
    },
    { timestamps: true }
);

eventMembersSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

eventMembersSchema.set('toJSON', {
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

export const eventMembersModel = mongoose.model('EventMembers', eventMembersSchema);