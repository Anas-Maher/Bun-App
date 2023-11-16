import { Prettify } from "elysia/dist/types.js";
import { Schema, model, InferSchemaType, Types } from "mongoose";
import Hash_password from "../../utils/create_password.js";
export interface User {
    user_name: string;
    email: Lowercase<string>;
    role?: "user" | "admin";
    confirmed?: boolean;
    phone?: string;
    activation_code: {
        valid: boolean;
        code: string;
    };
    forget_code?: string;
    password: string;
    videos: Types.Array<string>;
}
export const users_schema = new Schema<User>(
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
        password: { type: String, required: true },
        phone: { type: String },
        activation_code: {
            type: {
                valid: {
                    type: Boolean,
                    required: true,
                    default: true,
                },
                code: {
                    type: String,
                    required: true,
                    minlength: 10,
                },
            },
        },
        videos: [{ type: String, required: true }],
        forget_code: String,
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

const users_model = model<Prettify<InferSchemaType<typeof users_schema>>>(
    "users",
    users_schema
);

export default users_model;
