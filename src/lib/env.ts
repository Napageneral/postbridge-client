import { z } from "zod";

const EnvSchema = z.object({
  // OPENAI key optional for users who provide a client-side key
  OPENAI_API_KEY: z.string().default(""),
  POSTBRIDGE_API_KEY: z.string().min(1, "POSTBRIDGE_API_KEY is required"),
});

export type Env = z.infer<typeof EnvSchema>;

export function getEnv(): Env {
  const parsed = EnvSchema.safeParse({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    POSTBRIDGE_API_KEY: process.env.POSTBRIDGE_API_KEY,
  });
  if (!parsed.success) {
    const first = parsed.error.errors[0];
    throw new Error(
      `Invalid environment variable ${first?.path?.[0]}: ${first?.message}`
    );
  }
  return parsed.data;
}

