import type { Cell, CellObject, SheetData } from 'write-excel-file/browser'
import { isLate, type Arrival } from '@/lib/attendance/arrivals'
import type { DateRange } from '@/lib/attendance/range'
import { formatShortDate } from '@/lib/attendance/time'

const TITLE_FILL = '#00FFFF'
const LATE_FILL = '#FFFF00'
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const pad = (value: number) => String(value).padStart(2, '0')

function formatListingDate(date: Date): string {
  const day = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${String(date.getFullYear()).slice(2)}`
  return `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function titleRow(): Cell[] {
  const cells: CellObject[] = [
    {
      value: 'Movimientos por persona',
      fontWeight: 'bold',
      fontStyle: 'italic',
      leftBorderStyle: 'thick',
    },
    {},
    {},
    {},
    {},
    { rightBorderStyle: 'thick' },
  ]
  return [
    null,
    ...cells.map((cell) => ({
      ...cell,
      backgroundColor: TITLE_FILL,
      topBorderStyle: 'thick' as const,
      bottomBorderStyle: 'thick' as const,
    })),
  ]
}

/**
 * Builds the "Movimientos por persona" sheet, mirroring the layout of the
 * report the office already uses (minus the location column). Expects first
 * arrivals sorted by person and date, as returned by `getFirstArrivals`.
 * See `docs/attendance.md` for the exact layout.
 */
export function buildPresentismoSheet(
  arrivals: Arrival[],
  limitMinutes: number,
  generatedAt: Date,
): SheetData {
  const rows: SheetData = [
    [],
    [],
    titleRow(),
    [null, `Fecha de listado ${formatListingDate(generatedAt)}`],
    [null, 'Persona  Todos'],
    [],
  ]

  for (const arrival of arrivals) {
    const backgroundColor = isLate(arrival, limitMinutes) ? LATE_FILL : undefined
    // Excel times are fractions of a day; seconds are dropped like in the
    // original report, which also matches how lateness is decided.
    const time = Math.floor(arrival.seconds / 60) / (24 * 60)
    const cells: CellObject[] = [
      { value: formatShortDate(arrival.date), type: String },
      { value: time, type: Number, format: 'h:mm' },
      { value: 'Entrada', type: String },
      {},
      { value: arrival.userId, type: Number },
      { value: arrival.name, type: String },
    ]
    rows.push([null, ...cells.map((cell) => (backgroundColor ? { ...cell, backgroundColor } : cell))])
  }

  return rows
}

/** `Presentismo <Month> <Year>.xlsx`, named after the month the range ends in. */
export function getPresentismoFileName(range: DateRange): string {
  const [year, month] = range.to.split('-').map(Number)
  return `Presentismo ${MONTHS[month - 1]} ${year}.xlsx`
}

/** Generates the workbook and triggers the browser download. */
export async function exportPresentismoXlsx(
  arrivals: Arrival[],
  limitMinutes: number,
  range: DateRange,
): Promise<void> {
  // Loaded on demand so the xlsx writer stays out of the initial bundle.
  const { default: writeExcelFile } = await import('write-excel-file/browser')
  const sheetData = buildPresentismoSheet(arrivals, limitMinutes, new Date())
  await writeExcelFile(sheetData, {
    sheet: 'Sheet1',
    columns: [16, 16, 16, 16, 16, 10, 24].map((width) => ({ width })),
  }).toFile(getPresentismoFileName(range))
}
