import "server-only"

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

/**
 * Limitador de taxa em memória (por instância do processo). Suficiente
 * para conter abuso básico (força bruta, flood) num deploy single-instance;
 * num ambiente serverless multi-instância cada instância mantém sua própria
 * contagem, então o limite efetivo é aproximado, não exato.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (bucket.count >= limit) {
    return false
  }

  bucket.count += 1
  return true
}

export function getClientIp(headersList: Headers): string {
  const forwardedFor = headersList.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0].trim()

  return headersList.get("x-real-ip") ?? "unknown"
}
