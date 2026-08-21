/**
 * Environment variable validation.
 * Uses Zod to validate all required env vars at startup.
 * Fail-fast: if a required var is missing, the process exits with a clear error.
 */
const { z } = require('zod');
const logger = require('../utils/logger');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  BCRYPT_SALT_ROUNDS: z.string().default('12'),
});

let env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  logger.error('Environment validation failed. Missing or invalid variables:', {
    issues: error.issues?.map(i => `${i.path.join('.')}: ${i.message}`),
  });
  process.exit(1);
}

module.exports = env;
