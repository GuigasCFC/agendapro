"use client"

import { useState } from "react"
import Link from "next/link"
import { Download, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ExportButtonsProps {
  query: string
}

type ExportFormat = "csv" | "pdf"

export function ExportButtons({ query }: ExportButtonsProps) {
  const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(null)

  function handleExport(format: ExportFormat) {
    setPendingFormat(format)
    window.setTimeout(() => setPendingFormat(null), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pendingFormat === "csv"}
        onClick={() => handleExport("csv")}
        className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
        render={<Link href={`/reports/export?format=csv&${query}`} prefetch={false} />}
      >
        <Download />
        {pendingFormat === "csv" ? "Exportando..." : "CSV"}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pendingFormat === "pdf"}
        onClick={() => handleExport("pdf")}
        className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
        render={<Link href={`/reports/export?format=pdf&${query}`} prefetch={false} />}
      >
        <FileText />
        {pendingFormat === "pdf" ? "Exportando..." : "PDF"}
      </Button>
    </div>
  )
}
