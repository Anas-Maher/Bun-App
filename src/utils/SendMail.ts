import mailer from "nodemailer";
import { email, password } from "./Envs";
/**
 * Mail with headers or attachments
 */
export type Mail = {
    to: string | string[];
    html?: string;
    text?: string;
    subject?: string;
    attachments?: Array<{ path: string; contentType: string }>;
};
const SendMail = async ({ to, html, subject, text, attachments }: Mail) => {
    const from = `App <app-v1@gmail.com>`;
    subject ||= "Confirm Email";
    const Service = mailer.createTransport({
        service: "gmail",
        auth: {
            user: email,
            pass: password,
        },
    });
    const mail = await Service.sendMail({
        from,
        to,
        subject,
        html,
        text,
        attachments,
    });
    Service.close();
    return mail.accepted.length < 1 ? false : true;
};

export default SendMail;
