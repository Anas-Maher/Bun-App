const create_password = (password: string) =>
    Bun.password.hashSync(
        new Bun.SHA512_256().update(password).digest("hex"),
        "bcrypt"
    );

export default create_password;
