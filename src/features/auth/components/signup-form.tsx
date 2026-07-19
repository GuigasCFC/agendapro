"use client"

import { useActionState } from "react"
import { signup } from "@/features/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="organizationName" className="text-sm font-medium">
          Nome da empresa <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <Input
          id="organizationName"
          name="organizationName"
          required
          aria-invalid={Boolean(state?.errors?.organizationName)}
          aria-describedby={
            state?.errors?.organizationName ? "organizationName-error" : undefined
          }
        />
        {state?.errors?.organizationName && (
          <p id="organizationName-error" className="text-sm text-destructive">
            {state.errors.organizationName[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Seu nome <span className="text-destructive" aria-hidden="true">*</span>
        </label>
        <Input
          id="name"
          name="name"
          required
          aria-invalid={Boolean(state?.errors?.name)}
          aria-describedby={state?.errors?.name ? "name-error" : undefined}
        />
        {state?.errors?.name && (
          <p id="name-error" className="text-sm text-destructive">
            {state.errors.name[0]}
          </p>
        )}
      </div>

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
        {pending ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  )
}
