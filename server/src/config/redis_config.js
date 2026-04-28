const redis = require("redis");

let RedisClient;

const createRedisClient = () => {
    if (process.env.REDIS_URL) {
        return redis.createClient({
            url: process.env.REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 3) return new Error('Redis connection failed after 3 attempts');
                    return Math.min(retries * 50, 500);
                }
            }
        });
    }

    return redis.createClient({
        username: 'default',
        password: process.env.REDIS_PASS,
        socket: {
            host: 'redis-10144.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
            port: 10144,
            reconnectStrategy: (retries) => {
                if (retries > 3) return new Error('Redis connection failed after 3 attempts');
                return Math.min(retries * 50, 500);
            }
        }
    });
};

try {
    RedisClient = createRedisClient();
} catch (err) {
    console.error('Error creating Redis client:', err.message);
    RedisClient = redis.createClient();
}

let isConnected = false;

RedisClient.on('error', (err) => {
    if (!isConnected) {
        console.warn('⚠️ Redis error:', err.message);
    }
});

RedisClient.on('connect', () => {
    isConnected = true;
    console.log('✅ Redis connected successfully');
});

module.exports = RedisClient;
