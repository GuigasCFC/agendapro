"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"

import { updateOrganizationDetails } from "@/features/settings/actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface OrganizationDetailsCardProps {
  tradeName: string | null
  contactEmail: string | null
  phone: string | null
  whatsapp: string | null
  website: string | null
  addressLine: string | null
  city: string | null
  state: string | null
  zipCode: string | null
}

export function OrganizationDetailsCard(props: OrganizationDetailsCardProps) {
  const [state, action, pending] = useActionState(
    updateOrganizationDetails,
    undefined
  )

  useEffect(() => {
    if (state?.success) {
      toast.success("Dados da empresa atualizados.")
    }
  }, [state])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Empresa</CardTitle>
        <CardDescription>
          Informações de contato e endereço da sua empresa.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={action} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="tradeName" className="text-sm font-medium">
                Nome fantasia
              </label>
              <Input
                id="tradeName"
                name="tradeName"
                defaultValue={props.tradeName ?? ""}
                aria-invalid={Boolean(state?.errors?.tradeName)}
                aria-describedby={
                  state?.errors?.tradeName ? "tradeName-error" : undefined
                }
              />
              {state?.errors?.tradeName && (
                <p id="tradeName-error" className="text-sm text-destructive">
                  {state.errors.tradeName[0]}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="contactEmail" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={props.contactEmail ?? ""}
                aria-invalid={Boolean(state?.errors?.contactEmail)}
                aria-describedby={
                  state?.errors?.contactEmail ? "contactEmail-error" : undefined
                }
              />
              {state?.errors?.contactEmail && (
                <p id="contactEmail-error" className="text-sm text-destructive">
                  {state.errors.contactEmail[0]}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="phone" className="text-sm font-medium">
                Telefone
              </label>
              <Input
                id="phone"
                name="phone"
                defaultValue={props.phone ?? ""}
                aria-invalid={Boolean(state?.errors?.phone)}
                aria-describedby={state?.errors?.phone ? "phone-error" : undefined}
              />
              {state?.errors?.phone && (
                <p id="phone-error" className="text-sm text-destructive">
                  {state.errors.phone[0]}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="whatsapp" className="text-sm font-medium">
                WhatsApp
              </label>
              <Input
                id="whatsapp"
                name="whatsapp"
                defaultValue={props.whatsapp ?? ""}
                aria-invalid={Boolean(state?.errors?.whatsapp)}
                aria-describedby={
                  state?.errors?.whatsapp ? "whatsapp-error" : undefined
                }
              />
              {state?.errors?.whatsapp && (
                <p id="whatsapp-error" className="text-sm text-destructive">
                  {state.errors.whatsapp[0]}
                </p>
              )}
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="website" className="text-sm font-medium">
                Website
              </label>
              <Input
                id="website"
                name="website"
                defaultValue={props.website ?? ""}
                aria-invalid={Boolean(state?.errors?.website)}
                aria-describedby={
                  state?.errors?.website ? "website-error" : undefined
                }
              />
              {state?.errors?.website && (
                <p id="website-error" className="text-sm text-destructive">
                  {state.errors.website[0]}
                </p>
              )}
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="addressLine" className="text-sm font-medium">
                Endereço
              </label>
              <Input
                id="addressLine"
                name="addressLine"
                defaultValue={props.addressLine ?? ""}
                aria-invalid={Boolean(state?.errors?.addressLine)}
                aria-describedby={
                  state?.errors?.addressLine ? "addressLine-error" : undefined
                }
              />
              {state?.errors?.addressLine && (
                <p id="addressLine-error" className="text-sm text-destructive">
                  {state.errors.addressLine[0]}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="city" className="text-sm font-medium">
                Cidade
              </label>
              <Input
                id="city"
                name="city"
                defaultValue={props.city ?? ""}
                aria-invalid={Boolean(state?.errors?.city)}
                aria-describedby={state?.errors?.city ? "city-error" : undefined}
              />
              {state?.errors?.city && (
                <p id="city-error" className="text-sm text-destructive">
                  {state.errors.city[0]}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="state" className="text-sm font-medium">
                Estado
              </label>
              <Input
                id="state"
                name="state"
                defaultValue={props.state ?? ""}
                aria-invalid={Boolean(state?.errors?.state)}
                aria-describedby={state?.errors?.state ? "state-error" : undefined}
              />
              {state?.errors?.state && (
                <p id="state-error" className="text-sm text-destructive">
                  {state.errors.state[0]}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="zipCode" className="text-sm font-medium">
                CEP
              </label>
              <Input
                id="zipCode"
                name="zipCode"
                defaultValue={props.zipCode ?? ""}
                aria-invalid={Boolean(state?.errors?.zipCode)}
                aria-describedby={
                  state?.errors?.zipCode ? "zipCode-error" : undefined
                }
              />
              {state?.errors?.zipCode && (
                <p id="zipCode-error" className="text-sm text-destructive">
                  {state.errors.zipCode[0]}
                </p>
              )}
            </div>
          </div>

          {state?.message && (
            <p className="text-sm text-destructive">{state.message}</p>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar dados da empresa"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
