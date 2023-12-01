import { Schema, Types, model } from "mongoose";
interface Comment {
    user_id?: Types.ObjectId;
    comment: string;
    likes: number;
    dislikes: number;
    video_id?: Types.ObjectId;
}
const comments_schema = new Schema<Comment>(
    {
        user_id: { type: String, required: true },
        comment: { type: String, required: true },
        video_id: { type: String, required: true, ref: "videos" },
        dislikes: { type: Number, required: true, default: 0 },
        likes: { type: Number, required: true, default: 0 },
    },
    {
        timestamps: true,
        strictQuery: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

comments_schema.virtual("comment-videos", {
    ref: "videos",
    localField: "_id",
    foreignField: "comment_id",
});

const comments_model = model("comments", comments_schema);
export default comments_model;
