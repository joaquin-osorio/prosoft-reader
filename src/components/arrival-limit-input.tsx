import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { parseHHMM } from '@/lib/attendance/time'

interface ArrivalLimitInputProps {
  value: string
  onChange: (value: string) => void
}

export function ArrivalLimitInput({ value, onChange }: ArrivalLimitInputProps) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="arrival-limit" className="whitespace-nowrap">
        Hora límite
      </Label>
      <Input
        id="arrival-limit"
        type="time"
        value={value}
        // Partial or cleared values are ignored; only complete times apply.
        onChange={(event) => {
          if (parseHHMM(event.target.value) !== null) onChange(event.target.value)
        }}
        className="w-28 tabular-nums"
        title="Se considera a horario hasta el último segundo de este minuto"
      />
    </div>
  )
}
