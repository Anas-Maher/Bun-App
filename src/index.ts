import Elysia, { t as types } from "elysia";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import json from "./utils/Json";
import Connect from "./db/connect";
import {
    Expiration_Time,
    port,
    jwt_signature,
    base_url,
} from "./utils/Envs.js";
import users_model from "./db/models/users-models.js";
import token_model from "./db/models/token-model.js";
import random_string from "./utils/generate_code.js";
import { email_template } from "./utils/HtmlTemplates.js";
import SendMail from "./utils/SendMail.js";
import compare_password from "./utils/compare_password.js";
// Bun.gc(false);
const app = new Elysia();
await Connect();
app.use(cors())
    .use(
        jwt({
            name: "jwt",
            secret: jwt_signature,
            exp: Expiration_Time,
        })
    )
    .group("/users", (app) =>
        app
            .post(
                "/signup",
                async ({ body }) => {
                    try {
                        const {
                            email,
                            user_name,
                            role = "user",
                            phone,
                            password,
                        } = body;
                        const user = await users_model.findOne({
                            $or: [
                                { email },
                                { phone },
                                { $and: [{ email, phone }] },
                            ],
                        });
                        if (user) {
                            return json({
                                payload: "user_already exits",
                            });
                        }
                        const code = random_string();
                        const html = email_template(
                            `${base_url}/confirm-email/${code}`
                        );
                        const sent = await SendMail({
                            html,
                            to: email,
                        });
                        if (sent) {
                            await users_model.create({
                                user_name,
                                password,
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
                        user_name: types.String(),
                        email: types.String({
                            format: "email",
                            default: "test@gmail.com",
                        }),
                        role: types.Optional(
                            types.String({
                                default: "user",
                            })
                        ),
                        phone: types.String(),
                        password: types.String({
                            minLength: 8,
                            default: "A!134wtf",
                            pattern: `^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8}$`,
                        }),
                    }),
                    error({ code }) {
                        switch (code) {
                            case "VALIDATION": {
                                return json({
                                    error: "user_name and email are required , phone is optional",
                                });
                            }
                            case "UNKNOWN": {
                            }
                            case "NOT_FOUND": {
                            }
                            case "PARSE": {
                            }
                            case "INTERNAL_SERVER_ERROR": {
                            }
                            case "INVALID_COOKIE_SIGNATURE": {
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
                            case "UNKNOWN": {
                            }
                            case "NOT_FOUND": {
                            }
                            case "PARSE": {
                            }
                            case "INTERNAL_SERVER_ERROR": {
                            }
                            case "INVALID_COOKIE_SIGNATURE": {
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
                        const allowed = compare_password(password);
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
                                token_model.create({
                                    agent,
                                    token,
                                    user: user.id,
                                }),
                                user.updateOne(
                                    { $set: { status: "online" } },
                                    { new: true }
                                ),
                            ]);
                        if (status1 === "rejected" || status2 === "rejected") {
                            throw new Error("error please try again");
                        }
                        return json({ payload: token });
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
                        email: types.String({
                            format: "email",
                            default: "test@gmail.com",
                        }),
                        password: types.String({
                            minLength: 8,
                            default: "A!134wtf",
                            pattern: `^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8}$`,
                        }),
                    }),
                    error({ code }) {
                        switch (code) {
                            case "VALIDATION": {
                                return json({
                                    error: "email are required",
                                });
                            }
                            case "UNKNOWN": {
                            }
                            case "NOT_FOUND": {
                            }
                            case "PARSE": {
                            }
                            case "INTERNAL_SERVER_ERROR": {
                            }
                            case "INVALID_COOKIE_SIGNATURE": {
                            }
                        }
                    },
                }
            )
    )
    .group("/videos", (app) =>
        app.post(
            "/add",
            async ({ body }) => {
                try {
                    const { description, title, video, user_id } = body;
                    const file_path = `/videos/${user_id}/${random_string()}`;
                    const user = await users_model.findByIdAndUpdate(
                        user_id,
                        {
                            $push: { videos: file_path },
                        },
                        { new: true }
                    );
                    if (user) {
                        await Bun.write(file_path, video);
                    }
                    throw new Error("user doesn't exist");
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
                    video: types.File({
                        type: ["video/mp4"],
                        maxSize: "100m",
                    }),
                    title: types.String({
                        maxLength: 255,
                    }),
                    description: types.String({
                        maxLength: 1000,
                    }),
                    user_id: types.String(),
                }),
                error({ code }) {
                    switch (code) {
                        case "VALIDATION": {
                            return json({
                                error: "email are required",
                            });
                        }
                        case "UNKNOWN": {
                        }
                        case "NOT_FOUND": {
                        }
                        case "PARSE": {
                        }
                        case "INTERNAL_SERVER_ERROR": {
                        }
                        case "INVALID_COOKIE_SIGNATURE": {
                        }
                    }
                },
            }
        )
    );

app.all("*", () => json({ dismiss: "wrong route" }));
app.listen(port, () => {
    console.log(`server is up ${app.server?.hostname}:${app.server?.port}`);
});
