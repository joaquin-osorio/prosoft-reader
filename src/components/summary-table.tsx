import type { PersonAttendance } from '@/lib/attendance/summary'
import { cn } from '@/lib/utils'
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
  /** People with more late arrivals than this are highlighted. */
  maxLateDays: number
}

export function SummaryTable({ people, maxLateDays }: SummaryTableProps) {
  return (
    <Table className="tabular-nums">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-12">Nº</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead className="text-right">Llegadas tarde</TableHead>
          <TableHead className="text-right">Sin registro</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {people.map((person) => {
          const overLimit = person.lateDays > maxLateDays
          // Muted text is too faint on the red background, so flagged rows
          // keep their own foreground everywhere.
          const muted = !overLimit && 'text-muted-foreground'
          return (
            <TableRow
              key={person.userId}
              className={cn(
                overLimit && 'bg-over-limit text-over-limit-foreground hover:bg-over-limit',
              )}
            >
              <TableCell className={cn(muted)}>{person.userId}</TableCell>
              <TableCell className="font-medium">{person.name}</TableCell>
              <TableCell
                className={cn('text-right', overLimit && 'font-semibold', person.lateDays === 0 && muted)}
              >
                {person.lateDays}
              </TableCell>
              <TableCell className={cn('text-right', person.missingDays === 0 && muted)}>
                {person.missingDays}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
