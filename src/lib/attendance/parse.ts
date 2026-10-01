/** A single clock punch read from a Prosoft TXT export. */
export interface Punch {
  /** Enrollment number (`EnNo`), the stable person identifier. */
  userId: number
  name: string
  /** `YYYY-MM-DD`. Kept as a string to avoid timezone conversions. */
  date: string
  /** Seconds since midnight. */
  seconds: number
}

export interface ParseResult {
  punches: Punch[]
  /** Non-empty lines that could not be interpreted (excluding the header). */
  skippedLines: number
}

// No ⇥ Mchn ⇥ EnNo ⇥ Name ⇥ Mode ⇥ IOMd ⇥ YYYY/MM/DD  HH:MM:SS
const LINE =
  /^\s*\d+\t\d+\t(\d+)\t([^\t]*)\t\d+\t\d+\t(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2}):(\d{2})\s*$/

/**
 * Parses the tab-separated attendance log exported by Prosoft clocks.
 * The header line is ignored; see `docs/attendance.md` for the format.
 */
export function parseProsoftTxt(text: string): ParseResult {
  const punches: Punch[] = []
  let skippedLines = 0

  text.split(/\r?\n/).forEach((line, index) => {
    if (line.trim() === '') return
    if (index === 0 && /\bEnNo\b/.test(line)) return

    const match = LINE.exec(line)
    if (!match) {
      skippedLines++
      return
    }

    const [, enNo, name, year, month, day, hh, mm, ss] = match
    const [hours, minutes, seconds] = [Number(hh), Number(mm), Number(ss)]
    if (
      Number(month) < 1 || Number(month) > 12 ||
      Number(day) < 1 || Number(day) > 31 ||
      hours > 23 || minutes > 59 || seconds > 59
    ) {
      skippedLines++
      return
    }

    const userId = Number(enNo)
    punches.push({
      userId,
      name: name.trim() || `#${userId}`,
      date: `${year}-${month}-${day}`,
      seconds: hours * 3600 + minutes * 60 + seconds,
    })
  })

  return { punches, skippedLines }
}

/**
 * Decodes the raw file bytes. Clock exports are usually ASCII, but names with
 * accents or ñ may come as Windows-1252, so fall back to it when UTF-8 fails.
 */
export function decodeTxt(bytes: ArrayBuffer): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder('windows-1252').decode(bytes)
  }
}
