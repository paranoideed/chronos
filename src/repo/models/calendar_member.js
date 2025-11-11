import mongoose from 'mongoose';

const MemberRoles = ['owner', 'editor', 'viewer'];
const MemberStatus = ['pending', 'accepted', 'declined'];

export const calendarMemberModel = new mongoose.Schema(
    {
        calendarId: { type: mongoose.Schema.Types.ObjectId, ref: 'Calendars', required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
        role: { type: String, enum: MemberRoles, required: true, default: 'viewer' },
        status: { type: String, enum: MemberStatus, required: true, default: 'pending' }
    },
    { timestamps: true }
);

calendarMemberModel.virtual('id').get(function () {
    return this._id.toHexString();
});

calendarMemberModel.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (_, ret) {
        delete ret._id;
    }
});