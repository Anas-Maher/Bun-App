import json from "./Json";

const global_error_handler = (error: any) =>
    json(
        {
            error: error?.message ?? error,
        },
        { status: error?.cause ?? 500 }
    );

export default global_error_handler;
