import mongoose from 'mongoose';

export const userModel = new mongoose.Schema(
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

userModel.index(
    { "secret.email": 1 },
    { unique: true, collation: { locale: 'en', strength: 2 } }
);

userModel.virtual('id').get(function () {
    return this._id.toHexString();
});

userModel.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (_, ret) {
        delete ret._id;
        delete ret.secret?.passwordHash;
    }
});

// export const Users = mongoose.model('Users', userModel);