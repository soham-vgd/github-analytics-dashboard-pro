import { redis } from '../config/redis';
import { logger } from '../config/logger';

/**
 * Service to manage data caching using a Hybrid Strategy.
 * 
 * STRATEGY:
 * 1. Primary: Redis (Persistent, Shared).
 * 2. Fallback: In-Memory Map (Fast, Local).
 * 
 * Writes are dual-written to both layers to ensure consistency if Redis drops.
 * Reads favor Redis, but gracefully degrade to memory if Redis is unreachable.
 */
export class CacheService {
    private static DEFAULT_TTL = 300; // 5 minutes (Matches GitHub rate limit windows)
    private static MAX_LOCAL_ITEMS = 1000; // Prevent memory leaks in fallback mode
    private static memoryCache = new Map<string, { value: any; expiry: number }>();

    /**
     * Retrieves data from cache.
     * Prioritizes Redis. Falls back to local memory if Redis is down or key is missing in Redis but present locally.
     */
    static async get<T>(key: string): Promise<T | null> {
        // Try Redis if connected
        if (redis.status === 'ready') {
            try {
                const data = await redis.get(key);
                if (data) {
                    return JSON.parse(data) as T;
                }
            } catch (error) {
                logger.warn(`Redis get error for ${key}, falling back to memory`, error);
            }
        } else {
            // Optional: Log once that we are degraded?
            // logger.warn('Redis not ready, using memory');
        }

        // Fallback to memory
        const cached = this.memoryCache.get(key);
        if (cached) {
            if (Date.now() < cached.expiry) {
                return cached.value as T;
            }
            this.memoryCache.delete(key);
        }
        return null;
    }

    /**
     * Saves data to cache.
     * Dual-writes to both Redis (if available) and Local Memory.
     * This ensures that if Redis dies, the latest data is still available locally.
     * 
     * @param ttl Seconds to live (default: 5 mins)
     */
    static async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
        // Try Redis if connected
        if (redis.status === 'ready') {
            try {
                await redis.set(key, JSON.stringify(value), 'EX', ttl);
            } catch (error) {
                logger.warn(`Redis set error for ${key}, using memory`, error);
            }
        }

        // Always save to memory as backup/primary if redis dead
        this.memoryCache.set(key, {
            value,
            expiry: Date.now() + (ttl * 1000),
        });

        // Memory Safety: Simple cleanup if growing too large
        if (this.memoryCache.size > this.MAX_LOCAL_ITEMS) {
            const now = Date.now();
            for (const [k, v] of this.memoryCache.entries()) {
                if (now > v.expiry) this.memoryCache.delete(k);
            }

            // Hard limit safety: delete oldest if still too big (not implemented here for simplicity, relied on TTL)
        }
    }

    // Helper to manually clear (useful for tests or admin)
    static async clear(key: string) {
        if (redis.status === 'ready') {
            await redis.del(key);
        }
        this.memoryCache.delete(key);
    }
}

// Export singleton-like static class (no need to instantiate)
// We export an object matching the previous 'cacheService' usage style if needed, 
// OR we just switch consumers to use CacheService.get directly.
// To minimize refactor friction, let's export 'cacheService' as the class logic wrapped.

export const cacheService = CacheService;
