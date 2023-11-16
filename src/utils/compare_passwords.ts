import Hash_password from "./create_password";
import { Hash } from "../types";

function compare_password(password: string, secret: string) {
    const info = secret.split("$") as Hash;
    const rounds = Number(info[0]);
    const salt = info[2];
    return Hash_password(password, rounds, salt) === secret;
}

export default compare_password;
