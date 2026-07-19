"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

import "./globals.css"

export default function GlobalError({
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
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
          <AlertTriangle className="size-10 text-destructive" />
          <div className="space-y-1">
            <h1 className="text-lg font-semibold">Algo deu errado</h1>
            <p className="text-sm text-muted-foreground">
              Ocorreu um erro inesperado. Tente novamente.
            </p>
          </div>
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-xs hover:bg-muted"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
