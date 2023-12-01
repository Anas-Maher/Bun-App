import { rounds } from "./Envs";

const Hash_password = (password: string) =>
    Bun.password.hashSync(password, {
        algorithm: "bcrypt",
        cost: rounds,
    });

export default Hash_password;
