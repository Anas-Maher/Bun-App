import json from "../utils/Json";
import { JWTPayloadSpec } from "@elysiajs/jwt";
import { UnwrapSchema } from "elysia";
import { Prettify, LocalHook } from "elysia/dist/types";

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
    jwt: { sign: (param: any) => any };
    headers: Record<string, unknown>;
}

export type Hash = [`${number}`, `${string}`, `${string}`];
export type Password_Strength =
    | { valid: true }
    | {
          valid: false;
          message: string;
      };

type Error_Func = typeof json;

export type Error_Handler = LocalHook["error"];

export type Handle_Error_Cases = {
    UNKNOWN?: Error_Func;
    VALIDATION?: Error_Func;
    INVALID_COOKIE_SIGNATURE?: Error_Func;
    INTERNAL_SERVER_ERROR?: Error_Func;
    PARSE?: Error_Func;
    NOT_FOUND?: Error_Func;
};
