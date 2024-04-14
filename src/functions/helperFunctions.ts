export const createResponse = (statusCode: number, body: Record<string, any>) => {
    return {
        statusCode: statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
        },
        body: JSON.stringify(body)
    };
}

