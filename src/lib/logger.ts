import "server-only"

/**
 * Log estruturado (JSON por linha) para eventos de negócio relevantes
 * (auth, billing, webhook). Nunca inclua senha, token, chave de API ou
 * corpo de payload bruto em `data` — apenas identificadores (ids, e-mails
 * já mascarados por quem chama, status).
 */
export function log(event: string, data?: Record<string, unknown>) {
  console.log(
    JSON.stringify({
      level: "info",
      event,
      timestamp: new Date().toISOString(),
      ...data,
    })
  )
}

export function logError(event: string, error: unknown, data?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error)

  console.error(
    JSON.stringify({
      level: "error",
      event,
      timestamp: new Date().toISOString(),
      message,
      ...data,
    })
  )
}
