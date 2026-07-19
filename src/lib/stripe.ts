import "server-only"
import Stripe from "stripe"

let client: Stripe | undefined

// Instanciado sob demanda (não no import do módulo) para não exigir
// STRIPE_SECRET_KEY em contextos que só importam este arquivo por tipo
// (build, testes que mockam este módulo).
export function getStripe(): Stripe {
  if (client) return client

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY não configurada.")

  client = new Stripe(key)
  return client
}
