const redisClient = require('../config/redis');

/**
 * Cache middleware for GET requests
 * @param {number} duration - Cache duration in seconds (default: 300 = 5 minutes)
 */
const cache = (duration = 300) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Create cache key from URL and query params
        const key = `cache:${req.originalUrl || req.url}`;

        try {
            // Check if data exists in cache
            const cachedData = await redisClient.get(key);

            if (cachedData) {
                console.log(`✅ Cache HIT: ${key}`);
                return res.json(JSON.parse(cachedData));
            }

            console.log(`❌ Cache MISS: ${key}`);

            // Store original res.json function
            const originalJson = res.json.bind(res);

            // Override res.json to cache the response
            res.json = (data) => {
                // Cache the response data
                redisClient.setex(key, duration, JSON.stringify(data))
                    .catch(err => console.error('Cache set error:', err));

                // Send response
                return originalJson(data);
            };

            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            // Continue without caching on error
            next();
        }
    };
};

/**
 * Clear cache by pattern
 * @param {string} pattern - Redis key pattern (e.g., 'cache:*', 'cache:/api/products*')
 */
const clearCache = async (pattern) => {
    try {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
            await redisClient.del(...keys);
            console.log(`🗑️  Cleared ${keys.length} cache entries matching: ${pattern}`);
        }
    } catch (error) {
        console.error('Clear cache error:', error);
    }
};

module.exports = { cache, clearCache };
