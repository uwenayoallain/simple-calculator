import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import gsap from 'gsap'
import { evaluate } from '../lib/calc'
import {
  createHistoryEntry,
  nextHistory,
  readStoredHistory,
  type HistoryEntry,
  writeStoredHistory,
} from '../lib/history'

type Theme = 'dark' | 'light'
type ThemePreference = Theme | 'system'
type ToastState = {
  title: string
  description: string
}

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
    return url.searchParams.get('q') ?? ''
  } catch {
    return ''
  }
}

const writeQueryToUrl = (value: string) => {
  if (typeof window === 'undefined') return
  try {
    const url = new URL(window.location.href)
    if (!value) url.searchParams.delete('q')
    else url.searchParams.set('q', value)

    const next = `${url.pathname}${url.search}${url.hash}`
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
    if (next !== current) {
      window.history.replaceState(window.history.state, '', next)
    }
  } catch {
    // Ignore URL sync failures and keep local state authoritative.
  }
}

function formatResult(value: number) {
  if (!isFinite(value)) return '∞'
  const abs = Math.abs(value)
  if (abs !== 0 && (abs < 0.000001 || abs >= 1e9)) {
    return value.toExponential(8)
  }
  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10
  return rounded.toLocaleString(undefined, { maximumFractionDigits: 10 })
}

function isStandaloneMode() {
  if (typeof window === 'undefined') return false
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true
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

const InstallIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12" />
    <path d="m7 10 5 5 5-5" />
    <path d="M5 21h14" />
  </svg>
)

export default function QuickCalc() {
  const [query, setQuery] = useState(() => readQueryFromUrl())
  const [guideOpen, setGuideOpen] = useState(false)
  const [themePreference, setThemePreference] = useState<ThemePreference>(getInitialTheme)
  const [systemTheme, setSystemTheme] = useState<Theme>(() => getSystemTheme())
  const [history, setHistory] = useState<HistoryEntry[]>(() => readStoredHistory())
  const [toast, setToast] = useState<ToastState | null>(null)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(() => isStandaloneMode())

  const hasAnimatedTheme = useRef(false)
  const themeBtnRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const modalPanelRef = useRef<HTMLDivElement>(null)

  const guideId = 'qc-guide-dialog'
  const inputId = 'qc-input'
  const instructionsId = 'qc-input-instructions'
  const resultId = 'qc-live-result'

  const trimmed = query.trim()
  const expr = trimmed.startsWith('=') ? trimmed.slice(1).trim() : trimmed
  const shouldEval = expr.length > 0
  const resolvedTheme = themePreference === 'system' ? systemTheme : themePreference

  const { ok, result } = useMemo(() => {
    if (!shouldEval) return { ok: false as const, result: undefined }
    try {
      return { ok: true as const, result: evaluate(expr) }
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
  const canInstall = !installed && installPrompt !== null
  const installHint = installed
    ? 'Already installed on this device.'
    : canInstall
      ? 'Use the install button when available.'
      : 'Use the browser install menu or Add to Home Screen.'
  const describedBy = `${instructionsId}${hasResult ? ` ${resultId}` : ''}`
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

  const flashSpotlight = () => {
    containerRef.current?.classList.add('qc-copy-flash')
    window.setTimeout(() => {
      containerRef.current?.classList.remove('qc-copy-flash')
    }, 400)
  }

  const showToast = (title: string, description: string) => {
    setToast({ title, description })
  }

  const saveCurrentToHistory = () => {
    if (!hasResult || typeof result !== 'number') return
    setHistory(prev => nextHistory(prev, createHistoryEntry(query, result, formattedResult)))
    showToast('Saved', 'Calculation added to history')
    flashSpotlight()
  }

  const handleSelectHistory = (entry: HistoryEntry) => {
    setQuery(entry.query)
    inputRef.current?.focus()
  }

  const handleClearHistory = () => {
    if (!history.length) return
    setHistory([])
    showToast('History cleared', 'Saved calculations removed')
  }

  const doCopy = async () => {
    if (!hasResult || typeof result !== 'number') return
    try {
      await navigator.clipboard.writeText(String(result))
      showToast('Copied', 'Result saved to clipboard')
      flashSpotlight()
    } catch {
      showToast('Copy failed', 'Clipboard access is unavailable')
    }
  }

  const handleInstall = async () => {
    if (!installPrompt) {
      setGuideOpen(true)
      return
    }

    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') {
      showToast('Installing', 'Calculator is being added to your device')
    }
    setInstallPrompt(null)
  }

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themePreference)
  }, [themePreference])

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
    document.documentElement.setAttribute('data-theme-preference', themePreference)
  }, [resolvedTheme, themePreference])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => {
      setSystemTheme(media.matches ? 'dark' : 'light')
    }
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!hasAnimatedTheme.current) {
      hasAnimatedTheme.current = true
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline()
      tl.fromTo(
        '.qc-root',
        { filter: 'saturate(0.9) brightness(0.96)' },
        { filter: 'saturate(1) brightness(1)', duration: 0.45, ease: 'power2.out', clearProps: 'filter' },
      )
      tl.fromTo(
        '.qc-spotlight',
        { y: 8, opacity: 0.9 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', clearProps: 'transform,opacity' },
        '<0.05',
      )
      tl.fromTo(
        '.qc-tool-btn',
        { y: -8, opacity: 0.45 },
        { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out', stagger: 0.05, clearProps: 'transform,opacity' },
        '<0.05',
      )
      if (themeBtnRef.current) {
        gsap.fromTo(
          themeBtnRef.current,
          { rotate: resolvedTheme === 'dark' ? -6 : 6, scale: 0.94 },
          { rotate: 0, scale: 1, duration: 0.35, ease: 'power3.out', clearProps: 'transform' },
        )
        gsap.fromTo(
          themeBtnRef.current.querySelector('.qc-theme-pulse'),
          { scale: 0.9, opacity: 0.35 },
          { scale: 1.15, opacity: 0, duration: 0.6, ease: 'power2.out' },
        )
      }
    })

    return () => ctx.revert()
  }, [resolvedTheme])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.qc-spotlight',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.1, clearProps: 'transform,opacity' },
      )
      gsap.from('.qc-footer', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        delay: 0.4,
      })
      gsap.from('.qc-toolbar', {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
        delay: 0.5,
      })
    })

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (guideOpen) {
      gsap.to(modalRef.current, { opacity: 1, duration: 0.2, pointerEvents: 'auto' })
      gsap.fromTo(
        modalPanelRef.current,
        { y: 10, scale: 0.98 },
        { y: 0, scale: 1, duration: 0.3, ease: 'power3.out' },
      )
    } else {
      gsap.to(modalRef.current, { opacity: 0, duration: 0.15, pointerEvents: 'none' })
    }
  }, [guideOpen])

  useEffect(() => {
    inputRef.current?.focus()
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
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && guideOpen) {
        setGuideOpen(false)
        event.preventDefault()
        event.stopPropagation()
      } else if (event.key === '?' && !guideOpen) {
        setGuideOpen(true)
        event.preventDefault()
        event.stopPropagation()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [guideOpen])

  useEffect(() => {
    const body = document.body
    const prev = body.style.overflow
    if (anyOverlayOpen) body.style.overflow = 'hidden'
    return () => {
      body.style.overflow = prev
    }
  }, [anyOverlayOpen])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  useEffect(() => {
    writeStoredHistory(history)
  }, [history])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const syncInstalled = () => {
      setInstalled(isStandaloneMode())
    }

    const displayMode = window.matchMedia('(display-mode: standalone)')
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstallPrompt(null)
      syncInstalled()
      setToast({
        title: 'Installed',
        description: 'Calculator added to your device',
      })
    }

    syncInstalled()
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    displayMode.addEventListener('change', syncInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      displayMode.removeEventListener('change', syncInstalled)
    }
  }, [])

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      if (anyOverlayOpen) {
        closeAllOverlays()
        event.preventDefault()
        return
      }
      setQuery('')
      event.preventDefault()
      return
    }

    if (event.key === 'Enter') {
      saveCurrentToHistory()
      event.preventDefault()
    }
  }

  return (
    <div className="qc-root">
      <div className="qc-noise" aria-hidden="true" />

      <div className="qc-toolbar">
        {canInstall ? (
          <button
            className="qc-tool-btn qc-install-btn"
            onClick={() => void handleInstall()}
            aria-label="Install app"
            title="Install app"
          >
            <span className="qc-tool-icon" aria-hidden="true">
              <InstallIcon />
            </span>
          </button>
        ) : null}
        <button
          className="qc-tool-btn qc-theme-btn"
          ref={themeBtnRef}
          onClick={toggleTheme}
          aria-label={`Theme: ${themeLabel}. Switch to ${nextThemeLabel} mode`}
          title={`Theme: ${themeLabel}`}
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
        </button>
        <button
          className="qc-tool-btn qc-tool-btn-icon"
          onClick={() => setGuideOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={guideOpen}
          aria-controls={guideId}
          aria-label="Help"
          title="Help"
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
          onClick={(event) => event.stopPropagation()}
        >
          <button className="qc-modal-close-icon" onClick={closeAllOverlays} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="qc-modal-header">
            <h2 id="qc-guide-title">Quick Reference</h2>
            <p>Press <kbd>?</kbd> to toggle</p>
          </div>
          <div className="qc-guide-grid">
            <div>
              <h3>Flow</h3>
              <ul>
                <li>Paste formatted numbers like <code>1,000,000</code></li>
                <li>Press <kbd>Enter</kbd> to save</li>
                <li>Click a saved row to reuse it</li>
                <li>Use <code>Copy</code> for the raw result</li>
              </ul>
            </div>
            <div>
              <h3>Examples</h3>
              <ul>
                <li><code>1,234.56 + 7,890.01</code></li>
                <li><code>2(1,000)</code></li>
                <li><code>45% of 120,000</code></li>
                <li><code>sqrt(10,000)</code></li>
              </ul>
            </div>
            <div>
              <h3>Install</h3>
              <ul>
                <li>{installHint}</li>
                <li>Chrome or Edge: install button or browser install menu</li>
                <li>Safari on iPhone or iPad: Share, then Add to Home Screen</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <main className="qc-main" aria-hidden={anyOverlayOpen}>
        <div className="qc-spotlight" ref={containerRef}>
          <label className="qc-sr-only" htmlFor={inputId}>Calculator</label>
          <p className="qc-sr-only" id={instructionsId}>
            Type or paste a calculation. Press Enter to save valid results into history.
          </p>

          <div className="qc-input-wrapper">
            <input
              ref={inputRef}
              id={inputId}
              className="qc-input"
              placeholder="Type or paste to calculate..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
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
                <div className="qc-result-value" id={resultId}>{formattedResult}</div>
                <button className="qc-result-sub" onClick={() => void doCopy()} type="button">Copy</button>
              </div>
            </div>
          </div>

          {history.length ? (
            <div className="qc-history-shell">
              <div className="qc-divider" aria-hidden="true" />
              <div className="qc-history-header">
                <button
                  className="qc-history-clear"
                  type="button"
                  onClick={handleClearHistory}
                >
                  Clear
                </button>
              </div>
              <div className="qc-history-list" role="list" aria-label="Calculation history">
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    className="qc-history-item"
                    type="button"
                    onClick={() => handleSelectHistory(entry)}
                  >
                    <span className="qc-history-query">{entry.query}</span>
                    <span className="qc-history-result">{entry.result}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <div className={`qc-toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
        <div className="qc-toast-icon" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="qc-toast-text">
          <span className="qc-toast-title">{toast?.title}</span>
          <span className="qc-toast-sub">{toast?.description}</span>
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
