const compare_passwords = (password: string, secret: string) =>
    Bun.password.verifySync(password, secret, "bcrypt");

export default compare_passwords;
