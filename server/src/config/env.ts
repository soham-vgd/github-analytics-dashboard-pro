import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root of server
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
    PORT: z.string().default('8000').transform(val => parseInt(val, 10)),
    GITHUB_TOKEN: z.string().min(1, "GITHUB_TOKEN is required"),
    REDIS_URL: z.string().min(1, "REDIS_URL is required"),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parseEnv = () => {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error('❌ Invalid environment variables:', parsed.error.format());
        process.exit(1);
    }

    return parsed.data;
};

export const env = parseEnv();
