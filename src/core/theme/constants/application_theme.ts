import type { InferValue } from 'better-enums'
import { Enum } from 'better-enums'

export const APPLICATION_THEME = Enum({
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
})

export type ApplicationTheme = InferValue<typeof APPLICATION_THEME>
export const ApplicationTheme = APPLICATION_THEME.accessor
