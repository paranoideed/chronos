import mongoose from 'mongoose';

const MemberRoles = ['owner', 'editor', 'viewer'];
const MemberStatus = ['pending', 'accepted', 'declined'];

export const calendarMemberSchema = new mongoose.Schema(
    {
        calendarId: { type: mongoose.Schema.Types.ObjectId, ref: 'Calendars', required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
        role: { type: String, enum: MemberRoles, required: true, default: 'viewer' },
        status: { type: String, enum: MemberStatus, required: true, default: 'pending' }
    },
    { timestamps: true }
);

calendarMemberSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

calendarMemberSchema.set('toJSON', {
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

calendarMemberSchema.index({ userId: 1 });
calendarMemberSchema.index({ calendarId: 1 });
calendarMemberSchema.index({ userId: 1, role: 1 });

export const calendarMemberModel = mongoose.model('CalendarMembers', calendarMemberSchema);