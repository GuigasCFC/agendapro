"use client"

import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

interface TableToolbarProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function TableToolbar({
  value,
  onValueChange,
  placeholder = "Buscar...",
}: TableToolbarProps) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

      <Input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
    </div>
  )
}
