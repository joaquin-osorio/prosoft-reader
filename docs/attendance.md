# Attendance: input format and business rules

Code: `src/lib/attendance/`.

## Prosoft TXT export

Tab-separated, CRLF line endings, usually ASCII (decoded as UTF-8 with a Windows-1252 fallback in `decodeTxt`).

```
No	Mchn	EnNo		Name			Mode	IOMd	DateTime
000001	1	000000005	joaquin         	001	001	2026/08/26  09:07:45
```

- The header has extra tabs and does not line up with the data columns; it is skipped (first line containing `EnNo`).
- Data columns: `No` (sequence), `Mchn` (clock number), `EnNo` (enrollment number), `Name` (right-padded with spaces), `Mode` (verification mode, e.g. `001`/`020`), `IOMd` (always `001` in practice), `DateTime` (`YYYY/MM/DD` + two spaces + `HH:MM:SS`).
- `Mchn`, `Mode` and `IOMd` are ignored. People are identified by `EnNo`, not by name.
- Lines that don't match the format are skipped and counted (`skippedLines`) so the UI can warn about them.
- Dates are kept as `YYYY-MM-DD` strings and times as seconds since midnight. No `Date` objects, so there are no timezone shifts.

## Rules

- **Only the entry counts.** For each person and day, only the earliest punch is kept (`getFirstArrivals`), whatever its position in the file. Later punches that day (lunch, leaving, double taps) are discarded. `IOMd` is not used to tell entries from exits.
- **Lateness** compares minutes only (`isLate`): late ⇔ `floor(seconds / 60) > limit`. With the default limit `09:10`, `09:10:59` is on time and `09:11:00` is late.
- **Late allowance** (`maxLateDays`, default 3): a person loses presentismo when `lateDays > maxLateDays`, i.e. on the 4th late arrival with the default. The summary table highlights those rows in red; everyone else gets no mark. The allowance is counted over the selected date range.
- **Settings** (`src/lib/settings.ts`): the arrival limit and the late allowance are persisted in `localStorage` (`prosoft-reader:settings`). Each field is validated on its own and falls back to its default, so older stored settings keep their valid values.
- **Period days** are the dates with at least one punch from anyone (`buildAttendance`). A person with no punch on one of them shows "—" and counts as missing that day; days nobody punched (weekends, holidays) are not part of the period.
- Weekends are not special: if someone punched on a Saturday, that day counts like any other.
- **Date range** (`range.ts`): loading a file selects its whole period (first to last date). The user can narrow it with the date picker, bounded to that period; the selected range filters everything downstream (grid, summary and the exported Excel) because it is applied to the arrivals before `buildAttendance`. The range is not persisted and resets on every file load. While only the start day is picked, the app filters by that single day.

## Excel export

Code: `src/lib/export/presentismo-xlsx.ts`. `buildPresentismoSheet` is pure (tested); `exportPresentismoXlsx` lazy-loads `write-excel-file/browser` via `import()` so the writer is a separate chunk that is only fetched on the first export.

It mirrors the report the office already used ("Movimientos por persona", sample `Presentismo Septiembre.xlsx`), **without the location column** (the original had a hard-coded address in column D that is not in the TXT; it was dropped on purpose and the following columns shifted left):

| Row | Content |
| --- | --- |
| 1–2 | empty |
| 3 | `B3` "Movimientos por persona", bold italic; `B3:G3` cyan fill (`#00FFFF`) with a thick outer border |
| 4 | `B4` "Fecha de listado dd/mm/yy HH:MM:SS" (export time, local) |
| 5 | `B5` "Persona  Todos" (two spaces, as in the original) |
| 6 | empty |
| 7+ | one row per first arrival in the selected range, sorted by `EnNo` then date, no header row |

Data columns: `A` empty · `B` date as text `dd/mm/yy` (the original had a leading space; dropped) · `C` time as an Excel day fraction truncated to the minute, format `h:mm` · `D` "Entrada" · `E` empty · `F` `EnNo` as a number · `G` name. Late rows have a yellow fill (`#FFFF00`) on every cell `B:G`, including the empty one.

File name: `Presentismo <Mes> <Año>.xlsx`, after the month the selected range ends in (payroll periods like 26/08–25/09 are named after September).
