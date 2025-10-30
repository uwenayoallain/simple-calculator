import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { evaluate } from '../lib/calc'
import { THEMES as PRESETS, getThemeById, type ThemeId } from '../themes'

const DEFAULT_THEME: ThemeId = 'tokyo-night'

const readQueryFromUrl = () => {
  if (typeof window === 'undefined') return ''
  try {
    const url = new URL(window.location.href)
    const value = url.searchParams.get('q')
    return value ?? ''
  } catch {
    return ''
  }
}

const writeQueryToUrl = (value: string) => {
  if (typeof window === 'undefined') return
  try {
    const url = new URL(window.location.href)
    if (!value) {
      url.searchParams.delete('q')
    } else {
      url.searchParams.set('q', value)
    }
    const next = `${url.pathname}${url.search}${url.hash}`
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (next !== current) {
      window.history.replaceState(window.history.state, '', next)
    }
  } catch {
    // ignore URL issues (e.g., malformed location)
  }
}

function formatResult(n: number) {
  if (!isFinite(n)) return '∞'
  // Show up to 10 significant digits, but with grouping
  const abs = Math.abs(n)
  if ((abs !== 0 && (abs < 0.000001 || abs >= 1e9))) {
    return n.toExponential(8)
  }
  const asFixed = Math.round((n + Number.EPSILON) * 1e10) / 1e10
  return asFixed.toLocaleString(undefined, { maximumFractionDigits: 10 })
}

export default function QuickCalc() {
  const [query, setQuery] = useState(() => readQueryFromUrl())
  const [copied, setCopied] = useState(false)
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const t = localStorage.getItem('qc-theme') as ThemeId | null
    return (t && PRESETS.some(p => p.id === t)) ? t : DEFAULT_THEME
  })
  const activeTheme = useMemo(() => getThemeById(themeId), [themeId])
  const [pickerOpen, setPickerOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const pickerId = 'qc-theme-dialog'
  const themeTitleId = 'qc-theme-title'
  const themeDescriptionId = 'qc-theme-description'
  const inputId = 'qc-input'
  const instructionsId = 'qc-input-instructions'
  const liveResultId = 'qc-live-result'
  const fallbackHintId = 'qc-fallback-hint'
  const copyHintId = 'qc-copy-hint'

  const trimmed = query.trim()
  const expr = trimmed.startsWith('=') ? trimmed.slice(1).trim() : trimmed
  const shouldEval = expr.length > 0

  const { ok, result } = useMemo(() => {
    if (!shouldEval) return { ok: false as const, result: undefined }
    try {
      const v = evaluate(expr)
      return { ok: true as const, result: v }
    } catch {
      // While typing, hide errors; only show once valid
      return { ok: false as const, result: undefined }
    }
  }, [expr, shouldEval])

  const hasResult = ok && typeof result === 'number'
  const describedBy = shouldEval
    ? (hasResult ? `${instructionsId} ${liveResultId} ${copyHintId}` : `${instructionsId} ${liveResultId}`)
    : `${instructionsId} ${fallbackHintId}`
  const liveResultProps = shouldEval ? { role: 'status' as const, 'aria-live': 'polite' as const, 'aria-atomic': true } : {}

  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.focus()
  }, [])

  useEffect(() => {
    localStorage.setItem('qc-theme', themeId)
  }, [themeId])

  useEffect(() => {
    writeQueryToUrl(query)
  }, [query])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onPop = () => {
      const next = readQueryFromUrl()
      setQuery(prev => (prev === next ? prev : next))
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Global Escape to close picker
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pickerOpen) {
        setPickerOpen(false)
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [pickerOpen])

  // Lock background scroll when picker open
  useEffect(() => {
    const body = document.body
    const prev = body.style.overflow
    if (pickerOpen) {
      body.style.overflow = 'hidden'
    }
    return () => {
      body.style.overflow = prev
    }
  }, [pickerOpen])

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1200)
    return () => clearTimeout(t)
  }, [copied])

  const onKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (pickerOpen) { setPickerOpen(false); e.preventDefault(); return }
      setQuery('')
      e.preventDefault()
      return
    }
    if (e.key === 'Enter' && ok && typeof result === 'number') {
      try {
        await navigator.clipboard.writeText(String(result))
        setCopied(true)
      } catch {
        // ignore
      }
    }
  }

  const selectTheme = (id: ThemeId) => {
    setThemeId(id)
    setPickerOpen(false)
  }

  const rootStyle = useMemo(() => ({
    '--qc-bg': activeTheme.vars.bg,
    '--qc-fg': activeTheme.vars.fg,
    '--qc-muted': activeTheme.vars.muted,
    '--qc-accent': activeTheme.vars.accent,
    '--qc-accent-2': activeTheme.vars.accent2,
    '--qc-error': activeTheme.vars.error,
    '--qc-surface': activeTheme.vars.surface,
    '--qc-border': activeTheme.vars.border,
    '--qc-bg-layered': activeTheme.layered,
  }) as React.CSSProperties, [activeTheme])

  return (
    <div className="qc-root" data-theme={themeId} style={rootStyle}>
      <div className="qc-theme-fixed" title="Change appearance">
        <button
          className="qc-theme-btn"
          onClick={() => setPickerOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={pickerOpen}
          aria-controls={pickerId}
          aria-label={`Change appearance. Current style ${activeTheme.name}`}
        >
          {activeTheme.name}
        </button>
      </div>
      <div className={`qc-picker ${pickerOpen ? 'show' : ''}`}>
        <div className="qc-picker-backdrop" onClick={() => setPickerOpen(false)} />
        <div
          className="qc-picker-panel"
          id={pickerId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={themeTitleId}
          aria-describedby={themeDescriptionId}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="qc-picker-header">
            <h2 className="qc-picker-title" id={themeTitleId}>Choose a style</h2>
            <p className="qc-picker-sub" id={themeDescriptionId}>Switch between curated looks to match your desktop or productivity stack.</p>
          </div>
          <ul className="qc-grid" role="list">
            {PRESETS.map((t) => (
              <li key={t.id}>
                <div
                  className={`qc-card ${themeId === t.id ? 'selected' : ''}`}
                  onClick={() => selectTheme(t.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      selectTheme(t.id)
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={themeId === t.id}
                  title={t.name}
                >
                  <div className="qc-card-inner" style={{
                    '--qc-fg': t.vars.fg,
                    '--qc-muted': t.vars.muted,
                    '--qc-border': t.vars.border,
                    '--qc-surface': t.vars.surface,
                    color: t.vars.fg,
                    background: t.layered,
                    borderColor: t.vars.border,
                  } as React.CSSProperties}>
                    <div className="qc-mini" style={{ background: t.vars.surface, borderColor: t.vars.border }}>
                      <div className="qc-mini-input">= 2+2</div>
                      <div className="qc-mini-result" style={{
                        background: `linear-gradient(135deg, ${t.vars.accent}, ${t.vars.accent2})`,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        color: 'transparent',
                        textShadow: `0 0 12px ${t.vars.accent}55, 0 0 18px ${t.vars.accent2}44`,
                      }}>4</div>
                    </div>
                    <div className="qc-swatch-row">
                      <div className="qc-swatch" style={{ background: t.vars.accent }} />
                      <div className="qc-swatch" style={{ background: t.vars.accent2 }} />
                      <div className="qc-swatch" style={{ background: t.vars.muted }} />
                      <div className="qc-swatch" style={{ background: t.vars.fg }} />
                    </div>
                    <div className="qc-card-title">{t.name}</div>
                    <div className="qc-card-sub">{t.id}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <main className="qc-main" aria-hidden={pickerOpen}>
        <div className="qc-spotlight">
          <label className="qc-sr-only" htmlFor={inputId}>Inline calculator input</label>
          <p className="qc-sr-only" id={instructionsId}>Type a math expression like two plus two. Press Enter to copy the live answer to your clipboard.</p>
          <input
            ref={inputRef}
            id={inputId}
            className="qc-input"
            placeholder="Type 2+2 to calculate…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-describedby={describedBy}
          />

        {shouldEval ? (
          <div className="qc-result" {...liveResultProps}>
            {hasResult ? (
              <>
                <div className="qc-result-value" id={liveResultId}>{formatResult(result)}</div>
                <div className="qc-result-sub" id={copyHintId}>Press Enter to copy</div>
              </>
            ) : (
              <div className="qc-result-hint" id={liveResultId}>Live result appears here…</div>
            )}
          </div>
        ) : (
          <div className="qc-result qc-muted">
            <div className="qc-result-hint" id={fallbackHintId}>Try things like: sqrt(2)^2, pi*3^2</div>
          </div>
        )}

          <div className={`qc-toast ${copied ? 'show' : ''}`}>Copied!</div>
        </div>
      </main>
      <footer className="qc-footer">
        <span className="qc-footer-handle">@uwenayoallain</span>
        <span aria-hidden="true">|</span>
        <a className="qc-footer-link" href="https://uwe.rw" target="_blank" rel="noreferrer">uwe.rw</a>
      </footer>
    </div>
  )
}
