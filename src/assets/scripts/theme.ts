import { isNullOrUndefined } from '@sindresorhus/is'
import { APPLICATION_THEME_LOCAL_STORAGE_KEY, ApplicationTheme } from '~/hooks/use_theme_switcher'

let theme: ApplicationTheme | undefined = localStorage.getItem(APPLICATION_THEME_LOCAL_STORAGE_KEY) ? JSON.parse(localStorage.getItem(APPLICATION_THEME_LOCAL_STORAGE_KEY) as string) : undefined

if (isNullOrUndefined(theme)) {
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
  const systemPrefers = systemPrefersDark ? ApplicationTheme.DARK : systemPrefersLight ? ApplicationTheme.LIGHT : ApplicationTheme.SYSTEM
  localStorage.setItem(APPLICATION_THEME_LOCAL_STORAGE_KEY, JSON.stringify(systemPrefers))
  theme = systemPrefers
}

document.documentElement.classList.toggle(
  'dark',
  theme === ApplicationTheme.DARK || (theme === ApplicationTheme.SYSTEM && window.matchMedia('(prefers-color-scheme: dark)').matches),
)

document.documentElement.classList.toggle(
  'light',
  theme === ApplicationTheme.LIGHT || (theme === ApplicationTheme.SYSTEM && window.matchMedia('(prefers-color-scheme: light)').matches),
)
