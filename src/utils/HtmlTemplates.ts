export const Generate_Html = (
    ...urls: Array<{ url: string; msg: string }>
): string => {
    return urls
        .map(
            ({ url, msg }) =>
                `
        <a 
        style="text-decoration:none;font-size:1.3rem;margin:1rem auto;" href="${url}">${msg}</a>
        <br/>
        `
        )
        .join("\n");
};

export default function email_template(link: string): string {
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <title>Email Confirmation</title>
        </head>
        <style type="text/css">
            body {
                background-color: #88bdbf;
                margin: 0px;
            }
        </style>
        <body style="margin: 0px">
            <table
                border="0"
                width="50%"
                style="
                    margin: auto;
                    padding: 30px;
                    background-color: #f3f3f3;
                    border: 1px solid #630e2b;
                    border-radius: 2rem;
                ">
                <tr>
                    <td>
                        <table
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            style="
                                text-align: center;
                                width: 100%;
                                padding: 2rem 2rem 3rem ;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                background-color: #fff;
                            ">
                            <tr>
                                <td>
                                    <h1 style="padding-top: 25px; color: #630e2b">
                                        Email Confirmation
                                    </h1>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <a
                                        href="${link}"
                                        style="
                                            margin: 10px 0px 30px 0px;
                                            border-radius: .75rem;
                                            padding: 10px 20px;
                                            border: 0;
                                            color: #fff;
                                            text-decoration: none;
                                            background-color: #630e2b;
                                        "
                                        >Verify Email address</a
                                    >
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    </html>
`;
}
