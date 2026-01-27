const Redis = require('ioredis');

// Check if Redis is available, otherwise use mock client
let redisClient;

// FORCE MOCK for stability during debugging
console.warn('⚠️  Redis disabled for stability - using mock client');
redisClient = createMockRedis();

/*
try {
    redisClient = new Redis({ ... });
    // ...
} catch (error) { ... }
*/

// Mock Redis client for development without Redis
function createMockRedis() {
    const store = new Map();

    return {
        get: async (key) => store.get(key) || null,
        set: async (key, value) => store.set(key, value),
        setex: async (key, seconds, value) => {
            store.set(key, value);
            setTimeout(() => store.delete(key), seconds * 1000);
            return 'OK';
        },
        del: async (...keys) => {
            keys.forEach(key => store.delete(key));
            return keys.length;
        },
        keys: async (pattern) => {
            const regex = new RegExp(pattern.replace('*', '.*'));
            return Array.from(store.keys()).filter(key => regex.test(key));
        },
        incr: async (key) => {
            const val = parseInt(store.get(key) || '0') + 1;
            store.set(key, val.toString());
            return val;
        },
        decr: async (key) => {
            const val = parseInt(store.get(key) || '0') - 1;
            store.set(key, val.toString());
            return val;
        },
        expire: async (key, seconds) => {
            setTimeout(() => store.delete(key), seconds * 1000);
            return 1;
        },
        quit: () => Promise.resolve(),
        on: () => { },
    };
}

// Graceful shutdown
process.on('SIGTERM', () => {
    if (redisClient && redisClient.quit) {
        redisClient.quit();
    }
});

module.exports = redisClient;
