export type ThemeId =
  | 'dracula'
  | 'monokai'
  | 'one-dark'
  | 'nord'
  | 'tokyo-night'
  | 'night-owl'
  | 'solarized-dark'
  | 'solarized-light'
  | 'gruvbox-dark'
  | 'gruvbox-light'
  | 'catppuccin-mocha'
  | 'catppuccin-latte'
  | 'github-dark'
  | 'github-light'
  | 'synthwave-84'
  | 'rose-pine'
  | 'horizon'

export type ThemeDef = {
  id: ThemeId
  name: string
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
    id: 'dracula',
    name: 'Dracula',
    vars: {
      bg: '#282a36', fg: '#f8f8f2', muted: '#bdc0d0', accent: '#bd93f9', accent2: '#50fa7b', error: '#ff5555', surface: 'rgba(40,42,54,0.9)', border: 'rgba(255,255,255,0.08)'
    },
    layered: L('radial-gradient(1200px 800px at 12% 12%, rgba(189,147,249,0.16), transparent 40%), radial-gradient(1000px 700px at 86% 28%, rgba(80,250,123,0.12), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'monokai',
    name: 'Monokai',
    vars: {
      bg: '#272822', fg: '#f8f8f2', muted: '#b7baad', accent: '#a6e22e', accent2: '#fd971f', error: '#f92672', surface: 'rgba(39,40,34,0.9)', border: 'rgba(255,255,255,0.08)'
    },
    layered: L('radial-gradient(1200px 800px at 12% 12%, rgba(166,226,46,0.18), transparent 40%), radial-gradient(1000px 700px at 86% 28%, rgba(253,151,31,0.14), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'one-dark',
    name: 'One Dark',
    vars: {
      bg: '#282c34', fg: '#e6edf3', muted: '#9da7b3', accent: '#61afef', accent2: '#c678dd', error: '#e06c75', surface: 'rgba(40,44,52,0.9)', border: 'rgba(255,255,255,0.08)'
    },
    layered: L('radial-gradient(1200px 800px at 10% 14%, rgba(97,175,239,0.16), transparent 40%), radial-gradient(1000px 700px at 88% 32%, rgba(198,120,221,0.12), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'nord',
    name: 'Nord',
    vars: {
      bg: '#2e3440', fg: '#e5e9f0', muted: '#a9b1c0', accent: '#88c0d0', accent2: '#5e81ac', error: '#bf616a', surface: 'rgba(46,52,64,0.88)', border: 'rgba(255,255,255,0.08)'
    },
    layered: L('radial-gradient(1200px 800px at 16% 12%, rgba(136,192,208,0.18), transparent 40%), radial-gradient(1000px 700px at 82% 28%, rgba(94,129,172,0.14), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    vars: {
      bg: '#1a1b26', fg: '#c0caf5', muted: '#a9b1d6', accent: '#7aa2f7', accent2: '#bb9af7', error: '#f7768e', surface: 'rgba(26,27,38,0.9)', border: 'rgba(255,255,255,0.08)'
    },
    layered: L('radial-gradient(1200px 800px at 14% 14%, rgba(122,162,247,0.16), transparent 40%), radial-gradient(1000px 700px at 84% 28%, rgba(187,154,247,0.12), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    vars: {
      bg: '#011627', fg: '#d6deeb', muted: '#9fb3c8', accent: '#82aaff', accent2: '#c792ea', error: '#ef5350', surface: 'rgba(1,22,39,0.9)', border: 'rgba(255,255,255,0.08)'
    },
    layered: L('radial-gradient(1200px 800px at 10% 14%, rgba(130,170,255,0.18), transparent 40%), radial-gradient(1000px 700px at 84% 28%, rgba(199,146,234,0.12), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    vars: {
      bg: '#002b36', fg: '#eee8d5', muted: '#93a1a1', accent: '#268bd2', accent2: '#b58900', error: '#dc322f', surface: 'rgba(0,43,54,0.9)', border: 'rgba(255,255,255,0.08)'
    },
    layered: L('radial-gradient(1200px 800px at 12% 12%, rgba(38,139,210,0.18), transparent 40%), radial-gradient(1000px 700px at 86% 28%, rgba(181,137,0,0.12), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    vars: {
      bg: '#fdf6e3', fg: '#073642', muted: '#586e75', accent: '#268bd2', accent2: '#d33682', error: '#dc322f', surface: 'rgba(255,255,255,0.9)', border: 'rgba(0,0,0,0.1)'
    },
    layered: L('radial-gradient(1200px 800px at 10% 10%, rgba(38,139,210,0.16), transparent 40%), radial-gradient(1000px 700px at 90% 30%, rgba(211,54,130,0.12), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'gruvbox-dark',
    name: 'Gruvbox Dark',
    vars: {
      bg: '#282828', fg: '#ebdbb2', muted: '#bdae93', accent: '#fabd2f', accent2: '#8ec07c', error: '#fb4934', surface: 'rgba(40,40,40,0.9)', border: 'rgba(255,255,255,0.08)'
    },
    layered: L('radial-gradient(1200px 800px at 12% 12%, rgba(250,189,47,0.18), transparent 40%), radial-gradient(1000px 700px at 86% 28%, rgba(142,192,124,0.12), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'gruvbox-light',
    name: 'Gruvbox Light',
    vars: {
      bg: '#fbf1c7', fg: '#3c3836', muted: '#7c6f64', accent: '#d79921', accent2: '#689d6a', error: '#cc241d', surface: 'rgba(255,255,255,0.9)', border: 'rgba(0,0,0,0.1)'
    },
    layered: L('radial-gradient(1200px 800px at 10% 12%, rgba(215,153,33,0.20), transparent 40%), radial-gradient(1000px 700px at 86% 26%, rgba(104,157,106,0.14), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'catppuccin-mocha',
    name: 'Catppuccin Mocha',
    vars: {
      bg: '#1e1e2e', fg: '#cdd6f4', muted: '#a6adc8', accent: '#89b4fa', accent2: '#f38ba8', error: '#f38ba8', surface: 'rgba(30,30,46,0.9)', border: 'rgba(255,255,255,0.08)'
    },
    layered: L('radial-gradient(1200px 800px at 12% 14%, rgba(137,180,250,0.18), transparent 40%), radial-gradient(1000px 700px at 86% 28%, rgba(243,139,168,0.12), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'catppuccin-latte',
    name: 'Catppuccin Latte',
    vars: {
      bg: '#eff1f5', fg: '#4c4f69', muted: '#6c6f85', accent: '#1e66f5', accent2: '#ea76cb', error: '#d20f39', surface: 'rgba(255,255,255,0.92)', border: 'rgba(0,0,0,0.1)'
    },
    layered: L('radial-gradient(1200px 800px at 10% 10%, rgba(30,102,245,0.16), transparent 40%), radial-gradient(1000px 700px at 90% 30%, rgba(234,118,203,0.12), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    vars: {
      bg: '#0d1117', fg: '#e6edf3', muted: '#9da7b3', accent: '#2f81f7', accent2: '#a371f7', error: '#f85149', surface: 'rgba(13,17,23,0.9)', border: 'rgba(255,255,255,0.08)'
    },
    layered: L('radial-gradient(1200px 800px at 10% 14%, rgba(47,129,247,0.18), transparent 40%), radial-gradient(1000px 700px at 86% 28%, rgba(163,113,247,0.12), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    vars: {
      bg: '#ffffff', fg: '#24292f', muted: '#57606a', accent: '#0969da', accent2: '#bf3989', error: '#cf222e', surface: 'rgba(255,255,255,0.94)', border: 'rgba(0,0,0,0.1)'
    },
    layered: L('radial-gradient(1200px 800px at 10% 10%, rgba(9,105,218,0.16), transparent 40%), radial-gradient(1000px 700px at 90% 30%, rgba(191,57,137,0.12), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'synthwave-84',
    name: "Synthwave '84",
    vars: {
      bg: '#2b213a', fg: '#f5f5ff', muted: '#b5a7c8', accent: '#f92aad', accent2: '#00f6ff', error: '#ff5370', surface: 'rgba(43,33,58,0.9)', border: 'rgba(255,255,255,0.12)'
    },
    layered: L('radial-gradient(1200px 800px at 12% 12%, rgba(249,42,173,0.18), transparent 40%), radial-gradient(1000px 700px at 86% 28%, rgba(0,246,255,0.16), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'rose-pine',
    name: 'Rosé Pine',
    vars: {
      bg: '#191724', fg: '#e0def4', muted: '#908caa', accent: '#c4a7e7', accent2: '#eb6f92', error: '#eb6f92', surface: 'rgba(25,23,36,0.9)', border: 'rgba(255,255,255,0.08)'
    },
    layered: L('radial-gradient(1200px 800px at 12% 12%, rgba(196,167,231,0.18), transparent 40%), radial-gradient(1000px 700px at 86% 28%, rgba(235,111,146,0.12), transparent 45%), var(--qc-bg)')
  },
  {
    id: 'horizon',
    name: 'Horizon',
    vars: {
      bg: '#1c1e26', fg: '#e3e6ee', muted: '#9da3b0', accent: '#e95378', accent2: '#25b0bc', error: '#ef6b73', surface: 'rgba(28,30,38,0.9)', border: 'rgba(255,255,255,0.08)'
    },
    layered: L('radial-gradient(1200px 800px at 12% 12%, rgba(233,83,120,0.18), transparent 40%), radial-gradient(1000px 700px at 86% 28%, rgba(37,176,188,0.12), transparent 45%), var(--qc-bg)')
  },
]

export function getThemeById(id: ThemeId): ThemeDef {
  const t = THEMES.find((t) => t.id === id)
  return t ?? THEMES[0]
}

