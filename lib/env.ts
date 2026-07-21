import { z } from "zod"

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXTAUTH_URL: z.string().default("http://localhost:3000"),
  NEXTAUTH_SECRET: z.string().min(16, "NEXTAUTH_SECRET must be at least 16 characters"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  MUAPIAPP_API_KEY: z.string().optional(),
  MUAPI_WEBHOOK_SECRET: z.string().optional(),
  YOOKASSA_SHOP_ID: z.string().optional(),
  YOOKASSA_SECRET_KEY: z.string().optional(),
  WEBHOOK_URL: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  FITBOT_SECRET: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
})

export type ServerEnv = z.infer<typeof serverSchema>

let _env: ServerEnv | null = null

export function getEnv(): ServerEnv {
  if (_env) return _env

  const result = serverSchema.safeParse(process.env)

  if (!result.success) {
    console.error("❌ Invalid environment variables:")
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join(".")}: ${issue.message}`)
    }
    throw new Error("Invalid environment variables. Check server logs.")
  }

  _env = result.data
  return _env
}
