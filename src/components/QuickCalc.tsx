import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { evaluate } from '../lib/calc'
import { THEMES as PRESETS, getThemeById, type ThemeId } from '../themes'

type FormatMode = 'auto' | 'plain' | 'fixed2' | 'fixed4' | 'scientific'

const FORMAT_OPTIONS: Array<{ id: FormatMode; label: string; hint: string }> = [
  { id: 'auto', label: 'Auto', hint: 'Smart significant digits with scientific when needed' },
  { id: 'plain', label: 'Plain', hint: 'Raw number without grouping' },
  { id: 'fixed2', label: 'Fixed 2', hint: 'Two decimal places' },
  { id: 'fixed4', label: 'Fixed 4', hint: 'Four decimal places' },
  { id: 'scientific', label: 'Scientific', hint: 'Scientific notation with 8 digits' },
]

const prefersLightPreset = () => {
  if (typeof window === 'undefined') return false
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
  } catch {
    return false
  }
}

const DEFAULT_THEME: ThemeId = prefersLightPreset() ? 'catppuccin-latte' : 'rose-pine'
const FORMAT_KEY = 'qc-format'

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

function getInitialFormat(): FormatMode {
  if (typeof window === 'undefined') return 'auto'
  const stored = window.localStorage.getItem(FORMAT_KEY) as FormatMode | null
  return stored && FORMAT_OPTIONS.some(opt => opt.id === stored) ? stored : 'auto'
}

function formatResult(n: number, mode: FormatMode) {
  if (!isFinite(n)) return '∞'
  switch (mode) {
    case 'plain':
      return `${n}`
    case 'fixed2':
      return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    case 'fixed4':
      return n.toLocaleString(undefined, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      })
    case 'scientific':
      return n.toExponential(8)
    case 'auto':
    default: {
      // Show up to 10 significant digits, but with grouping
      const abs = Math.abs(n)
      if ((abs !== 0 && (abs < 0.000001 || abs >= 1e9))) {
        return n.toExponential(8)
      }
      const asFixed = Math.round((n + Number.EPSILON) * 1e10) / 1e10
      return asFixed.toLocaleString(undefined, { maximumFractionDigits: 10 })
    }
  }
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
  const [formatOpen, setFormatOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [formatMode, setFormatMode] = useState<FormatMode>(() => getInitialFormat())
  const inputRef = useRef<HTMLInputElement>(null)
  const pickerId = 'qc-theme-dialog'
  const themeTitleId = 'qc-theme-title'
  const themeDescriptionId = 'qc-theme-description'
  const formatId = 'qc-format-dialog'
  const guideId = 'qc-guide-dialog'
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
  const formattedResult = hasResult ? formatResult(result, formatMode) : ''
  const formatLabel = FORMAT_OPTIONS.find(opt => opt.id === formatMode)?.label ?? 'Auto'
  const anyOverlayOpen = pickerOpen || formatOpen || guideOpen
  const describedBy = shouldEval
    ? (hasResult ? `${instructionsId} ${liveResultId} ${copyHintId}` : `${instructionsId} ${liveResultId}`)
    : `${instructionsId} ${fallbackHintId}`
  const liveResultProps = shouldEval ? { role: 'status' as const, 'aria-live': 'polite' as const, 'aria-atomic': true } : {}

  const closeAllOverlays = () => {
    setPickerOpen(false)
    setFormatOpen(false)
    setGuideOpen(false)
  }

  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.focus()
  }, [])

  useEffect(() => {
    localStorage.setItem('qc-theme', themeId)
  }, [themeId])

  useEffect(() => {
    localStorage.setItem(FORMAT_KEY, formatMode)
  }, [formatMode])

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

  // Global Escape / help toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (pickerOpen || formatOpen || guideOpen)) {
        closeAllOverlays()
        e.preventDefault()
        e.stopPropagation()
      } else if (e.key === '?' && !pickerOpen && !formatOpen && !guideOpen) {
        setGuideOpen(true)
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [pickerOpen, formatOpen, guideOpen])

  // Lock background scroll when picker open
  useEffect(() => {
    const body = document.body
    const prev = body.style.overflow
    if (anyOverlayOpen) {
      body.style.overflow = 'hidden'
    }
    return () => {
      body.style.overflow = prev
    }
  }, [anyOverlayOpen])

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1200)
    return () => clearTimeout(t)
  }, [copied])

  const onKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (anyOverlayOpen) { closeAllOverlays(); e.preventDefault(); return }
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
      <div className="qc-toolbar" title="Utilities">
        <button
          className="qc-tool-btn"
          onClick={() => {
            setPickerOpen(true)
            setFormatOpen(false)
            setGuideOpen(false)
          }}
          aria-haspopup="dialog"
          aria-expanded={pickerOpen}
          aria-controls={pickerId}
          aria-label={`Change appearance. Current style ${activeTheme.name}`}
        >
          {activeTheme.name}
        </button>
        <button
          className="qc-tool-btn"
          onClick={() => {
            setFormatOpen(true)
            setPickerOpen(false)
            setGuideOpen(false)
          }}
          aria-haspopup="dialog"
          aria-expanded={formatOpen}
          aria-controls={formatId}
          aria-label={`Change result formatting. Current mode ${formatLabel}`}
        >
          Format: {formatLabel}
        </button>
        <button
          className="qc-tool-btn"
          onClick={() => {
            setGuideOpen(true)
            setPickerOpen(false)
            setFormatOpen(false)
          }}
          aria-haspopup="dialog"
          aria-expanded={guideOpen}
          aria-controls={guideId}
          aria-label="Show keyboard cheatsheet"
        >
          ?
        </button>
      </div>
      <div className={`qc-picker ${pickerOpen ? 'show' : ''}`}>
        <div className="qc-picker-backdrop" onClick={closeAllOverlays} />
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
      <div className={`qc-modal ${formatOpen ? 'show' : ''}`}>
        <div className="qc-picker-backdrop" onClick={closeAllOverlays} />
        <div
          className="qc-modal-panel"
          id={formatId}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qc-format-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="qc-modal-header">
            <h2 id="qc-format-title">Result formatting</h2>
            <p>Choose how results are displayed. Press Enter to copy still uses the precise value.</p>
          </div>
          <ul className="qc-format-list" role="list">
            {FORMAT_OPTIONS.map(option => (
              <li key={option.id}>
                <button
                  className={`qc-format-item ${formatMode === option.id ? 'selected' : ''}`}
                  onClick={() => {
                    setFormatMode(option.id)
                    closeAllOverlays()
                  }}
                >
                  <span className="qc-format-name">{option.label}</span>
                  <span className="qc-format-hint">{option.hint}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={`qc-modal ${guideOpen ? 'show' : ''}`}>
        <div className="qc-picker-backdrop" onClick={closeAllOverlays} />
        <div
          className="qc-modal-panel"
          id={guideId}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qc-guide-title"
          aria-haspopup="dialog"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="qc-modal-header">
            <h2 id="qc-guide-title">Keyboard & functions</h2>
            <p>Type naturally; multiply with spaces or implicit rules like <code>2pi</code> or <code>3(4+5)</code>. Press <kbd>?</kbd> anytime to open this list.</p>
          </div>
          <div className="qc-guide-grid">
            <div>
              <h3>Constants</h3>
              <ul>
                <li><code>pi</code> ≈ 3.14159</li>
                <li><code>tau</code> = 2π</li>
                <li><code>e</code> ≈ 2.71828</li>
                <li><code>phi</code> ≈ 1.61803</li>
              </ul>
            </div>
            <div>
              <h3>Functions</h3>
              <ul>
                <li><code>sqrt(x)</code>, <code>cbrt(x)</code></li>
                <li><code>sin</code>, <code>cos</code>, <code>tan</code>, <code>asin</code>, <code>acos</code>, <code>atan</code></li>
                <li><code>sinh</code>, <code>cosh</code>, <code>tanh</code>, <code>deg(x)</code>, <code>rad(x)</code></li>
                <li><code>log(x)</code>, <code>log2(x)</code>, <code>ln(x)</code>, <code>exp(x)</code></li>
                <li><code>abs</code>, <code>floor</code>, <code>ceil</code>, <code>round</code></li>
              </ul>
            </div>
            <div>
              <h3>Tips</h3>
              <ul>
                <li><code>2pi</code>, <code>3(4+5)</code>, <code>1.2tau</code></li>
                <li><code>deg(pi)</code> → 180, <code>rad(90)</code> → π/2</li>
                <li><code>sqrt(2)^2</code>, <code>log2(1024)</code>, <code>45% of 120</code></li>
                <li>Enter &nbsp;→&nbsp; copy result</li>
              </ul>
            </div>
          </div>
          <button className="qc-modal-close" onClick={closeAllOverlays}>Close</button>
        </div>
      </div>
      <main className="qc-main" aria-hidden={anyOverlayOpen}>
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
                <div className="qc-result-value" id={liveResultId}>{formattedResult}</div>
                <div className="qc-result-sub" id={copyHintId}>Press Enter to copy</div>
              </>
            ) : (
              <div className="qc-result-hint" id={liveResultId}>Live result appears here…</div>
            )}
          </div>
        ) : (
          <div className="qc-result qc-muted">
            <div className="qc-result-hint" id={fallbackHintId}>Try things like: sqrt(2)^2, tau/4, deg(pi), 45% of 120</div>
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
