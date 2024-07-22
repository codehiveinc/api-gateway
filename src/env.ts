import dotenv from 'dotenv';
import { env } from 'process';
import {z} from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().trim().min(1),
  ACCESS_TOKEN_SECRET: z.string().trim().min(1),
});

const envServer = envSchema.safeParse({
  PORT: env.PORT,
  ACCESS_TOKEN_SECRET: env.ACCESS_TOKEN_SECRET,
});

envSchema.parse(env);

if (!envServer.success) {
  console.error(envServer.error.issues);
  throw new Error("Invalid environment variables");
}

export const envVariables = envServer.data;