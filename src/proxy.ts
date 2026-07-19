import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { db } from "@/lib/db"
import { getEffectiveStatus, isBlockingStatus } from "@/features/subscriptions/status"

const PUBLIC_ROUTES = ["/login", "/signup"]
const SUBSCRIPTION_EXEMPT_ROUTES = ["/subscription", "/subscription-expired"]

export async function proxy(request: NextRequest) {
  // Webhooks são chamados pelo Stripe (sem cookie de sessão) e validam a
  // própria assinatura internamente — não devem passar pelo gate de auth,
  // ou toda entrega vira redirect pra /login em vez de processar o evento.
  if (request.nextUrl.pathname.startsWith("/api/webhooks")) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() revalidates the JWT against Supabase Auth; getSession() would
  // only trust the local cookie, which is not safe for a redirect decision.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  if (!user && !isPublicRoute) {
    const redirectResponse = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie))
    return redirectResponse
  }

  if (user && isPublicRoute) {
    const redirectResponse = NextResponse.redirect(new URL("/dashboard", request.url))
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie))
    return redirectResponse
  }

  const isSubscriptionExempt = SUBSCRIPTION_EXEMPT_ROUTES.includes(pathname)

  if (user && !isPublicRoute && !isSubscriptionExempt) {
    const membership = await db.membership.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      select: { organizationId: true },
    })

    const subscription = membership
      ? await db.subscription.findUnique({
          where: { organizationId: membership.organizationId },
          select: { status: true, trialEndsAt: true, currentPeriodEnd: true },
        })
      : null

    if (subscription && isBlockingStatus(getEffectiveStatus(subscription))) {
      const redirectResponse = NextResponse.redirect(
        new URL("/subscription-expired", request.url)
      )
      response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie))
      return redirectResponse
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
