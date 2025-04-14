import type { InferValue } from 'better-enums'
import { Enum } from 'better-enums'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback, useEffect } from 'react'

export const APPLICATION_THEME_LOCAL_STORAGE_KEY = 'app-theme'

export const APPLICATION_THEME = Enum({
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
})

export type ApplicationTheme = InferValue<typeof APPLICATION_THEME>
export const ApplicationTheme = APPLICATION_THEME.accessor

export const themeAtom = atomWithStorage<ApplicationTheme>(
  APPLICATION_THEME_LOCAL_STORAGE_KEY,
  ApplicationTheme.SYSTEM,
  undefined,
  {
    getOnInit: true,
  },
)

export default function useThemeSwitcher() {
  const [theme, setTheme] = useAtom(themeAtom)

  const initializeEventListener = useCallback(() => {
    function handleSystemThemeChange(event: MediaQueryListEvent) {
      const systemTheme = event.matches ? ApplicationTheme.DARK : ApplicationTheme.LIGHT
      setTheme(systemTheme)
    }
    const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQueryList.addEventListener('change', handleSystemThemeChange)
    return () => {
      mediaQueryList.removeEventListener('change', handleSystemThemeChange)
    }
  }, [setTheme])

  const toggleTheme = useCallback(() => {
    const newTheme = theme === ApplicationTheme.SYSTEM
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? ApplicationTheme.LIGHT
        : ApplicationTheme.DARK
      : theme === ApplicationTheme.LIGHT
        ? ApplicationTheme.DARK
        : ApplicationTheme.LIGHT
    setTheme(newTheme)
  }, [theme, setTheme])

  useEffect(() => {
    document.documentElement.classList.toggle(
      'dark',
      theme === ApplicationTheme.DARK || (theme === ApplicationTheme.SYSTEM && window.matchMedia('(prefers-color-scheme: dark)').matches),
    )
    document.documentElement.classList.toggle(
      'light',
      theme === ApplicationTheme.LIGHT || (theme === ApplicationTheme.SYSTEM && window.matchMedia('(prefers-color-scheme: light)').matches),
    )
  }, [theme])

  return {
    theme,
    setTheme,
    toggleTheme,
    initializeEventListener,
  }
}
