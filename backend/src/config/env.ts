import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_BASE_URL: z.string().default('http://localhost:3000'),

  // Gateway / PSP Configuration
  PSP_ACTIVE_GATEWAY: z.enum(['mock', 'asaas', 'efi']).default('mock'),
  PSP_MOCK_AUTO_CONFIRM: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
  
  // Real PSP credentials (optional in dev/test)
  ASAAS_API_KEY: z.string().optional(),
  ASAAS_WEBHOOK_TOKEN: z.string().optional(),
  EFI_CLIENT_ID: z.string().optional(),
  EFI_CLIENT_SECRET: z.string().optional(),

  // Security & JWT
  JWT_SECRET: z.string().default('ebenezer_dev_secret_key_change_in_production_with_min_32_chars!'),

  // Notifications
  EMAIL_FROM: z.string().default('doacoes@ebenezer.org.br'),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:', JSON.stringify(result.error.format(), null, 2));
    throw new Error('Invalid environment configuration');
  }
  return result.data;
}

export const env = parseEnv();
