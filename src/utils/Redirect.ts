function redirect(url: URL | string,  options?: ResponseInit) {
    return Response.redirect(url.toString(), {
        status : 200,
        headers: {
            "Content-Type": "application/json",
        },
        ...options,
    });
}

export default redirect;
