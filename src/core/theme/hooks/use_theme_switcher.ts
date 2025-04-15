import { useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { themeAtom } from '~/core/theme/atoms/theme_atom'
import { ApplicationTheme } from '~/core/theme/constants/application_theme'
import withoutTransition from '~/core/theme/utils/without_transition'

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
    withoutTransition(() => {
      document.documentElement.classList.toggle(
        'dark',
        theme === ApplicationTheme.DARK || (theme === ApplicationTheme.SYSTEM && window.matchMedia('(prefers-color-scheme: dark)').matches),
      )
      document.documentElement.classList.toggle(
        'light',
        theme === ApplicationTheme.LIGHT || (theme === ApplicationTheme.SYSTEM && window.matchMedia('(prefers-color-scheme: light)').matches),
      )
    })
  }, [theme])

  return {
    theme,
    setTheme,
    toggleTheme,
    initializeEventListener,
  }
}
