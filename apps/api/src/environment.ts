import "dotenv/config";

import { z } from "zod";

const environmentSchema = z.object({
  API_PORT: z.coerce.number().int().min(1).max(65_535).default(3333),
  DATABASE_URL: z
    .string()
    .default("postgresql://nexoflux:nexoflux@localhost:5432/nexoflux"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
});

export const environment = environmentSchema.parse(process.env);
