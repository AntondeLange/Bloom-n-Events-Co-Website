import { z } from 'zod';

/**
 * Environment variable validation schema
 * Uses safeParse to prevent crashes if validation fails
 */
const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required').startsWith('sk-', 'Invalid API key format').optional(),
  PORT: z.coerce.number().int().positive().default(3000),
  FRONTEND_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'), // Default to production for Railway
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required').optional(), // Optional for now, will be required when submitting contact form
});

/**
 * Validated environment variables
 * Access via: import { env } from './config/env.mjs'
 * 
 * Uses safeParse to provide better error messages and prevent crashes
 */
const parseResult = envSchema.safeParse(process.env);

let env;

if (!parseResult.success) {
  console.error('❌ Environment variable validation failed:');
  parseResult.error.errors.forEach((err) => {
    console.error(`  - ${err.path.join('.')}: ${err.message}`);
  });
  console.error('\n⚠️  Server will continue but some features may not work.');
  console.error('Please set the required environment variables in Railway.\n');
  
  // Use defaults for missing values to allow server to start
  const nodeEnv = process.env.NODE_ENV || 'production';
  env = {
    PORT: Number(process.env.PORT) || 3000,
    NODE_ENV: (nodeEnv === 'development' || nodeEnv === 'test') ? nodeEnv : 'production',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    FRONTEND_URL: process.env.FRONTEND_URL,
    MONGODB_URI: process.env.MONGODB_URI,
  };
} else {
  env = parseResult.data;
}

export { env };

