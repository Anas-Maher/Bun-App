import { Schema, Types, model } from "mongoose";
interface Like {
    user_id?: Types.ObjectId;
    video_id?: Types.ObjectId;
}
const likes_schema = new Schema<Like>(
    {
        
	},
    {
        timestamps: true,
        strictQuery: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);
const likes_model = model("likes", likes_schema);
export default likes_model;
