export type ThemeId = 'midnight-gold'

export type ThemeTone = 'dark'

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
}

export const THEMES: ThemeDef[] = [
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    tone: 'dark',
    vars: {
      bg: '#050505',
      fg: '#fafafa',
      muted: '#525252',
      accent: '#d4af37',
      accent2: '#a1a1a1',
      error: '#ef4444',
      surface: '#0a0a0a',
      border: 'rgba(255, 255, 255, 0.06)'
    }
  }
]

export function getThemeById(_id: ThemeId): ThemeDef {
  return THEMES[0]
}
