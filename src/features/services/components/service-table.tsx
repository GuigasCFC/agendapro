"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Pencil, Scissors } from "lucide-react"
import { deleteService } from "@/features/services/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeleteRowButton } from "@/components/ui/delete-row-button"
import { EmptyState } from "@/components/ui/empty-state"
import { TableToolbar } from "@/components/ui/table-toolbar"
import { TablePagination } from "@/components/ui/table-pagination"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

interface ServiceTableProps {
  services: {
    id: string
    name: string
    durationMin: number
    price: number | string
    active: boolean
    createdAt: Date
  }[]
}

function formatPrice(price: number | string) {
  return Number(price).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}

export function ServiceTable({ services }: ServiceTableProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return services

    return services.filter((service) =>
      service.name.toLowerCase().includes(query)
    )
  }, [services, search])

  if (services.length === 0) {
    return <EmptyState icon={Scissors} title="Nenhum serviço cadastrado ainda." />
  }

  return (
    <div className="space-y-4">
      <TableToolbar
        value={search}
        onValueChange={setSearch}
        placeholder="Buscar por nome do serviço..."
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Duração</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filtered.map((service) => (
            <TableRow key={service.id}>
              <TableCell className="max-w-[220px] truncate font-medium">
                {service.name}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {service.durationMin} min
              </TableCell>
              <TableCell className="font-mono">
                {formatPrice(service.price)}
              </TableCell>
              <TableCell>
                <Badge variant={service.active ? "success" : "secondary"}>
                  {service.active ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {format(service.createdAt, "dd/MM/yyyy")}
              </TableCell>
              <TableCell className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={<Link href={`/services/${service.id}`} />}
                  aria-label={`Editar ${service.name}`}
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <form action={deleteService.bind(null, service.id)}>
                  <DeleteRowButton label={`Excluir ${service.name}`} />
                </form>
              </TableCell>
            </TableRow>
          ))}

          {filtered.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                Nenhum resultado para &quot;{search}&quot;.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination shown={filtered.length} total={services.length} />
    </div>
  )
}
