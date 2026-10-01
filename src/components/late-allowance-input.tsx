import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isValidMaxLateDays } from '@/lib/settings'

interface LateAllowanceInputProps {
  value: number
  onChange: (value: number) => void
}

export function LateAllowanceInput({ value, onChange }: LateAllowanceInputProps) {
  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="late-allowance" className="whitespace-nowrap">
        Tardes permitidos
      </Label>
      <Input
        id="late-allowance"
        type="number"
        min={0}
        step={1}
        // Uncontrolled so the field can be cleared while typing a new number.
        // Only valid values apply; anything else is reverted on blur.
        defaultValue={value}
        onChange={(event) => {
          const next = event.target.valueAsNumber
          if (isValidMaxLateDays(next)) onChange(next)
        }}
        onBlur={(event) => {
          if (!isValidMaxLateDays(event.target.valueAsNumber)) event.target.value = String(value)
        }}
        className="w-20 tabular-nums"
        title="Con una llegada tarde más se pierde el presentismo"
      />
    </div>
  )
}
