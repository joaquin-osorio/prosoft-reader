import { useMemo, useState } from 'react'
import { AlertTriangleIcon, UploadIcon } from 'lucide-react'
import { ArrivalLimitInput } from '@/components/arrival-limit-input'
import { AttendanceGrid } from '@/components/attendance-grid'
import { DateRangePicker } from '@/components/date-range-picker'
import { ExportButton } from '@/components/export-button'
import { FileDropzone } from '@/components/file-dropzone'
import { LateAllowanceInput } from '@/components/late-allowance-input'
import { SummaryTable } from '@/components/summary-table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useSettings } from '@/hooks/use-settings'
import { getFirstArrivals, type Arrival } from '@/lib/attendance/arrivals'
import { decodeTxt, parseProsoftTxt } from '@/lib/attendance/parse'
import { filterByRange, getFullRange, type DateRange } from '@/lib/attendance/range'
import { buildAttendance } from '@/lib/attendance/summary'
import { parseHHMM } from '@/lib/attendance/time'
import { DEFAULT_SETTINGS } from '@/lib/settings'

interface LoadedFile {
  name: string
  arrivals: Arrival[]
  skippedLines: number
  fullRange: DateRange
}

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`

function App() {
  const [settings, updateSettings] = useSettings()
  const [loaded, setLoaded] = useState<LoadedFile | null>(null)
  const [range, setRange] = useState<DateRange | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const limitMinutes =
    parseHHMM(settings.arrivalLimit) ?? parseHHMM(DEFAULT_SETTINGS.arrivalLimit)!

  const arrivalsInRange = useMemo(
    () => (loaded && range ? filterByRange(loaded.arrivals, range) : null),
    [loaded, range],
  )
  const attendance = useMemo(
    () => (arrivalsInRange ? buildAttendance(arrivalsInRange, limitMinutes) : null),
    [arrivalsInRange, limitMinutes],
  )

  const handleFile = async (file: File) => {
    const { punches, skippedLines } = parseProsoftTxt(decodeTxt(await file.arrayBuffer()))
    if (punches.length === 0) {
      setLoadError(`No se encontraron marcas válidas en "${file.name}".`)
      return
    }
    const arrivals = getFirstArrivals(punches)
    const fullRange = getFullRange(arrivals)
    setLoadError(null)
    setLoaded({ name: file.name, arrivals, skippedLines, fullRange })
    // A new file always starts with its whole period selected.
    setRange(fullRange)
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Prosoft Reader</h1>
          <p className="text-sm text-muted-foreground">
            Visualizador de datos
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <ArrivalLimitInput
            value={settings.arrivalLimit}
            onChange={(arrivalLimit) => updateSettings({ arrivalLimit })}
          />
          <LateAllowanceInput
            value={settings.maxLateDays}
            onChange={(maxLateDays) => updateSettings({ maxLateDays })}
          />
        </div>
      </header>

      {loadError && (
        <Alert variant="destructive">
          <AlertTriangleIcon />
          <AlertTitle>No se pudo leer el archivo</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}

      {!loaded || !range || !arrivalsInRange || !attendance ? (
        <FileDropzone onFile={handleFile} />
      ) : (
        <>
          {loaded.skippedLines > 0 && (
            <Alert>
              <AlertTriangleIcon />
              <AlertTitle>
                {loaded.skippedLines === 1 ? 'Se ignoró' : 'Se ignoraron'}{' '}
                {plural(loaded.skippedLines, 'línea', 'líneas')} con formato no reconocido
              </AlertTitle>
              <AlertDescription>El resto del archivo se procesó normalmente.</AlertDescription>
            </Alert>
          )}

          <section className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{loaded.name}</span> ·{' '}
              {plural(attendance.people.length, 'empleado', 'empleados')} ·{' '}
              {plural(attendance.days.length, 'día con registros', 'días con registros')}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <DateRangePicker value={range} bounds={loaded.fullRange} onChange={setRange} />
              <ExportButton
                arrivals={arrivalsInRange}
                limitMinutes={limitMinutes}
                range={range}
              />
              <Button variant="outline" onClick={() => setLoaded(null)}>
                <UploadIcon />
                Cargar otro archivo
              </Button>
            </div>
          </section>

          {attendance.days.length === 0 ? (
            <p className="rounded-xl border border-dashed px-6 py-12 text-center text-sm text-muted-foreground">
              No hay marcas en el rango seleccionado.
            </p>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Resumen por persona</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <SummaryTable people={attendance.people} maxLateDays={settings.maxLateDays} />
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-block size-3 rounded-sm bg-over-limit ring-1 ring-over-limit-foreground/30" />
                    Más de {plural(settings.maxLateDays, 'llegada tarde', 'llegadas tarde')}: pierde
                    el presentismo
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Asistencia por día</CardTitle>
                  <CardDescription>
                    Hora de entrada: la primera marca de cada persona en el día
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AttendanceGrid attendance={attendance} />
                  <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="inline-block size-3 rounded-sm bg-late" />
                      Llegada tarde
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="inline-block w-3 text-center">—</span>
                      Día sin registro
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </main>
  )
}

export default App
