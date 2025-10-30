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

  it('supports percent expressions with natural language of', () => {
    expect(evaluate('45% of 120')).toBeCloseTo(54)
  })

  it('supports additional constants', () => {
    const tau = evaluate('tau')
    expect(tau).toBeCloseTo(Math.PI * 2)
    const phi = evaluate('phi')
    expect(phi).toBeCloseTo((1 + Math.sqrt(5)) / 2)
  })

  it('supports log2 and rad/deg helpers', () => {
    expect(evaluate('log2(1024)')).toBe(10)
    expect(evaluate('deg(pi)')).toBeCloseTo(180)
    expect(evaluate('rad(90)')).toBeCloseTo(Math.PI / 2)
  })

  it('still allows optional leading equals sign', () => {
    const result = evaluate('= 1 + 2')
    expect(result).toBe(3)
  })
})
