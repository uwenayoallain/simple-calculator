import { useEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { evaluate } from '../lib/calc'
import { THEMES as PRESETS, getThemeById, type ThemeId } from '../themes'

const DEFAULT_THEME: ThemeId = 'tokyo-night'

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
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const t = localStorage.getItem('qc-theme') as ThemeId | null
    return (t && PRESETS.some(p => p.id === t)) ? t : DEFAULT_THEME
  })
  const activeTheme = useMemo(() => getThemeById(themeId), [themeId])
  const [pickerOpen, setPickerOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const trimmed = query.trimStart()
  const isCalc = trimmed.startsWith('=')
  const expr = isCalc ? trimmed.slice(1) : ''

  const { ok, result } = useMemo(() => {
    if (!isCalc) return { ok: false as const, result: undefined }
    const e = expr.trim()
    if (!e) return { ok: false as const, result: undefined }
    try {
      const v = evaluate(e)
      return { ok: true as const, result: v }
    } catch {
      // While typing, hide errors; only show once valid
      return { ok: false as const, result: undefined }
    }
  }, [expr, isCalc])

  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.focus()
  }, [])

  useEffect(() => {
    localStorage.setItem('qc-theme', themeId)
  }, [themeId])

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

  const rootStyle = useMemo(() => ({
    ['--qc-bg' as any]: activeTheme.vars.bg,
    ['--qc-fg' as any]: activeTheme.vars.fg,
    ['--qc-muted' as any]: activeTheme.vars.muted,
    ['--qc-accent' as any]: activeTheme.vars.accent,
    ['--qc-accent-2' as any]: activeTheme.vars.accent2,
    ['--qc-error' as any]: activeTheme.vars.error,
    ['--qc-surface' as any]: activeTheme.vars.surface,
    ['--qc-border' as any]: activeTheme.vars.border,
    ['--qc-bg-layered' as any]: activeTheme.layered,
  }) as React.CSSProperties, [activeTheme])

  return (
    <div className="qc-root" data-theme={themeId} style={rootStyle}>
      <div className="qc-theme-fixed" title="Theme">
        <button className="qc-theme-btn" onClick={() => setPickerOpen(true)}>
          Theme: {activeTheme.name}
        </button>
      </div>
      <div className={`qc-picker ${pickerOpen ? 'show' : ''}`}>
        <div className="qc-picker-backdrop" onClick={() => setPickerOpen(false)} />
        <div className="qc-picker-panel" role="dialog" aria-modal="true" aria-label="Theme picker" onClick={(e) => e.stopPropagation()}>
          <div className="qc-grid">
            {PRESETS.map((t) => (
              <div
                key={t.id}
                className={`qc-card ${themeId === t.id ? 'selected' : ''}`}
                onClick={() => { setThemeId(t.id); setPickerOpen(false) }}
                title={t.name}
              >
                <div className="qc-card-inner" style={{
                  ['--qc-fg' as any]: t.vars.fg,
                  ['--qc-muted' as any]: t.vars.muted,
                  ['--qc-border' as any]: t.vars.border,
                  ['--qc-surface' as any]: t.vars.surface,
                  color: t.vars.fg,
                  background: t.layered,
                  borderColor: t.vars.border,
                }}>
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
            ))}
          </div>
        </div>
      </div>
      <div className="qc-spotlight" aria-hidden={pickerOpen}>
        <input
          ref={inputRef}
          className="qc-input"
          placeholder="Type = 2+2 to calculate…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />

        {isCalc ? (
          <div className="qc-result">
            {ok && typeof result === 'number' ? (
              <>
                <div className="qc-result-value">{formatResult(result)}</div>
                <div className="qc-result-sub">Press Enter to copy</div>
              </>
            ) : (
              <div className="qc-result-hint">Live result appears here…</div>
            )}
          </div>
        ) : (
          <div className="qc-result qc-muted">
            <div className="qc-result-hint">Try things like: =sqrt(2)^2, =pi*3^2</div>
          </div>
        )}

        <div className={`qc-toast ${copied ? 'show' : ''}`}>Copied!</div>
      </div>
      <div className="qc-footer">QuickCalc • PowerToys/Raycast-style inline calculator</div>
    </div>
  )
}
