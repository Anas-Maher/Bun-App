import { type Password_Strength } from "../types";

function check_password(password: string): Password_Strength {
    if (password.length < 8 || password.length > 12) {
        return {
            valid: false,
            message: "your password length must be between 8 and 12",
        };
    }
    if (!/[0-9]/.test(password)) {
        return {
            valid: false,
            message: "your password must at least have 1 number",
        };
    }
    if (["$", "!", "#", "@", "&", "*"].includes(password)) {
        return {
            valid: false,
            message: "your password must at least have 1 special character",
        };
    }
    return { valid: true };
}

export default check_password;
