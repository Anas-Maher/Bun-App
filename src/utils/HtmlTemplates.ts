interface Template {
    link: string;
    link2?: string;
    title?: string;
    text?: string;
    text2?: string;
}

const email_template = (data: Template) => {
    const {
        link,
        link2 = "http://",
        text = "Verify Email Address",
        text2 = "Resend",
        title = "Email Confirmation",
    } = data;
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <title>${title}</title>
        </head>
        <body style="position:relative;">
            <div
                style="
                    margin: 0 auto;
                    padding: 0;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    translate: -50% -50%;
                    width: 400px;
                    height: 320px;
                    text-align: center;
                ">
                <h1>${title}</h1>
                <a
                    style="
                        text-decoration: none;
                        display: block;
                        padding: 0.5rem 0.75rem;
                        font-size: 1rem;
                        color: #000;
                    "
                    href="${link}"
                    >${text}</a
                >
                <a
                    style="
                        text-decoration: none;
                        display: block;
                        padding: 0.5rem 0.75rem;
                        font-size: 1rem;
                        color: #000;
                    "
                    href="${link2}"
                    >${text2}</a
                >
            </div>
        </body>
    </html>
`;
};

export default email_template;
