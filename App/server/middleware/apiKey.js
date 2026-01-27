const apiKeyMiddleware = (req, res, next) => {
    // Allow Swagger docs to bypass API key
    if (req.path.startsWith('/docs')) {
        return next();
    }

    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    const validApiKey = process.env.API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({
            status: 'error',
            message: 'Unauthorized: Invalid or missing API Key'
        });
    }

    next();
};

module.exports = apiKeyMiddleware;
