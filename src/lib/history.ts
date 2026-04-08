export const HISTORY_LIMIT = 12
export const HISTORY_KEY = 'qc-history'

export type HistoryEntry = {
  id: string
  query: string
  result: string
  resultValue: number
  savedAt: number
}

export function createHistoryEntry(
  query: string,
  resultValue: number,
  result: string,
  id = createHistoryId(),
  savedAt = Date.now(),
): HistoryEntry {
  return {
    id,
    query,
    result,
    resultValue,
    savedAt,
  }
}

export function nextHistory(
  current: HistoryEntry[],
  entry: HistoryEntry,
  limit = HISTORY_LIMIT,
): HistoryEntry[] {
  const trimmedQuery = entry.query.trim()
  const normalizedEntry = { ...entry, query: trimmedQuery }
  const [head] = current

  const withoutHead =
    head && head.query === trimmedQuery && head.resultValue === entry.resultValue
      ? current.slice(1)
      : current

  return [normalizedEntry, ...withoutHead].slice(0, limit)
}

export function readStoredHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isHistoryEntry).slice(0, HISTORY_LIMIT)
  } catch {
    return []
  }
}

export function writeStoredHistory(entries: HistoryEntry[]) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries))
  } catch {
    // Ignore storage failures and keep the UI responsive.
  }
}

function createHistoryId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `history-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== 'object') return false

  const entry = value as Record<string, unknown>

  return (
    typeof entry.id === 'string' &&
    typeof entry.query === 'string' &&
    typeof entry.result === 'string' &&
    typeof entry.resultValue === 'number' &&
    typeof entry.savedAt === 'number'
  )
}
