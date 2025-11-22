import { z } from 'zod';

/**
 * Environment variable validation schema
 * Throws descriptive error if validation fails
 */
const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required').startsWith('sk-', 'Invalid API key format'),
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required').optional(), // Optional for now, will be required when submitting contact form
});

/**
 * Validated environment variables
 * Access via: import { env } from './config/env.mjs'
 */
export const env = envSchema.parse(process.env);

