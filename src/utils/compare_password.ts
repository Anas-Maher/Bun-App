const compare_password = (password: string) =>
    Bun.password.verifySync(
        new Bun.SHA512_256().update(password).digest("hex"),
        "bcrypt"
    );

export default compare_password;
