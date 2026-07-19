"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"

import { changePassword } from "@/features/settings/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function SecurityCard() {
  const [state, action, pending] = useActionState(changePassword, undefined)

  useEffect(() => {
    if (state?.success) {
      toast.success("Senha alterada com sucesso.")
    }
  }, [state])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Segurança</CardTitle>
        <CardDescription>Atualize a senha da sua conta.</CardDescription>
      </CardHeader>

      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Nova senha <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
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

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmar nova senha <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              aria-invalid={Boolean(state?.errors?.confirmPassword)}
              aria-describedby={
                state?.errors?.confirmPassword ? "confirmPassword-error" : undefined
              }
            />
            {state?.errors?.confirmPassword && (
              <p id="confirmPassword-error" className="text-sm text-destructive">
                {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>

          {state?.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? "Alterando..." : "Alterar senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
