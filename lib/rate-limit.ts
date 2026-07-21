const hits = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  key: string,
  { windowMs = 60_000, max = 10 }: { windowMs?: number; max?: number } = {},
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = hits.get(key)

  if (!record || now > record.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1 }
  }

  record.count++
  if (record.count > max) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: max - record.count }
}

export function rateLimitFromRequest(
  req: Request,
  opts?: { windowMs?: number; max?: number },
): { allowed: boolean; remaining: number } {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown"
  const path = new URL(req.url).pathname
  return rateLimit(`${ip}:${path}`, opts)
}
