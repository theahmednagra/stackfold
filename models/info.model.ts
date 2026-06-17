import mongoose, { Schema, Document, Types } from "mongoose";

export interface IInfo extends Document {
    userId: Types.ObjectId;

    fullname: string;
    username: string;
    bio: string;
    description: string;

    socialLinks: string[];
    contact: string;

    endNote?: string;

    themeId: string;

    projects: Types.ObjectId[];
    experiences: Types.ObjectId[];
}

const InfoSchema = new Schema<IInfo>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        // username: {
        //     type: String,
        //     required: true,
        //     unique: true,
        //     lowercase: true,
        //     trim: true,
        //     index: true
        // },

        fullname: { type: String, required: true },
        bio: { type: String, required: true },
        description: { type: String, required: true },

        socialLinks: {
            type: [String],
            default: [],
        },

        contact: {
            type: String,
            required: true,
        },

        endNote: String,

        themeId: {
            type: String,
            default: "default-theme",
        },

        projects: [
            {
                type: Schema.Types.ObjectId,
                ref: "Project",
            },
        ],

        experiences: [
            {
                type: Schema.Types.ObjectId,
                ref: "Experience",
            },
        ],
    },
    {
        timestamps: true,
    }
);

export const Info =
    mongoose.models.Info || mongoose.model<IInfo>("Info", InfoSchema);