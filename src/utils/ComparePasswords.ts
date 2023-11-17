import Hash_password from "./HashPassword";
import { type Hash } from "../types";

function compare_passwords(password: string, secret: string) {
    const info = secret.split("$") as Hash;
    const rounds = Number(info[0]);
    const salt = info[1];
    const hash = Hash_password(password, rounds, salt);
    return hash === secret;
}

export default compare_passwords;
