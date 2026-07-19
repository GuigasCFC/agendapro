import { startStripeCheckout } from "@/features/billing/actions"

interface BillingCheckoutPageProps {
  searchParams: Promise<{ plan?: string }>
}

export default async function BillingCheckoutPage({
  searchParams,
}: BillingCheckoutPageProps) {
  const { plan } = await searchParams

  await startStripeCheckout(plan ?? "")
}
