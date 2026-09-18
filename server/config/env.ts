import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3001'),
  GEMINI_API_KEY: z.string().optional().default(''),
  MAX_FILE_SIZE_MB: z.string().transform((val) => parseInt(val, 10)).default('10'),
  RATE_LIMIT_RPM: z.string().transform((val) => parseInt(val, 10)).default('60'),
  CORS_ORIGIN: z.string().default('*'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let configCache: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (!configCache) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.warn('[Config] Notice: Environment validation warning:', parsed.error.format());
      configCache = {
        NODE_ENV: 'development',
        PORT: 3001,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
        MAX_FILE_SIZE_MB: 10,
        RATE_LIMIT_RPM: 60,
        CORS_ORIGIN: '*',
      };
    } else {
      configCache = parsed.data;
    }
  }
  return configCache;
}
