import { describe, expect, it } from 'vitest'
import { evaluate } from './calc'

describe('evaluate', () => {
  it('supports implicit multiplication between number and parentheses', () => {
    const result = evaluate('343*34(34)')
    expect(result).toBe(343 * 34 * 34)
  })

  it('supports implicit multiplication between adjacent parentheses', () => {
    const result = evaluate('(1+2)(3+4)')
    expect(result).toBe(21)
  })

  it('supports implicit multiplication between number and function', () => {
    const result = evaluate('2sqrt(9)')
    expect(result).toBe(6)
  })

  it('still allows optional leading equals sign', () => {
    const result = evaluate('= 1 + 2')
    expect(result).toBe(3)
  })
})
