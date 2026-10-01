# Prosoft Reader

![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

**Turn the raw punch log from a Prosoft biometric time clock into a clear attendance report, entirely in your browser.**

Prosoft clocks export a plain tab-separated TXT file with every fingerprint punch of every employee. Prosoft Reader reads that file and shows, at a glance:

- each person's **first arrival** of every day,
- who arrived **late** and how often,
- the **days with no punch** for each person,
- who has **lost the perfect-attendance bonus** for the period.

It can then export the result as an **Excel report** in the same layout the office already uses.

## Privacy first

Attendance data is personal data, so Prosoft Reader has **no backend**. The file is read and processed locally in the browser and never leaves your machine. The only thing stored is your two settings (arrival limit and late allowance), saved in `localStorage`.

## Features

- **Drag & drop loading.** Drop the TXT or pick it from disk. Files are decoded as UTF-8 with a Windows-1252 fallback. Malformed lines are skipped and you see how many were ignored, so one bad line never blocks a whole report.
- **Per-person summary.** Late arrivals and missing days for each employee. People over the late allowance are highlighted in red.
- **Day-by-day grid.** The arrival time of every person on every day, with late arrivals highlighted and missing days marked. It fits the screen without horizontal scrolling.
- **Configurable rules.** Set the latest on-time arrival (default `09:10`) and how many late arrivals are allowed before the bonus is lost (default `3`). Both settings are remembered between sessions.
- **Date-range filter.** Narrow the report to any range inside the file's period, for example a payroll period like the 26th to the 25th. The filter applies to the summary, the grid and the export alike.
- **Excel export.** One click generates an `.xlsx` that mirrors the existing report, with late rows highlighted, named after the month the selected range ends in. The Excel writer is lazy-loaded, so it costs nothing until the first export.

## How it works

1. **Parse.** Each line of the TXT becomes a punch. A punch has an enrollment number (`EnNo`, the stable person ID), a name, a date and a time. Dates stay as `YYYY-MM-DD` strings and times as seconds since midnight. There are no `Date` objects, so there are no timezone surprises.
2. **Keep only the entry.** For each person and day, only the earliest punch counts. Later punches that day (lunch, leaving, double taps) are discarded.
3. **Decide lateness.** Only whole minutes are compared. With a `09:10` limit, `09:10:59` is on time and `09:11:00` is late.
4. **Build the period.** The period's days are the dates on which *anyone* punched. A person with no punch on one of those days counts as missing that day. Days when nobody punched, such as weekends and holidays, are left out automatically.
5. **Apply the allowance.** A person loses the perfect-attendance bonus when their late arrivals in the selected range exceed the allowance.

The full rules, edge cases and the exact Excel layout are documented in [`docs/attendance.md`](docs/attendance.md).

## Input format

The tab-separated TXT exported by the clock looks like this (sample data):

```text
No	Mchn	EnNo		Name			Mode	IOMd	DateTime
000001	1	000000005	jdoe            	001	001	2026/08/26  09:07:45
000002	1	000000012	asmith          	020	001	2026/08/26  09:14:02
000003	1	000000005	jdoe            	001	001	2026/08/26  13:02:10
```

People are identified by `EnNo`, not by name. The `Mchn`, `Mode` and `IOMd` columns are ignored.

## Getting started

**Prerequisites:** Node.js `20.19+` or `22.12+`, and npm.

```bash
git clone https://github.com/joaquin-osorio/prosoft-reader.git
cd prosoft-reader
npm install
npm run dev
```

Then open the URL that Vite prints (usually http://localhost:5173) and drop in a TXT export.

To produce a static build that you can host anywhere (no server needed):

```bash
npm run build   # outputs to dist/
npm run preview # serves the build locally
```

## Scripts

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with hot reload    |
| `npm run build`   | Typecheck (`tsc -b`) and build to `dist/`    |
| `npm run preview` | Serve the production build locally           |
| `npm run lint`    | Run ESLint                                   |
| `npm run test`    | Run the unit tests with Vitest               |

## Tech stack

- **[React 19](https://react.dev)** + **[TypeScript](https://www.typescriptlang.org)**, bundled with **[Vite](https://vite.dev)**
- **[Tailwind CSS v4](https://tailwindcss.com)**, configured CSS-first
- **[shadcn/ui](https://ui.shadcn.com)** (`base-nova` style, built on [Base UI](https://base-ui.com)) and [Lucide](https://lucide.dev) icons
- **[date-fns](https://date-fns.org)** and **[React DayPicker](https://daypicker.dev)** for the date-range picker
- **[write-excel-file](https://gitlab.com/catamphetamine/write-excel-file)** for the `.xlsx` export
- **[Vitest](https://vitest.dev)** for unit tests

## Project structure

```text
src/
├── lib/
│   ├── attendance/   # Pure domain logic: parse, arrivals, range, summary, time
│   ├── export/       # Excel report builder (pure) + lazy-loaded writer
│   └── settings.ts   # Settings validation and localStorage persistence
├── hooks/            # React hooks (settings, media queries)
├── components/       # App components (dropzone, grid, summary, pickers, export)
│   └── ui/           # shadcn/ui components
└── App.tsx
docs/                 # In-depth notes on business rules and styling
```

The business logic in `src/lib` is plain TypeScript with no React dependency. Its tests sit next to the code as `*.test.ts`.

## Documentation

- [`docs/attendance.md`](docs/attendance.md): input format, attendance rules and the Excel layout.
- [`docs/styling.md`](docs/styling.md): Tailwind theme tokens, shadcn/ui setup and the `@/` import alias.

## License

[MIT](LICENSE) © 2026 Joaquin Osorio
