import Elysia, { t as types } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { users_model, tokens_model, videos_model, Connect } from "./DB";
import { existsSync, mkdirSync } from "node:fs";
import {
    json,
    port,
    jwt_signature,
    base_url,
    random_string,
    SendMail,
    compare_passwords,
    Hash_password,
    check_password,
    global_error_handler,
    email_template,
    redirect,
    login_page,
    signup_page,
    Expires_at,
} from "./utils";
await Connect();
new Elysia()
    .use(cors())
    .use(
        jwt({
            name: "jwt",
            secret: jwt_signature,
        })
    )
    .group("/auth", (app) =>
        app
            .post(
                "/signup",
                async ({ body, jwt }) => {
                    try {
                        const {
                            email,
                            user_name,
                            role = "user",
                            password,
                            phone,
                        } = body;
                        const valid = check_password(password);
                        if (!valid.valid) {
                            throw new Error(valid.message, { cause: 400 });
                        }
                        const user = await users_model.findOne({
                            email,
                        });
                        if (user !== null) {
                            throw new Error("user_already exits", {
                                cause: 401,
                            });
                        }
                        const code = random_string();
                        const token1 = await jwt.sign({
                            code,
                            expires_at: Expires_at(300),
                        });
                        const token2 = await jwt.sign({
                            code,
                            expires_at: Expires_at(276480),
                        });
                        const html = email_template({
                            link: `${base_url}/auth/confirm-email/${token1}`,
                            link2: `${base_url}/auth/confirm-email/${token2}`,
                        });
                        const sent = await SendMail({
                            html,
                            to: email,
                        });
                        if (sent) {
                            await users_model.create({
                                user_name,
                                password: Hash_password(password),
                                email,
                                activation_code: code,
                                role,
                                phone,
                            });
                            return json(
                                {
                                    payload: {
                                        message: "done! now confirm your email",
                                    },
                                },
                                { status: 201 }
                            );
                        }
                        throw new Error(
                            "error ocurred , please try to signup again"
                        );
                    } catch (error: any) {
                        return global_error_handler(error);
                    }
                },
                {
                    body: types.Object({
                        user_name: types.String(),
                        email: types.String({
                            format: "email",
                            default: "test@gmail.com",
                        }),
                        role: types.Optional(
                            types.String({
                                default: "user",
                                pattern: "user|admin",
                            })
                        ),
                        phone: types.Optional(types.String()),
                        password: types.String({
                            minLength: 8,
                            maxLength: 12,
                        }),
                    }),
                    error: function ({ code }) {
                        switch (code) {
                            case "VALIDATION": {
                                return json({
                                    error: "user_name , password and email are required \n password must be at least 8 characters",
                                });
                            }
                            case "PARSE": {
                                return json({
                                    error: "error parsing body",
                                });
                            }
                            default: {
                                return json({
                                    error: "internal server error",
                                });
                            }
                        }
                    },
                }
            )
            .get(
                "/confirm-email/:activation_code",
                async ({ params: { activation_code }, jwt }) => {
                    try {
                        const token = await jwt.verify(activation_code);
                        if (token === false) {
                            throw new Error("invalid", { cause: 403 });
                        }
                        if (Date.now() > Number(token?.expires_at)) {
                            throw new Error("try to use the resend", {
                                cause: 403,
                            });
                        }
                        const user = await users_model.findOneAndUpdate(
                            {
                                activation_code: token?.code,
                            },
                            {
                                $set: {
                                    confirmed: true,
                                },
                            },
                            { new: true }
                        );
                        if (user == null) {
                            return redirect(signup_page, { status: 403 });
                        }
                        return redirect(login_page);
                    } catch (error: any) {
                        return global_error_handler(error)
                    }
                },
                {
                    params: types.Object({
                        activation_code: types.String(),
                    }),
                    error({ code }) {
                        switch (code) {
                            case "VALIDATION": {
                                return json({
                                    error: "activation code is required",
                                });
                            }
                            case "PARSE": {
                                return json({
                                    error: "error parsing body",
                                });
                            }
                            default: {
                                return json({
                                    error: "internal server error",
                                });
                            }
                        }
                    },
                }
            )
            .get(
                "/reconfirm-email/:activation_code",
                async ({ params: { activation_code }, jwt }) => {
                    try {
                        const token = await jwt.verify(activation_code);
                        if (token === false) {
                            throw new Error("invalid", { cause: 403 });
                        }
                        if (Date.now() > Number(token?.expires_at)) {
                            await users_model.findOneAndDelete({
                                activation_code: token?.code,
                            });
                            throw new Error("try to signup again", {
                                cause: 403,
                            });
                        }
                        const user = await users_model.findOne({
                            activation_code: token?.code,
                        });
                        if (user == null) {
                            return redirect(signup_page, { status: 403 });
                        }
                        if (user.confirmed === true) {
                            return redirect(login_page);
                        }
                        const new_token = await jwt.sign({
                            code: user.activation_code,
                            expires_at: Expires_at(120),
                        });
                        const sent = await SendMail({
                            to: user.email,
                            html: email_template({
                                link: `${base_url}/auth/confirm-email/${new_token}`,
                            }),
                        });
                        if (sent) {
                            return json({ payload: "check your email now" });
                        }
                        await users_model.findOneAndDelete({
                            activation_code: token?.code,
                        });
                        throw new Error("internal server error", {
                            cause: 500,
                        });
                    } catch (error: any) {
                        return global_error_handler(error)
                    }
                },
                {
                    params: types.Object({
                        activation_code: types.String(),
                    }),
                    error({ code }) {
                        switch (code) {
                            case "VALIDATION": {
                                return json({
                                    error: "activation code is required",
                                });
                            }
                            case "PARSE": {
                                return json({
                                    error: "error parsing body",
                                });
                            }
                            default: {
                                return json({
                                    error: "internal server error",
                                });
                            }
                        }
                    },
                }
            )
            .post(
                "/login",
                async ({ body, jwt, headers }) => {
                    try {
                        const { email, password } = body;
                        const user = await users_model.findOne({ email });
                        if (!user) {
                            throw new Error("please register now");
                        }
                        const allowed = compare_passwords(
                            password,
                            user.password
                        );
                        if (!allowed) {
                            throw new Error(
                                "wrong password or email please try again",
                                { cause: 401 }
                            );
                        }
                        const token = await jwt.sign({ id: user.id, email });
                        await tokens_model.create({
                            agent: headers?.agent as string,
                            token,
                            user: user.id,
                        });
                        await user
                            .updateOne(
                                { $set: { status: "online" } },
                                { new: true }
                            )
                            .populate(["user_comments"]);
                        return json({ payload: token });
                    } catch (error: any) {
                        return global_error_handler(error);
                    }
                },
                {
                    body: types.Object({
                        email: types.String({
                            format: "email",
                            default: "test@gmail.com",
                        }),
                        password: types.String({
                            minLength: 8,
                            maxLength: 12,
                        }),
                    }),
                    error({ code }) {
                        switch (code) {
                            case "VALIDATION": {
                                return json({
                                    error: "email and password are required",
                                });
                            }
                            case "PARSE": {
                                return json({
                                    error: "error parsing body",
                                });
                            }
                            default: {
                                return json({
                                    error: "internal server error",
                                });
                            }
                        }
                    },
                }
            )
            .patch(
                "/forget_password",
                async ({ body }) => {
                    try {
                        const { email } = body;
                        const forget_code = random_string().slice(0, 6);
                        const user = await users_model.findOne({
                            email,
                        });
                        if (!user) {
                            throw new Error("user not found", { cause: 403 });
                        }
                        const sent = await SendMail({
                            to: user.email,
                            subject: "Reset Password",
                            html: "",
                            text: `HI ${user.user_name}\nyour code to reset your password is ${forget_code}`,
                        });
                        if (sent) {
                            await user.updateOne(
                                {
                                    $set: {
                                        forget_code,
                                    },
                                },
                                {
                                    new: true,
                                }
                            );
                            return json({
                                payload:
                                    "Check Your Email To reset Your Password",
                            });
                        }
                        throw new Error("sorry , please try again", {
                            cause: 500,
                        });
                    } catch (error: any) {
                        return global_error_handler(error);
                    }
                },
                {
                    body: types.Object({
                        email: types.String({
                            format: "email",
                            default: "test@gmail.com",
                        }),
                        password: types.String({
                            minLength: 8,
                            maxLength: 12,
                        }),
                    }),
                    error({ code }) {
                        switch (code) {
                            case "VALIDATION": {
                                return json({
                                    error: "email and password are required",
                                });
                            }
                            case "PARSE": {
                                return json({
                                    error: "error parsing body",
                                });
                            }
                            default: {
                                return json({
                                    error: "internal server error",
                                });
                            }
                        }
                    },
                }
            )
            .patch(
                "/reset_password",
                async ({ body }) => {
                    try {
                        const { email, forget_code, password } = body;
                        const valid = check_password(password);
                        if (!valid.valid) {
                            throw new Error(valid.message, { cause: 401 });
                        }
                        const user = await users_model.findOneAndUpdate(
                            {
                                $and: [{ email, forget_code }],
                            },
                            {
                                $set: { password: Hash_password(password) },
                                $unset: { forget_code: 1 },
                            },
                            { new: true }
                        );
                        if (!user) {
                            throw new Error("user not found", { cause: 403 });
                        }
                        const tokens = await tokens_model.find();
                        tokens.forEach(async (token) => {
                            await token.updateOne(
                                {
                                    $set: {
                                        is_valid: false,
                                    },
                                },
                                { new: true }
                            );
                        });
                        return json({ payload: "done! now login again" });
                    } catch (error: any) {
                        return global_error_handler(error);
                    }
                },
                {
                    body: types.Object({
                        forget_code: types.String(),
                        email: types.String({
                            format: "email",
                            default: "test@gmail.com",
                        }),
                        password: types.String(),
                    }),
                    error({ code }) {
                        switch (code) {
                            case "VALIDATION": {
                                return json({
                                    error: "email , password and forget_code are required",
                                });
                            }
                            case "PARSE": {
                                return json({
                                    error: "error parsing body",
                                });
                            }
                            default: {
                                return json({
                                    error: "internal server error",
                                });
                            }
                        }
                    },
                }
            )
    )
    .group("/videos", (app) =>
        app.post(
            "/post",
            async ({ body, jwt, headers: { Authorization } }) => {
                try {
                    const { description, title, file, user_id } = body;
                    var a = await jwt.verify(Authorization);
                    const path = `videos/${user_id}/${random_string()}`;
                    if (!existsSync(path)) {
                        mkdirSync(path, { recursive: true });
                    }
                    const vid = await videos_model
                        .create({
                            description,
                            path,
                            title,
                            user_id,
                        })
                        .then((vid) =>
                            vid.populate({
                                path: "",
                            })
                        );
                    return json({ payload: vid }, { status: 201 });
                } catch (error: any) {
                    return json(
                        {
                            error: {
                                message: "Error Ocurred",
                                error: error?.message ?? error,
                            },
                        },
                        { status: error?.cause ?? 500 }
                    );
                }
            },
            {
                type: "multipart/form-data",
                body: types.Object({
                    file: types.File({
                        type: ["video/mp4"],
                        maxSize: "500m",
                    }),
                    title: types.String({
                        maxLength: 255,
                    }),
                    description: types.String({
                        maxLength: 4095,
                    }),
                    user_id: types.String(),
                }),
                headers: types.Object({
                    Authorization: types.String(),
                }),
                error({ code }) {
                    switch (code) {
                        case "VALIDATION": {
                            return json({
                                error: "description, title, video and user_id  are required",
                            });
                        }
                        case "PARSE": {
                            return json({
                                error: "error parsing data",
                            });
                        }
                        default: {
                            return json({
                                error: "internal server error",
                            });
                        }
                    }
                },
            }
        )
    )
    .all("*", async ({ jwt }) => {
        const decoded = await jwt.verify(await jwt.sign({}));
        if (decoded !== false) {
            const result = decoded;
            console.log(
                Object.keys(result),
                Object.values(result),
                { result },
                result.iat
            );
            return json(decoded);
        }
        return "Fuck";
    })
    .listen(port, () => {
        console.log(`localhost:${port}`);
    });
