import { useState } from 'react'
import { CalendarIcon } from 'lucide-react'
import type { DateRange as PickerRange } from 'react-day-picker'
import { es } from 'react-day-picker/locale'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  isoToLocalDate,
  localDateToIso,
  type DateRange,
} from '@/lib/attendance/range'
import { formatShortDate } from '@/lib/attendance/time'

interface DateRangePickerProps {
  value: DateRange
  /** The file's whole period: the selectable bounds and the reset target. */
  bounds: DateRange
  onChange: (range: DateRange) => void
}

export function DateRangePicker({ value, bounds, onChange }: DateRangePickerProps) {
  const wide = useMediaQuery('(min-width: 640px)')
  // While only the start day has been picked, the calendar must keep `to`
  // empty so the next click completes the range; meanwhile the app already
  // filters by that single day.
  const [draft, setDraft] = useState<PickerRange | null>(null)

  const selected = draft ?? { from: isoToLocalDate(value.from), to: isoToLocalDate(value.to) }
  const isFull = value.from === bounds.from && value.to === bounds.to
  const min = isoToLocalDate(bounds.from)
  const max = isoToLocalDate(bounds.to)

  return (
    <Popover onOpenChange={() => setDraft(null)}>
      <PopoverTrigger render={<Button variant="outline" className="tabular-nums" />}>
        <CalendarIcon />
        {formatShortDate(value.from)} – {formatShortDate(value.to)}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto">
        <Calendar
          mode="range"
          required
          resetOnSelect
          locale={es}
          showOutsideDays={false}
          numberOfMonths={wide ? 2 : 1}
          defaultMonth={selected.from}
          startMonth={min}
          endMonth={max}
          disabled={[{ before: min }, { after: max }]}
          selected={selected}
          onSelect={(range) => {
            if (!range.from) return
            setDraft(range.to ? null : range)
            onChange({
              from: localDateToIso(range.from),
              to: localDateToIso(range.to ?? range.from),
            })
          }}
        />
        <div className="flex items-center justify-between gap-2 border-t pt-2.5">
          <p className="text-xs text-muted-foreground">
            {draft ? 'Elegí el día final' : 'Elegí el día inicial'}
          </p>
          <Button
            variant="ghost"
            size="sm"
            disabled={isFull}
            onClick={() => {
              setDraft(null)
              onChange(bounds)
            }}
          >
            Todo el período
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
