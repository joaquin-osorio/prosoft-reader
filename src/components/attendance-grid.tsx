import type { Attendance } from '@/lib/attendance/summary'
import { formatShortDate, formatTimeOfDay, getWeekday } from '@/lib/attendance/time'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

interface AttendanceGridProps {
  attendance: Attendance
}

/** People × days matrix with each person's first arrival of the day. */
export function AttendanceGrid({ attendance }: AttendanceGridProps) {
  const { days, people } = attendance

  return (
    // Compact day columns (text-xs, px-1) so a full payroll period fits the
    // card on desktop; the table wrapper still scrolls on narrow screens.
    <Table className="tabular-nums">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="sticky left-0 z-10 bg-card">Persona</TableHead>
          {days.map((day) => (
            <TableHead key={day} className="px-1 text-center text-xs leading-tight">
              <span className="block font-normal text-muted-foreground">
                {WEEKDAYS[getWeekday(day)]}
              </span>
              {formatShortDate(day).slice(0, 5)}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {people.map((person) => (
          <TableRow key={person.userId}>
            <TableCell className="sticky left-0 z-10 bg-card font-medium">
              {person.name}
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                #{person.userId}
              </span>
            </TableCell>
            {days.map((day) => {
              const entry = person.byDay[day]
              if (!entry) {
                return (
                  <TableCell
                    key={day}
                    className="px-1 text-center text-xs text-muted-foreground/60"
                    title={`${person.name} · ${formatShortDate(day)} · sin registro`}
                  >
                    —
                  </TableCell>
                )
              }
              const time = formatTimeOfDay(entry.arrival.seconds, true)
              return (
                <TableCell
                  key={day}
                  className={cn(
                    'px-1 text-center text-xs',
                    entry.late && 'bg-late font-medium text-late-foreground',
                  )}
                  title={`${person.name} · ${formatShortDate(day)} · ${time}${entry.late ? ' · tarde' : ''}`}
                >
                  {time.slice(0, 5)}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
