import { describe, expect, it } from 'vitest'
import type { CellObject } from 'write-excel-file/browser'
import type { Arrival } from '@/lib/attendance/arrivals'
import { buildPresentismoSheet, getPresentismoFileName } from './presentismo-xlsx'

const at = (hh: number, mm: number, ss: number) => hh * 3600 + mm * 60 + ss

const arrivals: Arrival[] = [
  { userId: 1, name: 'dani', date: '2026-09-03', seconds: at(8, 10, 24) },
  { userId: 1, name: 'dani', date: '2026-09-04', seconds: at(9, 16, 49) },
  { userId: 3, name: 'joaquito', date: '2026-08-27', seconds: at(9, 10, 54) },
]

const LIMIT = 9 * 60 + 10
const sheet = buildPresentismoSheet(arrivals, LIMIT, new Date(2026, 8, 28, 13, 38, 4))
const dataRows = sheet.slice(6) as (CellObject | null)[][]

describe('buildPresentismoSheet', () => {
  it('writes the report header starting at B3', () => {
    expect(sheet[0]).toEqual([])
    expect((sheet[2][1] as CellObject).value).toBe('Movimientos por persona')
    expect(sheet[3][1]).toBe('Fecha de listado 28/09/26 13:38:04')
    expect(sheet[4][1]).toBe('Persona  Todos')
  })

  it('writes one row per first arrival, with column A empty', () => {
    expect(dataRows.map((row) => row.map((cell) => cell?.value))).toEqual([
      [undefined, '03/09/26', (8 * 60 + 10) / 1440, 'Entrada', undefined, 1, 'dani'],
      [undefined, '04/09/26', (9 * 60 + 16) / 1440, 'Entrada', undefined, 1, 'dani'],
      [undefined, '27/08/26', (9 * 60 + 10) / 1440, 'Entrada', undefined, 3, 'joaquito'],
    ])
    expect(dataRows[0][2]?.format).toBe('h:mm')
  })

  it('fills every cell of late rows in yellow and leaves on-time rows plain', () => {
    const fills = dataRows.map((row) => row.slice(1).map((cell) => cell?.backgroundColor))
    expect(fills[0]).toEqual(Array(6).fill(undefined))
    expect(fills[1]).toEqual(Array(6).fill('#FFFF00'))
    // 09:10:54 is still on time with a 09:10 limit.
    expect(fills[2]).toEqual(Array(6).fill(undefined))
  })
})

describe('getPresentismoFileName', () => {
  it('uses the month the range ends in', () => {
    expect(getPresentismoFileName({ from: '2026-08-26', to: '2026-09-25' })).toBe(
      'Presentismo Septiembre 2026.xlsx',
    )
  })

  it('uses the end month and year when the range crosses a year boundary', () => {
    expect(getPresentismoFileName({ from: '2026-12-26', to: '2027-01-25' })).toBe(
      'Presentismo Enero 2027.xlsx',
    )
  })
})
