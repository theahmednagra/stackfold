import mongoose, { Schema, Document, Types } from "mongoose";



export interface IExperience extends Document {

    infoId: Types.ObjectId;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
    currentJob: boolean;
}

const ExperienceSchema = new Schema<IExperience>(
    {
        infoId: {
            type: Schema.Types.ObjectId,
            ref: "Info",
            required: true,
            index: true,
            unique: true,
        },
        company: { type: String, required: true },
        role: { type: String, required: true },
        startDate: { type: String, required: true },
        currentJob: { type: Boolean, default: false },
        endDate: { type: String, default: "" },
        description: { type: String, required: true },
    },
    {
        timestamps: true,
    }

);

export const Experience =
    mongoose.models.Experience ||
    mongoose.model<IExperience>("Experience", ExperienceSchema);

