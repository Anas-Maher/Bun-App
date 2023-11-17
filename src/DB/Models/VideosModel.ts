import { Schema, type InferSchemaType, Types, model } from "mongoose";
export interface Video {
    user_id?: Types.ObjectId;
    title: string;
    description: string;
    path: string;
}
const videos_schema = new Schema<Video>(
    {
        user_id: {
            type: Types.ObjectId,
            required: true,
            ref: "users",
        },
        description: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        strictQuery: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);
const videos_model = model<InferSchemaType<typeof videos_schema>>(
    "videos",
    videos_schema
);
export default videos_model;
