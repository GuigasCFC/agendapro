import Link from "next/link"
import { format } from "date-fns"
import { Pencil, Trash2 } from "lucide-react"
import { deleteService } from "@/features/services/actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  if (services.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
        Nenhum serviço cadastrado ainda.
      </div>
    )
  }

  return (
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
        {services.map((service) => (
          <TableRow key={service.id}>
            <TableCell className="font-medium">{service.name}</TableCell>
            <TableCell>{service.durationMin} min</TableCell>
            <TableCell>{formatPrice(service.price)}</TableCell>
            <TableCell>
              <Badge variant={service.active ? "default" : "secondary"}>
                {service.active ? "Ativo" : "Inativo"}
              </Badge>
            </TableCell>
            <TableCell>{format(service.createdAt, "dd/MM/yyyy")}</TableCell>
            <TableCell className="flex justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                render={<Link href={`/services/${service.id}`} />}
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <form action={deleteService.bind(null, service.id)}>
                <Button variant="ghost" size="icon-sm" type="submit">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
