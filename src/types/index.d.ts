import { JWTPayloadSpec } from "@elysiajs/jwt";
import { UnwrapSchema } from "elysia";
import { Prettify } from "elysia/dist/types.js";
import { type } from "os";

export interface Signup {
    body: {
        email: string;
        user_name: string;
        role?: "user" | "admin";
        phone?: string | RegExp;
    };
}

export interface Confirm_Email {
    params: {
        code: string;
    };
}

export interface Login {
    body: {
        email: string;
    };
    jwt: {sign : (param : any) => any};
    headers: Record<string, unknown>;
}
