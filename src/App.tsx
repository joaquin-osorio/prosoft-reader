import { useMemo, useState } from 'react'
import { AlertTriangleIcon, UploadIcon } from 'lucide-react'
import { ArrivalLimitInput } from '@/components/arrival-limit-input'
import { AttendanceGrid } from '@/components/attendance-grid'
import { FileDropzone } from '@/components/file-dropzone'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useSettings } from '@/hooks/use-settings'
import { getFirstArrivals, type Arrival } from '@/lib/attendance/arrivals'
import { decodeTxt, parseProsoftTxt } from '@/lib/attendance/parse'
import { buildAttendance } from '@/lib/attendance/summary'
import { formatShortDate, parseHHMM } from '@/lib/attendance/time'
import { DEFAULT_SETTINGS } from '@/lib/settings'

interface LoadedFile {
  name: string
  arrivals: Arrival[]
  skippedLines: number
}

function App() {
  const [settings, updateSettings] = useSettings()
  const [loaded, setLoaded] = useState<LoadedFile | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const limitMinutes =
    parseHHMM(settings.arrivalLimit) ?? parseHHMM(DEFAULT_SETTINGS.arrivalLimit)!

  const attendance = useMemo(
    () => (loaded ? buildAttendance(loaded.arrivals, limitMinutes) : null),
    [loaded, limitMinutes],
  )

  const handleFile = async (file: File) => {
    const { punches, skippedLines } = parseProsoftTxt(decodeTxt(await file.arrayBuffer()))
    if (punches.length === 0) {
      setLoadError(`No se encontraron marcas válidas en "${file.name}".`)
      return
    }
    setLoadError(null)
    setLoaded({ name: file.name, arrivals: getFirstArrivals(punches), skippedLines })
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Prosoft Reader</h1>
          <p className="text-sm text-muted-foreground">
            Control de presentismo a partir de las marcas del reloj biométrico
          </p>
        </div>
        <ArrivalLimitInput
          value={settings.arrivalLimit}
          onChange={(arrivalLimit) => updateSettings({ arrivalLimit })}
        />
      </header>

      {loadError && (
        <Alert variant="destructive">
          <AlertTriangleIcon />
          <AlertTitle>No se pudo leer el archivo</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}

      {!loaded || !attendance ? (
        <FileDropzone onFile={handleFile} />
      ) : (
        <>
          {loaded.skippedLines > 0 && (
            <Alert>
              <AlertTriangleIcon />
              <AlertTitle>
                Se ignoraron {loaded.skippedLines}{' '}
                {loaded.skippedLines === 1 ? 'línea' : 'líneas'} con formato no reconocido
              </AlertTitle>
              <AlertDescription>El resto del archivo se procesó normalmente.</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Asistencia</CardTitle>
              <CardDescription>
                {loaded.name} · {formatShortDate(attendance.days[0])} al{' '}
                {formatShortDate(attendance.days[attendance.days.length - 1])} ·{' '}
                {attendance.people.length} personas · {attendance.days.length} días
              </CardDescription>
              <CardAction>
                <Button variant="outline" onClick={() => setLoaded(null)}>
                  <UploadIcon />
                  Cargar otro archivo
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-3">
              <AttendanceGrid attendance={attendance} />
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block size-3 rounded-sm bg-late" />
                Llegada tarde (después de las {settings.arrivalLimit}:59) · — sin registro ese día
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  )
}

export default App
