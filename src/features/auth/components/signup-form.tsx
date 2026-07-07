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
          Nome da empresa
        </label>
        <Input id="organizationName" name="organizationName" required />
        {state?.errors?.organizationName && (
          <p className="text-sm text-destructive">
            {state.errors.organizationName[0]}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          Seu nome
        </label>
        <Input id="name" name="name" required />
        {state?.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <Input id="email" name="email" type="email" required />
        {state?.errors?.email && (
          <p className="text-sm text-destructive">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Senha
        </label>
        <Input id="password" name="password" type="password" required />
        {state?.errors?.password && (
          <p className="text-sm text-destructive">{state.errors.password[0]}</p>
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
