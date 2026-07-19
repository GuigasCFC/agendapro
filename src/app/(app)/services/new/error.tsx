"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function NewServiceError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle />
        <AlertTitle>Não foi possível abrir o formulário</AlertTitle>
        <AlertDescription>
          Ocorreu um erro inesperado. Tente novamente.
        </AlertDescription>
      </Alert>

      <Button variant="outline" onClick={() => unstable_retry()}>
        Tentar novamente
      </Button>
    </div>
  )
}
