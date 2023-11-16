import { Error_Handler, Handle_Error_Cases } from "../types";
import json from "./Json";
type a = typeof json;
const Handle_errors = ({
    UNKNOWN,
    VALIDATION,
    INTERNAL_SERVER_ERROR,
    INVALID_COOKIE_SIGNATURE,
    NOT_FOUND,
    PARSE,
}: Handle_Error_Cases) => {
    const check = (body: any): boolean =>
        (body && typeof body === "object" && !Object.keys(body).length) ||
        (typeof body === "string" && !body.trim());
    return {
        default(
            body: string | Record<string, unknown>,
            options?: ResponseInit | undefined
        ) {
            if (check(body)) {
                return json(
                    { error: "internal server error" },
                    { status: 500, ...options }
                );
            }
            return json(body, { status: 500, ...options });
        },
        VALIDATION(
            body: string | Record<string, unknown>,
            options?: ResponseInit | undefined
        ) {
            if (check(body)) {
                return json(
                    { error: "validation error please check the credentials" },
                    { status: 400, ...options }
                );
            }
            return json(body, { status: 400, ...options });
        },
        PARSE,
        INTERNAL_SERVER_ERROR,
        INVALID_COOKIE_SIGNATURE,
    };
};
export default Handle_errors;
