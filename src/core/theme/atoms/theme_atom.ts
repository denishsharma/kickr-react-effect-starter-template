import { atomWithStorage } from 'jotai/utils'
import { ApplicationTheme } from '~/core/theme/constants/application_theme'
import { APPLICATION_THEME_LOCAL_STORAGE_KEY } from '~/core/theme/constants/theme_storage'

export const themeAtom = atomWithStorage<ApplicationTheme>(
  APPLICATION_THEME_LOCAL_STORAGE_KEY,
  ApplicationTheme.SYSTEM,
  undefined,
  {
    getOnInit: true,
  },
)
