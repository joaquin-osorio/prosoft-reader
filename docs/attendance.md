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
- **Period days** are the dates with at least one punch from anyone (`buildAttendance`). A person with no punch on one of them shows "—" and counts as missing that day; days nobody punched (weekends, holidays) are not part of the period.
- Weekends are not special: if someone punched on a Saturday, that day counts like any other.
