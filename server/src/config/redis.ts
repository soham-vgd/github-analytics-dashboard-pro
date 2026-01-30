import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

// Remove the strict check to allow fallback behavior?
// User snippet uses config.REDIS_URL directly. 
// If we want "Robust", we should probably allow this to be empty or invalid and just log it?
// But user previous instruction said "Redis is must".
// The new snippet implies "Try Redis if connected", effectively making it optional/resilient.
// I will keep the URL requirement in env but handle connection errors gracefully here.

export const redis = new Redis(env.REDIS_URL, {
    lazyConnect: true, // Important for resilience
    retryStrategy(times) {
        if (times > 5) {
            logger.error('Redis connection failed, giving up (switching to memory-only mode).');
            return null;
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err: any) => {
    // Suppress scary stack traces for common connection issues during dev
    if (err.code === 'ECONNREFUSED') {
        logger.warn('Redis connection refused... retrying/waiting.');
    } else {
        logger.error('Redis connection error', err);
    }
});
