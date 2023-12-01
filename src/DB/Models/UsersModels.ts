import { Schema, model, type InferSchemaType } from "mongoose";
export interface User {
    user_name: string;
    email: Lowercase<string>;
    role?: "user" | "admin";
    confirmed?: boolean;
    phone?: string;
    activation_code: string;
    forget_code?: string;
    password: string;
}
const users_schema = new Schema<User>(
    {
        user_name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
        },
        role: {
            type: String,
            required: true,
            enum: ["user", "admin"],
            default: "user",
        },
        confirmed: {
            type: Boolean,
            required: true,
            default: false,
        },
        activation_code: {
            type: String,
            required: true,
        },
        password: { type: String, required: true },
        phone: { type: String },
        forget_code: { type: String },
    },
    {
        timestamps: true,
        strictQuery: true,
        toJSON: { virtuals: true },
        toObject: {
            virtuals: true,
        },
    }
);

const users_model = model<InferSchemaType<typeof users_schema>>(
    "users",
    users_schema
);

users_schema.virtual("user-comments", {
    ref: "comments",
    localField: "_id",
    foreignField: "user_id",
});

users_schema.virtual("user-videos", {
    ref: "videos",
    localField: "_id",
    foreignField: "user_id",
});

export default users_model;
