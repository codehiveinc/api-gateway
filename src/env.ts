import dotenv from 'dotenv';
import { env } from 'process';
import {z} from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().trim().min(1),
  ACCESS_TOKEN_SECRET: z.string().trim().min(1),
  USERS_SERVICE_URL: z.string().trim().min(1),
  ORDERS_SERVICE_URL: z.string().trim().min(1),
  BILLINGS_SERVICE_URL: z.string().trim().min(1),
  FEEDBACKS_SERVICE_URL: z.string().trim().min(1),
});

const envServer = envSchema.safeParse({
  PORT: env.PORT,
  ACCESS_TOKEN_SECRET: env.ACCESS_TOKEN_SECRET,
  USERS_SERVICE_URL: env.USERS_SERVICE_URL,
  ORDERS_SERVICE_URL: env.ORDERS_SERVICE_URL,
  BILLINGS_SERVICE_URL: env.BILLINGS_SERVICE_URL,
  FEEDBACKS_SERVICE_URL: env.FEEDBACKS_SERVICE_URL,
});

envSchema.parse(env);

if (!envServer.success) {
  console.error(envServer.error.issues);
  throw new Error("Invalid environment variables");
}

export const envVariables = envServer.data;