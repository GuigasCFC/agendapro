"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
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

  const { organizationName, name, email, password } = validated.data

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error || !data.user) {
    return { message: error?.message ?? "Não foi possível criar a conta." }
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
  })

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

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(validated.data)

  if (error) {
    return { message: "E-mail ou senha inválidos." }
  }

  redirect("/dashboard")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
