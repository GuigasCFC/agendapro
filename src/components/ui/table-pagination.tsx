import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

interface TablePaginationProps {
  shown: number
  total: number
}

export function TablePagination({ shown, total }: TablePaginationProps) {
  if (total === 0) return null

  return (
    <div className="flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
      <p>
        Mostrando <span className="font-medium text-foreground">{shown}</span>{" "}
        de <span className="font-medium text-foreground">{total}</span>
      </p>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
