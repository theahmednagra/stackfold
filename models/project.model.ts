import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProject extends Document {
    infoId: Types.ObjectId;

    title: string;
    tagline: string;
    slug: string;

    description: string;

    iconUrl?: string;
    imageUrl?: string;
    projectUrl?: string;
    githubUrl?: string;

    techStack: string[];
    features: string[];

    order: number;
}

const ProjectSchema = new Schema<IProject>(
    {
        infoId: {
            type: Schema.Types.ObjectId,
            ref: "Info",
            required: true,
            index: true,
        },

        title: { type: String, required: true },
        tagline: { type: String, required: true },
        slug: { type: String, required: true, unique: true, lowercase: true },

        description: { type: String, required: true },

        imageUrl: String,
        projectUrl: String,
        githubUrl: String,

        techStack: {
            type: [String],
            default: [],
        },

        features: {
            type: [String],
            default: [],
        },

        order: {
            type: Number,
            default: 0,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Project =
    mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);