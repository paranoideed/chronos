import mongoose from 'mongoose';

export const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, lowercase: true, trim: true },
        secret: {
            emailVerified: { type: Boolean, required: true, default: false },
            passwordHash: { type: String, required: true, select: false },
        },
        name: { type: String },
        avatar: { type: String },
        country: { type: String }, //ISO code A-2 format
    },
    { timestamps: true }
);

userSchema.index(
    { email: 1 },
    { unique: true, collation: { locale: 'en', strength: 2 } }
);

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,

    /**
     * @param {any} _
     * @param {any} ret
     */
    transform: function (_, ret) {
        delete ret._id;
        delete ret.secret?.passwordHash;
    }
});

export const userModel = mongoose.model('Users', userSchema);