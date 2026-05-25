// ============================================================
// THEME STORE — system-aware dark/light/system mode
// ============================================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeMode } from '@/types/index'

interface ThemeState {
  mode: ThemeMode
  resolvedTheme: 'light' | 'dark'
  setMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

const getSystemTheme = (): 'light' | 'dark' =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

const applyTheme = (resolved: 'light' | 'dark') => {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
  root.setAttribute('data-theme', resolved)
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      resolvedTheme: getSystemTheme(),

      setMode: (mode: ThemeMode) => {
        const resolved = mode === 'system' ? getSystemTheme() : mode
        applyTheme(resolved)
        set({ mode, resolvedTheme: resolved })
      },

      toggleTheme: () => {
        const { resolvedTheme } = get()
        const next = resolvedTheme === 'light' ? 'dark' : 'light'
        applyTheme(next)
        set({ mode: next, resolvedTheme: next })
      },
    }),
    {
      name: 'nexus-theme',
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const resolved = state.mode === 'system' ? getSystemTheme() : state.mode
        applyTheme(resolved)
        state.resolvedTheme = resolved
      },
    }
  )
)
