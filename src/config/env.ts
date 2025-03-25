/* eslint-disable @typescript-eslint/no-namespace */
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// register all the env here
const envSchema = z.object({
  NODE_ENV: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

class EnvManager {
  private env: z.infer<typeof envSchema>;

  constructor() {
    const result = envSchema.safeParse(process.env);
    if (result.success) {
      this.env = result.data;
      console.log(`environment variables [${Object.keys(result.data)}] loaded successfully`);
    } else {
      const missingVars = result.error.errors.map(err => err.path.join('.')).join(', ');
      throw new Error(`Missing environment variables: [ ${missingVars} ]`);
    }
  }

  getEnv(key: keyof typeof envSchema.shape) {
    return this.env[key];
  }
}

export const envManager = new EnvManager();
