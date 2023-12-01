import { Schema, type InferSchemaType, Types, model } from "mongoose";
export interface Video {
    user_id?: Types.ObjectId;
    title: string;
    description: string;
    path: string;
    likes: number;
    dislikes: number;
    // comments: Types.Array<Record<string, string>>;
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
        likes: {
            type: Number,
            required: true,
            default: 0,
        },
        dislikes: {
            type: Number,
            required: true,
            default: 0,
        },
        // comments: [
        //     {
        //         type: {
        //             comment: {
        //                 type: String,
        //                 required: true,
        //             },
        //             likes: {
        //                 type: Number,
        //                 required: true,
        //                 default: 0,
        //             },
        //             dislikes: {
        //                 type: Number,
        //                 required: true,
        //                 default: 0,
        //             },
        //         },
        //     },
        // ],
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
