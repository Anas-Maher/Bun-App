import Elysia, { t as types } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { Connect, users_model, tokens_model, videos_model } from "./DB";
import {
    json,
    Expiration_Time,
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
    Auth,
} from "./utils";
import { html } from "@elysiajs/html";
const app = new Elysia();
await Connect();
app.use(cors())
    // .use(
    //     // @ts-ignore
    //     html({ autoDoctype: true })
    // )
    .use(
        jwt({
            name: "jwt",
            secret: jwt_signature,
            exp: Expiration_Time,
        })
    )
    .group("/auth", (app) =>
        app
            .post(
                "/signup",
                async ({ body }) => {
                    try {
                        const {
                            email,
                            user_name,
                            role = "user",
                            password,
                        } = body;
                        const { valid, message } = check_password(password);
                        if (!valid) {
                            console.log("err");
                            throw new Error(message, { cause: 400 });
                        }
                        const user = await users_model.findOne({
                            email,
                        });
                        if (user) {
                            throw new Error("user_already exits", {
                                cause: 401,
                            });
                        }
                        const code = random_string();
                        const html = email_template(
                            `${base_url}/auth/confirm-email/${code}`
                        );
                        const sent = await SendMail({
                            html,
                            to: email,
                        });
                        if (sent) {
                            await users_model.create({
                                user_name,
                                password: Hash_password(password, 10),
                                email,
                                activation_code: { code },
                                role,
                                videos: [],
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
                        password: types.String({
                            minLength: 8,
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
                                    error: "error parsing json",
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
                "/confirm-email/:code",
                async ({ params: { code } }) => {
                    try {
                        const user = await users_model.findOne({
                            $and: [
                                {
                                    "activation_code.code": code,
                                    "activation_code.valid": true,
                                },
                            ],
                        });
                        if (user == null) {
                            return json(
                                {
                                    error: "try to signup again",
                                },
                                { status: 403 }
                            );
                        }
                        user.updateOne(
                            {
                                $set: {
                                    confirmed: true,
                                    "activation_code.valid": false,
                                },
                            },
                            { new: true }
                        );
                        return json({
                            payload: {
                                message: "done! now try to login",
                            },
                        });
                    } catch (error: any) {
                        return json({
                            error: {
                                message: "Error Ocurred",
                                error: error?.message ?? error,
                            },
                        });
                    }
                },
                {
                    params: types.Object({
                        code: types.String({
                            readOnly: true,
                        }),
                    }),
                    error({ code }) {
                        switch (code) {
                            case "VALIDATION": {
                                return json({
                                    error: "email are required",
                                });
                            }
                            case "PARSE": {
                                return json({
                                    error: "error parsing json",
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
                        const agent = headers?.agent as string;
                        const [{ status: status1 }, { status: status2 }] =
                            await Promise.allSettled([
                                await tokens_model.create({
                                    agent,
                                    token,
                                    user: user.id,
                                }),
                                await user.updateOne(
                                    { $set: { status: "online" } },
                                    { new: true }
                                ),
                            ]);
                        if (status1 === "rejected") {
                            throw new Error("error please try again");
                        }
                        if (status2 === "rejected") {
                            throw new Error("error please try again");
                        }
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
                                    error: "error parsing json",
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
                        password: types.String(),
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
                                    error: "error parsing json",
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
                        const { valid, message } = check_password(password);
                        if (!valid) {
                            throw new Error(message, { cause: 401 });
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
                                    error: "error parsing json",
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
            async ({ body }) => {
                try {
                    const { description, title, file, user_id } = body;
                    const path = `/videos/${user_id}/${random_string()}`;
                    await Auth(user_id);
                    const [vid, written] = await Promise.allSettled([
                        await (
                            await videos_model.create({
                                description,
                                path,
                                title,
                                user_id,
                            })
                        ).populate("user_id"),
                        await Bun.write(path, file),
                    ]);
                    if (vid.status === "rejected") {
                        throw new Error("please try again", { cause: 500 });
                    }
                    if (written.status === "rejected") {
                        throw new Error("please try again", { cause: 500 });
                    }
                    return json({ payload: vid }, { status: 200 });
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
                body: types.Object({
                    file: types.File({
                        type: ["video/mp4"],
                        maxSize: "100m",
                    }),
                    title: types.String({
                        maxLength: 255,
                    }),
                    description: types.String({
                        maxLength: 4095,
                    }),
                    user_id: types.String(),
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
                                error: "error parsing json",
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
    .all("*", () =>
        json("<h1>Hello</h1>", {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
            },
        })
    )
    .listen(port, () => {
        console.log(`server is up ${app.server?.hostname}:${app.server?.port}`);
    });
