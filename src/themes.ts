export type ThemeId =
  | 'dracula'
  | 'one-dark'
  | 'tokyo-night'
  | 'github-dark'
  | 'github-light'
  | 'catppuccin-mocha'
  | 'catppuccin-latte'
  | 'rose-pine'
  | 'nord'
  | 'synthwave-84'
  | 'night-owl'
  | 'gruvbox-dark'
  | 'gruvbox-light'
  | 'solarized-dark'
  | 'solarized-light'

export type ThemeTone = 'dark' | 'light'

export type ThemeDef = {
  id: ThemeId
  name: string
  tone: ThemeTone
  vars: {
    bg: string
    fg: string
    muted: string
    accent: string
    accent2: string
    error: string
    surface: string
    border: string
  }
  layered: string
}

const L = (g: string) => g

export const THEMES: ThemeDef[] = [
  {
    id: 'catppuccin-latte',
    name: 'Catppuccin Latte',
    tone: 'light',
    vars: {
      bg: '#eff1f5', fg: '#4c4f69', muted: '#6c6f85', accent: '#1e66f5', accent2: '#ea76cb', error: '#d20f39', surface: 'rgba(255,255,255,0.92)', border: 'rgba(0,0,0,0.08)'
    },
    layered: L('radial-gradient(1200px 800px at 10% 10%, rgba(30,102,245,0.14), transparent 40%), radial-gradient(1000px 700px at 90% 24%, rgba(234,118,203,0.08), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'rose-pine',
    name: 'Rosé Pine',
    tone: 'dark',
    vars: {
      bg: '#191724', fg: '#e0def4', muted: '#908caa', accent: '#c4a7e7', accent2: '#eb6f92', error: '#eb6f92', surface: 'rgba(25,23,36,0.95)', border: 'rgba(255,255,255,0.06)'
    },
    layered: L('radial-gradient(1200px 800px at 8% 10%, rgba(196,167,231,0.16), transparent 40%), radial-gradient(1000px 700px at 90% 30%, rgba(235,111,146,0.08), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'dracula',
    name: 'Dracula',
    tone: 'dark',
    vars: {
      bg: '#282a36', fg: '#f8f8f2', muted: '#bdc0d0', accent: '#bd93f9', accent2: '#50fa7b', error: '#ff5555', surface: 'rgba(40,42,54,0.93)', border: 'rgba(255,255,255,0.05)'
    },
    layered: L('radial-gradient(1200px 800px at 12% 12%, rgba(189,147,249,0.14), transparent 40%), radial-gradient(1000px 700px at 85% 15%, rgba(80,250,123,0.08), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'one-dark',
    name: 'One Dark',
    tone: 'dark',
    vars: {
      bg: '#282c34', fg: '#abb2bf', muted: '#5c6370', accent: '#61afef', accent2: '#c678dd', error: '#e06c75', surface: 'rgba(40,44,52,0.95)', border: 'rgba(255,255,255,0.05)'
    },
    layered: L('radial-gradient(1200px 800px at 20% 10%, rgba(97,175,239,0.13), transparent 40%), radial-gradient(1000px 700px at 85% 30%, rgba(198,120,221,0.10), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    tone: 'dark',
    vars: {
      bg: '#1a1b26', fg: '#c0caf5', muted: '#a9b1d6', accent: '#7aa2f7', accent2: '#bb9af7', error: '#f7768e', surface: 'rgba(26,27,38,0.95)', border: 'rgba(255,255,255,0.06)'
    },
    layered: L('radial-gradient(1200px 800px at 14% 14%, rgba(122,162,247,0.14), transparent 40%), radial-gradient(1000px 700px at 86% 28%, rgba(187,154,247,0.09), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'catppuccin-mocha',
    name: 'Catppuccin Mocha',
    tone: 'dark',
    vars: {
      bg: '#1e1e2e', fg: '#cdd6f4', muted: '#a6adc8', accent: '#89b4fa', accent2: '#f5c2e7', error: '#f38ba8', surface: 'rgba(30,30,46,0.92)', border: 'rgba(255,255,255,0.07)'
    },
    layered: L('radial-gradient(1200px 800px at 12% 14%, rgba(137,180,250,0.14), transparent 40%), radial-gradient(1000px 700px at 86% 24%, rgba(245,194,231,0.09), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    tone: 'dark',
    vars: {
      bg: '#0d1117', fg: '#e6edf3', muted: '#8b949e', accent: '#2f81f7', accent2: '#a371f7', error: '#f85149', surface: 'rgba(13,17,23,0.96)', border: 'rgba(255,255,255,0.08)'
    },
    layered: L('radial-gradient(1200px 800px at 10% 14%, rgba(47,129,247,0.15), transparent 40%), radial-gradient(1000px 700px at 86% 22%, rgba(163,113,247,0.08), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    tone: 'light',
    vars: {
      bg: '#ffffff', fg: '#24292f', muted: '#57606a', accent: '#0969da', accent2: '#bf3989', error: '#cf222e', surface: 'rgba(255,255,255,0.98)', border: 'rgba(0,0,0,0.07)'
    },
    layered: L('radial-gradient(1200px 800px at 10% 14%, rgba(9,105,218,0.10), transparent 40%), radial-gradient(1000px 700px at 86% 18%, rgba(191,57,137,0.06), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'nord',
    name: 'Nord',
    tone: 'dark',
    vars: {
      bg: '#2e3440', fg: '#d8dee9', muted: '#88c0d0', accent: '#81a1c1', accent2: '#5e81ac', error: '#bf616a', surface: 'rgba(46,52,64,0.93)', border: 'rgba(255,255,255,0.06)'
    },
    layered: L('radial-gradient(1200px 800px at 12% 18%, rgba(136,192,208,0.15), transparent 40%), var(--qc-bg)')
  },
  {
    id: 'synthwave-84',
    name: "Synthwave '84",
    tone: 'dark',
    vars: {
      bg: '#2b213a', fg: '#f5f5ff', muted: '#b5a7c8', accent: '#f92aad', accent2: '#00f6ff', error: '#ff5370', surface: 'rgba(43,33,58,0.95)', border: 'rgba(255,255,255,0.10)'
    },
    layered: L('radial-gradient(1200px 800px at 15% 14%, rgba(249,42,173,0.20), transparent 40%), radial-gradient(1000px 700px at 80% 24%, rgba(0,246,255,0.08), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    tone: 'dark',
    vars: {
      bg: '#011627', fg: '#d6deeb', muted: '#5f7e97', accent: '#82aaff', accent2: '#c792ea', error: '#ef5350', surface: 'rgba(1,22,39,0.94)', border: 'rgba(255,255,255,0.08)'
    },
    layered: L('radial-gradient(1200px 800px at 6% 10%, rgba(130,170,255,0.14), transparent 40%), radial-gradient(1000px 700px at 94% 30%, rgba(199,146,234,0.09), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'gruvbox-dark',
    name: 'Gruvbox Dark',
    tone: 'dark',
    vars: {
      bg: '#282828', fg: '#ebdbb2', muted: '#bdae93', accent: '#fabd2f', accent2: '#8ec07c', error: '#fb4934', surface: 'rgba(40,40,40,0.9)', border: 'rgba(255,255,255,0.06)'
    },
    layered: L('radial-gradient(1200px 800px at 7% 18%, rgba(250,189,47,0.14), transparent 40%), var(--qc-bg)')
  },
  {
    id: 'gruvbox-light',
    name: 'Gruvbox Light',
    tone: 'light',
    vars: {
      bg: '#fbf1c7', fg: '#3c3836', muted: '#7c6f64', accent: '#d79921', accent2: '#689d6a', error: '#cc241d', surface: 'rgba(255,255,255,0.93)', border: 'rgba(0,0,0,0.04)'
    },
    layered: L('radial-gradient(1200px 800px at 7% 18%, rgba(215,153,33,0.13), transparent 40%), var(--qc-bg)')
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    tone: 'dark',
    vars: {
      bg: '#002b36', fg: '#eee8d5', muted: '#93a1a1', accent: '#268bd2', accent2: '#b58900', error: '#dc322f', surface: 'rgba(0,43,54,0.91)', border: 'rgba(255,255,255,0.06)'
    },
    layered: L('radial-gradient(1200px 800px at 11% 21%, rgba(38,139,210,0.13), transparent 40%), var(--qc-bg)')
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    tone: 'light',
    vars: {
      bg: '#fdf6e3', fg: '#586e75', muted: '#93a1a1', accent: '#268bd2', accent2: '#d33682', error: '#dc322f', surface: 'rgba(255,255,255,0.94)', border: 'rgba(0,0,0,0.03)'
    },
    layered: L('radial-gradient(1200px 800px at 11% 21%, rgba(38,139,210,0.10), transparent 40%), var(--qc-bg)')
  }
]

export function getThemeById(id: ThemeId): ThemeDef {
  const t = THEMES.find((t) => t.id === id)
  return t ?? THEMES[0]
}
