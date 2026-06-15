import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    isVerified: boolean;
    verificationCode?: string;
    verificationCodeExpiry?: Date;
}

const UserSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 20,
            match: /^[a-zA-Z0-9_]+$/,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        passwordHash: {
            type: String,
            required: true,
            minlength: 6,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verificationCode: String,
        verificationCodeExpiry: Date,
    },
    {
        timestamps: true,
    }
);

export const User =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);