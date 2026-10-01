import { useState } from 'react'
import { FileTextIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileDropzoneProps {
  onFile: (file: File) => void
}

export function FileDropzone({ onFile }: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false)

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault()
        setDragging(false)
        const file = event.dataTransfer.files[0]
        if (file) onFile(file)
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-16 text-center transition-colors hover:bg-muted/50',
        dragging && 'border-primary bg-muted/50',
      )}
    >
      <FileTextIcon className="size-10 text-muted-foreground" />
      <div className="space-y-1">
        <p className="font-medium">Arrastrá el TXT del reloj o hacé clic para elegirlo</p>
        <p className="text-sm text-muted-foreground">
          Archivo de marcas exportado por el reloj biométrico Prosoft (por ejemplo, agl001.txt)
        </p>
      </div>
      <input
        type="file"
        accept=".txt,text/plain"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFile(file)
          // Allow picking the same file again.
          event.target.value = ''
        }}
      />
    </label>
  )
}
