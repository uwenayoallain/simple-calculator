import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { evaluate } from '../lib/calc'
import gsap from 'gsap'

type Theme = 'dark' | 'light'
type ThemePreference = Theme | 'system'

const THEME_KEY = 'qc-theme'

const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark'
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

const getInitialTheme = (): ThemePreference => {
  if (typeof window === 'undefined') return 'system'
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  return 'system'
}

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
  } catch { }
}

function formatResult(n: number) {
  if (!isFinite(n)) return '∞'
  const abs = Math.abs(n)
  if ((abs !== 0 && (abs < 0.000001 || abs >= 1e9))) {
    return n.toExponential(8)
  }
  const asFixed = Math.round((n + Number.EPSILON) * 1e10) / 1e10
  return asFixed.toLocaleString(undefined, { maximumFractionDigits: 10 })
}

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const SystemIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="13" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)

export default function QuickCalc() {
  const [query, setQuery] = useState(() => readQueryFromUrl())
  const [copied, setCopied] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [themePreference, setThemePreference] = useState<ThemePreference>(getInitialTheme)
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(() => {
    const initial = getInitialTheme()
    return initial === 'system' ? getSystemTheme() : initial
  })
  const hasAnimatedTheme = useRef(false)
  const themeBtnRef = useRef<HTMLButtonElement>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const modalPanelRef = useRef<HTMLDivElement>(null)

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
      return { ok: false as const, result: undefined }
    }
  }, [expr, shouldEval])

  const hasResult = ok && typeof result === 'number'
  const formattedResult = hasResult ? formatResult(result) : ''
  const anyOverlayOpen = guideOpen
  const themeLabel = themePreference === 'system' ? 'System' : themePreference === 'dark' ? 'Dark' : 'Light'
  const nextThemeLabel = themePreference === 'system'
    ? (resolvedTheme === 'dark' ? 'Light' : 'Dark')
    : themePreference === 'dark'
      ? 'Light'
      : 'System'
  const iconState = themePreference === 'system' ? 'system' : resolvedTheme
  const describedBy = shouldEval
    ? (hasResult ? `${instructionsId} ${liveResultId} ${copyHintId}` : `${instructionsId} ${liveResultId}`)
    : `${instructionsId} ${fallbackHintId}`
  const liveResultProps = shouldEval ? { role: 'status' as const, 'aria-live': 'polite' as const, 'aria-atomic': true } : {}

  const closeAllOverlays = () => {
    setGuideOpen(false)
  }

  const toggleTheme = () => {
    setThemePreference(prev => {
      if (prev === 'system') return resolvedTheme === 'dark' ? 'light' : 'dark'
      if (prev === 'dark') return 'light'
      return 'system'
    })
  }

  useEffect(() => {
    const next = themePreference === 'system' ? getSystemTheme() : themePreference
    setResolvedTheme(next)
    localStorage.setItem(THEME_KEY, themePreference)
  }, [themePreference])

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
    document.documentElement.setAttribute('data-theme-preference', themePreference)
  }, [resolvedTheme, themePreference])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (themePreference !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      setResolvedTheme(media.matches ? 'dark' : 'light')
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [themePreference])

  useEffect(() => {
    if (!hasAnimatedTheme.current) {
      hasAnimatedTheme.current = true
      return
    }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.fromTo('.qc-root',
        { filter: 'saturate(0.9) brightness(0.96)' },
        { filter: 'saturate(1) brightness(1)', duration: 0.45, ease: 'power2.out', clearProps: 'filter' }
      )
      tl.fromTo('.qc-spotlight',
        { y: 8, opacity: 0.9 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', clearProps: 'transform,opacity' },
        '<0.05'
      )
      tl.fromTo('.qc-tool-btn',
        { y: -8, opacity: 0.45 },
        { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out', stagger: 0.05, clearProps: 'transform,opacity' },
        '<0.05'
      )
      if (themeBtnRef.current) {
        gsap.fromTo(themeBtnRef.current,
          { rotate: resolvedTheme === 'dark' ? -6 : 6, scale: 0.94 },
          { rotate: 0, scale: 1, duration: 0.35, ease: 'power3.out', clearProps: 'transform' }
        )
        gsap.fromTo(themeBtnRef.current.querySelector('.qc-theme-pulse'),
          { scale: 0.9, opacity: 0.35 },
          { scale: 1.15, opacity: 0, duration: 0.6, ease: 'power2.out' }
        )
      }
    })
    return () => ctx.revert()
  }, [resolvedTheme])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.qc-spotlight',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          delay: 0.1,
          clearProps: 'transform,opacity'
        }
      )
      gsap.from('.qc-footer', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        delay: 0.4
      })
      gsap.from('.qc-toolbar', {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
        delay: 0.5
      })
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (guideOpen) {
      gsap.to(modalRef.current, { opacity: 1, duration: 0.2, pointerEvents: 'auto' })
      gsap.fromTo(modalPanelRef.current,
        { y: 10, scale: 0.98 },
        { y: 0, scale: 1, duration: 0.3, ease: 'power3.out' }
      )
    } else {
      gsap.to(modalRef.current, { opacity: 0, duration: 0.15, pointerEvents: 'none' })
    }
  }, [guideOpen])

  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.focus()
  }, [])

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && guideOpen) {
        closeAllOverlays()
        e.preventDefault()
        e.stopPropagation()
      } else if (e.key === '?' && !guideOpen) {
        setGuideOpen(true)
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [guideOpen])

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
    const t = setTimeout(() => setCopied(false), 2200)
    return () => clearTimeout(t)
  }, [copied])

  const doCopy = async () => {
    if (!ok || typeof result !== 'number') return
    try {
      await navigator.clipboard.writeText(String(result))
      setCopied(true)
      containerRef.current?.classList.add('qc-copy-flash')
      setTimeout(() => {
        containerRef.current?.classList.remove('qc-copy-flash')
      }, 400)
    } catch { }
  }

  const onKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (anyOverlayOpen) { closeAllOverlays(); e.preventDefault(); return }
      setQuery('')
      e.preventDefault()
      return
    }
    if (e.key === 'Enter') {
      await doCopy()
    }
  }

  return (
    <div className="qc-root">
      <div className="qc-noise" aria-hidden="true" />

      <div className="qc-toolbar">
        <button
          className="qc-tool-btn qc-theme-btn"
          ref={themeBtnRef}
          onClick={toggleTheme}
          aria-label={`Theme: ${themeLabel}. Switch to ${nextThemeLabel} mode`}
        >
          <span className="qc-theme-pulse" aria-hidden="true" />
          <span className="qc-tool-icon qc-icon-swap" aria-hidden="true">
            <span className={`qc-theme-icon qc-icon-sun ${iconState === 'light' ? 'is-active' : ''}`}>
              <SunIcon />
            </span>
            <span className={`qc-theme-icon qc-icon-moon ${iconState === 'dark' ? 'is-active' : ''}`}>
              <MoonIcon />
            </span>
            <span className={`qc-theme-icon qc-icon-system ${iconState === 'system' ? 'is-active' : ''}`}>
              <SystemIcon />
            </span>
          </span>
          <span className="qc-tool-label">{themeLabel}</span>
        </button>
        <button
          className="qc-tool-btn qc-tool-btn-icon"
          onClick={() => setGuideOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={guideOpen}
          aria-controls={guideId}
          aria-label="Help"
        >
          <span aria-hidden="true">?</span>
        </button>
      </div>

      <div className="qc-modal" ref={modalRef}>
        <div className="qc-picker-backdrop" onClick={closeAllOverlays} />
        <div
          className="qc-modal-panel"
          ref={modalPanelRef}
          id={guideId}
          role="dialog"
          aria-modal="true"
          aria-labelledby="qc-guide-title"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="qc-modal-close-icon" onClick={closeAllOverlays} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="qc-modal-header">
            <h2 id="qc-guide-title">Quick Reference</h2>
            <p>Press <kbd>?</kbd> to toggle</p>
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
                <li><code>sqrt</code> <code>cbrt</code></li>
                <li><code>sin</code> <code>cos</code> <code>tan</code></li>
                <li><code>log</code> <code>ln</code> <code>exp</code></li>
                <li><code>abs</code> <code>floor</code> <code>ceil</code></li>
              </ul>
            </div>
            <div>
              <h3>Examples</h3>
              <ul>
                <li><code>2pi</code> <code>3(4+5)</code></li>
                <li><code>deg(pi)</code></li>
                <li><code>sqrt(2)^2</code></li>
                <li><code>45% of 120</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <main className="qc-main" aria-hidden={anyOverlayOpen}>
        <div className="qc-spotlight" ref={containerRef}>
          <label className="qc-sr-only" htmlFor={inputId}>Calculator</label>
          <div className="qc-input-wrapper">
            <input
              ref={inputRef}
              id={inputId}
              className="qc-input"
              placeholder="Type to calculate..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-describedby={describedBy}
              autoFocus
            />
          </div>

          <div className={`qc-result-section ${shouldEval && hasResult ? 'show' : ''}`}>
            <div className="qc-result-inner">
              <div className="qc-divider" aria-hidden="true" />
              <div className="qc-result" {...liveResultProps}>
                <div className="qc-result-value" id={liveResultId} ref={resultRef}>{formattedResult}</div>
                <button className="qc-result-sub" id={copyHintId} onClick={doCopy} type="button">Copy</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className={`qc-toast ${copied ? 'show' : ''}`} role="status" aria-live="polite">
        <div className="qc-toast-icon" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div className="qc-toast-text">
          <span className="qc-toast-title">Copied</span>
          <span className="qc-toast-sub">Result saved to clipboard</span>
        </div>
        <div className="qc-toast-bar" aria-hidden="true" />
      </div>

      <footer className="qc-footer">
        <span className="qc-footer-handle">@uwenayoallain</span>
        <span aria-hidden="true">·</span>
        <a className="qc-footer-link" href="https://uwe.rw" target="_blank" rel="noreferrer">uwe.rw</a>
      </footer>
    </div>
  )
}
