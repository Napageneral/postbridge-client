import { z } from "zod";

const EnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
  POSTBRIDGE_API_KEY: z.string().min(1, "POSTBRIDGE_API_KEY is required"),
  POSTBRIDGE_BASE_URL: z
    .string()
    .default("https://api.post-bridge.com"),
  DEFAULT_TIMEZONE: z.string().default("America/Los_Angeles"),
  DEFAULT_POST_HOUR_LOCAL: z
    .string()
    .default("21"),
});

export type Env = z.infer<typeof EnvSchema>;

export function getEnv(): Env {
  const parsed = EnvSchema.safeParse({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    POSTBRIDGE_API_KEY: process.env.POSTBRIDGE_API_KEY,
    POSTBRIDGE_BASE_URL: process.env.POSTBRIDGE_BASE_URL,
    DEFAULT_TIMEZONE: process.env.DEFAULT_TIMEZONE,
    DEFAULT_POST_HOUR_LOCAL: process.env.DEFAULT_POST_HOUR_LOCAL,
  });
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    throw new Error(
      `Invalid environment variable ${first?.path?.[0]}: ${first?.message}`
    );
  }
  return parsed.data;
}


