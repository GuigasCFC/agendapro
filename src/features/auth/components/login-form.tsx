"use client"

import { useActionState } from "react"
import { login } from "@/features/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          aria-invalid={Boolean(state?.errors?.email)}
          aria-describedby={state?.errors?.email ? "email-error" : undefined}
        />
        {state?.errors?.email && (
          <p id="email-error" className="text-sm text-destructive">
            {state.errors.email[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Senha <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          aria-invalid={Boolean(state?.errors?.password)}
          aria-describedby={state?.errors?.password ? "password-error" : undefined}
        />
        {state?.errors?.password && (
          <p id="password-error" className="text-sm text-destructive">
            {state.errors.password[0]}
          </p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  )
}
