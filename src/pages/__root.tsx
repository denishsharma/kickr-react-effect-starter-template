import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useEffect } from 'react'
import useThemeSwitcher from '~/hooks/use_theme_switcher'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  const { initializeEventListener: initializeThemeListener } = useThemeSwitcher()

  useEffect(() => {
    const cleanupThemeListener = initializeThemeListener()

    return () => {
      cleanupThemeListener()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- this should only run once

  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
}
