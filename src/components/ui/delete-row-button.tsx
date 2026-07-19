"use client"

import { useFormStatus } from "react-dom"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface DeleteRowButtonProps {
  label: string
}

export function DeleteRowButton({ label }: DeleteRowButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      variant="destructive"
      size="icon-sm"
      type="submit"
      disabled={pending}
      aria-label={label}
      title="Excluir"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
