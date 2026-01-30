import app from './app';
import { env } from './config/env';
import { redis } from './config/redis'; // Import to ensure event listeners are attached

const PORT = env.PORT;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Optional: Trigger a connection check (not required due to lazyConnect, but good for logs)
    if (redis.status === 'wait') {
        redis.connect().catch(() => {
            // Error logged by event handler in config/redis.ts
            // We swallow here because we want the server to stay up (Hybrid mode)
        });
    }
});
