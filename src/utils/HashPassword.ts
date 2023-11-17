import random_string from "./RandomString";

function Hash_password(password: string, rounds: number = 11, salt?: string) {
    salt = salt?.trim() || random_string();
    const factor = 100_000;
    rounds =
        isNaN(rounds) || !rounds || Math.abs(Math.trunc(rounds)) < 10
            ? 10 * factor
            : Math.abs(Math.trunc(rounds)) * factor;
    for (let i = 0; i < rounds; i++) {
        password = new Bun.SHA512_256().update(salt + password).digest("hex");
    }
    return `${rounds / factor}$${salt}$${password}`;
}
export default Hash_password;
