"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { addDays, TRIAL_DAYS } from "@/features/subscriptions/services"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { log } from "@/lib/logger"
import { loginSchema, signupSchema } from "./schemas"

export type AuthFormState =
  | {
      errors?: Record<string, string[] | undefined>
      message?: string
    }
  | undefined

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "empresa"
  )
}

async function uniqueSlugFor(name: string) {
  const base = slugify(name)
  let slug = base
  let attempt = 0

  while (await db.organization.findUnique({ where: { slug } })) {
    attempt += 1
    slug = `${base}-${attempt}`
  }

  return slug
}

export async function signup(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const validated = signupSchema.safeParse({
    organizationName: formData.get("organizationName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const ip = getClientIp(await headers())
  if (!rateLimit(`signup:${ip}`, 5, 60 * 60 * 1000)) {
    return { message: "Muitas tentativas. Tente novamente mais tarde." }
  }

  const { organizationName, name, email, password } = validated.data

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error || !data.user) {
    // Mensagem genérica: o texto original do Supabase (ex.: "User already
    // registered") permite enumerar quais e-mails já têm conta.
    return { message: "Não foi possível criar a conta. Verifique os dados e tente novamente." }
  }

  const supabaseUserId = data.user.id
  const slug = await uniqueSlugFor(organizationName)

  await db.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: { name: organizationName, slug },
    })

    await tx.user.create({
      data: { id: supabaseUserId, email, name },
    })

    await tx.membership.create({
      data: {
        userId: supabaseUserId,
        organizationId: organization.id,
        role: "OWNER",
      },
    })

    const trialEndsAt = addDays(new Date(), TRIAL_DAYS)
    await tx.subscription.create({
      data: {
        organizationId: organization.id,
        plan: "PRO",
        status: "TRIAL",
        trialEndsAt,
        currentPeriodEnd: trialEndsAt,
      },
    })
  })

  log("auth.signup", { organizationSlug: slug })

  redirect("/dashboard")
}

export async function login(
  _state: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const ip = getClientIp(await headers())
  // Limite por conta (força bruta numa conta) e limite geral por IP (evita
  // credential stuffing: muitas contas diferentes tentadas do mesmo IP).
  if (
    !rateLimit(`login:${ip}:${validated.data.email}`, 5, 5 * 60 * 1000) ||
    !rateLimit(`login-ip:${ip}`, 20, 5 * 60 * 1000)
  ) {
    return { message: "Muitas tentativas. Tente novamente em alguns minutos." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(validated.data)

  if (error) {
    return { message: "E-mail ou senha inválidos." }
  }

  log("auth.login")

  redirect("/dashboard")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
