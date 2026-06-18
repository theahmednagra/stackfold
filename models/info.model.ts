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

    theme: string;

    projects: Types.ObjectId[];
    experiences: Types.ObjectId[];

    isActive: boolean;
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

        theme: {
            type: String,
            enum: ["default-dark", "default-light"],
            default: "default-dark",
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

        isActive: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

export const Info =
    mongoose.models.Info || mongoose.model<IInfo>("Info", InfoSchema);