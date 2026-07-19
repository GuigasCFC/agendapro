import { Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { TeamMember } from "@/features/settings/services"

interface TeamCardProps {
  members: TeamMember[]
}

export function TeamCard({ members }: TeamCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipe</CardTitle>
        <CardDescription>
          Funcionários cadastrados na sua empresa.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {members.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum funcionário cadastrado ainda." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {member.name}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-muted-foreground">
                    {member.email ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.role ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.active ? "success" : "secondary"}>
                      {member.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
