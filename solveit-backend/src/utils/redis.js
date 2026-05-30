const Redis = require('ioredis');

let redis = null;

function connect() {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        enableReadyCheck: false,
        maxRetriesPerRequest: 1,
        lazyConnect: false,
        retryStrategy: (times) => {
            if (times > 3) return null; // 3 denemeden sonra vazgeç
            return Math.min(times * 500, 2000);
        },
    });

    redis.on('connect', () => console.log('[REDIS] Connected'));
    redis.on('error', (err) => console.error('[REDIS] Error:', err.message));

    return redis;
}

function getClient() {
    if (!redis || redis.status === 'end' || redis.status === 'close') return null;
    return redis;
}

module.exports = { connect, getClient };
