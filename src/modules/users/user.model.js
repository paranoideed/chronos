import mongoose from 'mongoose';
const userSchema = new mongoose.Schema(
    {
        secret: {
            email: { type: String, required: true, lowercase: true, trim: true },
            emailVerified: { type: Boolean, required: true, default: false },
            passwordHash: { type: String, required: true, select: false },
        },
        name: { type: String },
        avatar: { type: String },
        tz: { type: String },
        locale: { type: String },
    },
    { timestamps: true }
);

userSchema.index({ 'secret.email': 1 }, { unique: true });

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (_, ret) {
        delete ret._id;
        delete ret.secret?.passwordHash;
    }
});

export const User = mongoose.model('User', userSchema);