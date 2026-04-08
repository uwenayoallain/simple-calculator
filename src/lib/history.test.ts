import { describe, expect, it } from 'vitest'
import { createHistoryEntry, nextHistory } from './history'

describe('history helpers', () => {
  it('adds a valid entry to the front of history', () => {
    const next = nextHistory([], createHistoryEntry('1 + 2', 3, '3', 'entry-1', 100))

    expect(next).toHaveLength(1)
    expect(next[0]).toMatchObject({
      id: 'entry-1',
      query: '1 + 2',
      resultValue: 3,
      result: '3',
      savedAt: 100,
    })
  })

  it('deduplicates consecutive identical entries', () => {
    const existing = [createHistoryEntry('1 + 2', 3, '3', 'entry-1', 100)]

    const next = nextHistory(existing, createHistoryEntry('1 + 2', 3, '3', 'entry-2', 200))

    expect(next).toHaveLength(1)
    expect(next[0].id).toBe('entry-2')
    expect(next[0].savedAt).toBe(200)
  })

  it('keeps distinct entries even when the result matches', () => {
    const existing = [createHistoryEntry('1 + 2', 3, '3', 'entry-1', 100)]

    const next = nextHistory(existing, createHistoryEntry('6 / 2', 3, '3', 'entry-2', 200))

    expect(next).toHaveLength(2)
    expect(next[0].query).toBe('6 / 2')
    expect(next[1].query).toBe('1 + 2')
  })

  it('caps history at twelve entries', () => {
    const existing = Array.from({ length: 12 }, (_, index) =>
      createHistoryEntry(`q${index}`, index, String(index), `entry-${index}`, index),
    )

    const next = nextHistory(existing, createHistoryEntry('latest', 99, '99', 'entry-latest', 999))

    expect(next).toHaveLength(12)
    expect(next[0].query).toBe('latest')
    expect(next.at(-1)?.query).toBe('q10')
  })
})
