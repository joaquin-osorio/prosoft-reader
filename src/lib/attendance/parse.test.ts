import { describe, expect, it } from 'vitest'
import { decodeTxt, parseProsoftTxt } from './parse'

// Same layout as a real Prosoft export: misaligned header, padded names, CRLF.
const SAMPLE = [
  'No\tMchn\tEnNo\t\tName\t\t\tMode\tIOMd\tDateTime',
  '000001\t1\t000000005\tjoaquin         \t001\t001\t2026/08/26  09:07:45',
  '000002\t1\t000000001\tdani            \t020\t001\t2026/08/26  09:10:59',
  '',
].join('\r\n')

describe('parseProsoftTxt', () => {
  it('parses data lines and ignores the header', () => {
    expect(parseProsoftTxt(SAMPLE)).toEqual({
      punches: [
        { userId: 5, name: 'joaquin', date: '2026-08-26', seconds: 9 * 3600 + 7 * 60 + 45 },
        { userId: 1, name: 'dani', date: '2026-08-26', seconds: 9 * 3600 + 10 * 60 + 59 },
      ],
      skippedLines: 0,
    })
  })

  it('accepts LF line endings', () => {
    expect(parseProsoftTxt(SAMPLE.replaceAll('\r\n', '\n')).punches).toHaveLength(2)
  })

  it('counts lines it cannot interpret', () => {
    const text = `${SAMPLE}garbage\r\n000003\t1\t000000002\tfede\t001\t001\t2026/13/01  09:00:00\r\n`
    const result = parseProsoftTxt(text)
    expect(result.punches).toHaveLength(2)
    expect(result.skippedLines).toBe(2)
  })

  it('falls back to the enrollment number when the name is blank', () => {
    const text = '000001\t1\t000000007\t        \t001\t001\t2026/08/26  09:00:00'
    expect(parseProsoftTxt(text).punches[0].name).toBe('#7')
  })
})

describe('decodeTxt', () => {
  it('decodes UTF-8', () => {
    expect(decodeTxt(new TextEncoder().encode('Muñoz').buffer)).toBe('Muñoz')
  })

  it('falls back to Windows-1252', () => {
    // "Muñoz" in Windows-1252: ñ is 0xF1, which is invalid UTF-8 here.
    const bytes = new Uint8Array([0x4d, 0x75, 0xf1, 0x6f, 0x7a])
    expect(decodeTxt(bytes.buffer)).toBe('Muñoz')
  })
})
