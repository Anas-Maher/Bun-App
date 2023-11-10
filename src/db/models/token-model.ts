import { Schema, Types, model } from "mongoose";
import { Expiration_Time } from "../../utils/Envs";
export interface Token {
    token: string;
    user?: Types.ObjectId;
    is_valid?: boolean;
    agent?: string;
    expires_at?: string;
}
const token_schema = new Schema<Token>(
    {
        token: {
            type: String,
            required: true,
        },
        user: {
            type: Types.ObjectId,
            ref: "users",
            required: true,
        },
        is_valid: {
            type: Boolean,
            default: true,
            required: true,
        },
        agent: String,
        expires_at: String,
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

token_schema.pre("save", function () {
    this["expires_at"] = Expiration_Time.toString();
});

const token_model = model("tokens", token_schema);

export default token_model;
