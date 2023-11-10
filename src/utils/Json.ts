function json(body: Record<string, unknown> | string, options?: ResponseInit) {
    return new Response(
        typeof body === "string" ? body : JSON.stringify(body),
        {
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
            status: 200,
            ...options,
        }
    );
}

export default json;
