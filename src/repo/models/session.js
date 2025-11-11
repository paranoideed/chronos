import mongoose from 'mongoose';

export const sessionModel = new mongoose.Schema(
    {
        tokenHash: { type: String, required: true, index: true, unique: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true, index: true },
        type: { type: String, enum: ['email_verify', 'password_reset'], required: true, index: true },
        meta: { type: mongoose.Schema.Types.Mixed },
        used: { type: Boolean, default: false, index: true },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

sessionModel.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// export const UserSessions = mongoose.model('UserSessions', userSessionModel);
