import { Password_Strength } from "../types";

function check_password_strength(password: string): Password_Strength {
    if (password.length < 8 || password.length > 12) {
        return {
            valid: false,
            message: "your password length must be between 8 and 12",
        };
    }
    if (password.search(/[A-Z]/i) > -1) {
        return {
            valid: false,
            message: "your password must at least have 1 uppercase character",
        };
    }
    if (password.search(/[0-9]/) > -1) {
        return {
            valid: false,
            message: "your password must at least have 1 number",
        };
    }
    if (password.search(/[$!#@&*]/) > -1) {
        return {
            valid: false,
            message: "your password must at least have 1 special character",
        };
    }
    return { valid: true, message: "" };
}

export default check_password_strength;