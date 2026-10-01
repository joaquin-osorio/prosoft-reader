import { useState } from 'react'
import { DownloadIcon, LoaderCircleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Arrival } from '@/lib/attendance/arrivals'
import type { DateRange } from '@/lib/attendance/range'
import { exportPresentismoXlsx } from '@/lib/export/presentismo-xlsx'

interface ExportButtonProps {
  arrivals: Arrival[]
  limitMinutes: number
  range: DateRange
}

export function ExportButton({ arrivals, limitMinutes, range }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportPresentismoXlsx(arrivals, limitMinutes, range)
    } catch (error) {
      console.error(error)
      window.alert('No se pudo generar el Excel. Probá de nuevo.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button onClick={handleExport} disabled={exporting || arrivals.length === 0}>
      {exporting ? <LoaderCircleIcon className="animate-spin" /> : <DownloadIcon />}
      Exportar Excel
    </Button>
  )
}
