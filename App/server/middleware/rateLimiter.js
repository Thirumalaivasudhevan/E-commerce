const rateLimit = require('express-rate-limit');
const redisClient = require('../config/redis');

// Store for rate limit using Redis
class RedisStore {
    constructor(options) {
        this.prefix = options.prefix || 'rl:';
        this.client = redisClient;
    }

    async increment(key) {
        const fullKey = this.prefix + key;
        const current = await this.client.incr(fullKey);

        if (current === 1) {
            // First request, set expiry
            await this.client.expire(fullKey, 900); // 15 minutes
        }

        return {
            totalHits: current,
            resetTime: new Date(Date.now() + 900000) // 15 minutes from now
        };
    }

    async decrement(key) {
        const fullKey = this.prefix + key;
        await this.client.decr(fullKey);
    }

    async resetKey(key) {
        const fullKey = this.prefix + key;
        await this.client.del(fullKey);
    }
}

// General API rate limiter - 100 requests per 15 minutes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    store: new RedisStore({ prefix: 'rl:api:' }),
});

// Strict rate limiter for auth endpoints - 5 requests per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts, please try again after 15 minutes',
    skipSuccessfulRequests: true, // Don't count successful requests
    store: new RedisStore({ prefix: 'rl:auth:' }),
});

// Moderate limiter for POST/PUT/DELETE - 50 requests per 15 minutes
const mutationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: 'Too many requests, please slow down',
    store: new RedisStore({ prefix: 'rl:mutation:' }),
});

module.exports = {
    apiLimiter,
    authLimiter,
    mutationLimiter
};
