import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (t: Theme) => void
}

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined') return true
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
}

function resolve(t: Theme): 'light' | 'dark' {
  if (t === 'system') return systemPrefersDark() ? 'dark' : 'light'
  return t
}

function apply(t: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(t)
  root.style.colorScheme = t
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      resolved: 'dark',
      setTheme: (t) => {
        const r = resolve(t)
        apply(r)
        set({ theme: t, resolved: r })
      },
    }),
    {
      name: 'glitch:theme',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const r = resolve(state.theme)
        apply(r)
        state.resolved = r
      },
    },
  ),
)

// Apply default theme immediately so first paint is themed before persist
// rehydration runs (which corrects to the user's saved preference if any).
if (typeof document !== 'undefined') {
  apply('dark')
}

// React to system changes when in 'system' mode.
if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const onChange = () => {
    const s = useThemeStore.getState()
    if (s.theme === 'system') s.setTheme('system')
  }
  if (mq.addEventListener) mq.addEventListener('change', onChange)
  else mq.addListener?.(onChange)
}
