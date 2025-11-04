import mongoose from 'mongoose';

const MEMBER_ROLES = ['owner', 'editor', 'viewer'];
const MEMBER_STATUS = ['pending', 'accepted', 'declined'];

const calendarMemberSchema = new mongoose.Schema(
    {
        calendarId: { type: mongoose.Schema.Types.ObjectId, ref: 'Calendar', required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, enum: MEMBER_ROLES, required: true, default: 'viewer' },
        status: { type: String, enum: MEMBER_STATUS, required: true, default: 'pending' }
    },
    { timestamps: true }
);

calendarMemberSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

calendarMemberSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (_, ret) {
        delete ret._id;
    }
});

export const CalendarMember = mongoose.model('CalendarMember', calendarMemberSchema);