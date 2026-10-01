import type { PersonAttendance } from '@/lib/attendance/summary'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SummaryTableProps {
  people: PersonAttendance[]
}

export function SummaryTable({ people }: SummaryTableProps) {
  return (
    <Table className="tabular-nums">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-12">Nº</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead className="text-right">Días con registro</TableHead>
          <TableHead className="text-right">Llegadas tarde</TableHead>
          <TableHead className="text-right">Sin registro</TableHead>
          <TableHead className="text-right">Puntualidad</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {people.map((person) => (
          <TableRow key={person.userId}>
            <TableCell className="text-muted-foreground">{person.userId}</TableCell>
            <TableCell className="font-medium">{person.name}</TableCell>
            <TableCell className="text-right">{person.presentDays}</TableCell>
            <TableCell className="text-right">
              {person.lateDays > 0 ? (
                <Badge className="bg-late text-late-foreground tabular-nums">
                  {person.lateDays}
                </Badge>
              ) : (
                <span className="text-muted-foreground">0</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              {person.missingDays > 0 ? (
                person.missingDays
              ) : (
                <span className="text-muted-foreground">0</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              {Math.round(((person.presentDays - person.lateDays) / person.presentDays) * 100)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
