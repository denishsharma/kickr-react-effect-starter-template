import { RouterProvider } from '@tanstack/react-router'
import { UnheadProvider } from '@unhead/react/client'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import router from '~/core/router/tanstack'
import head from '~/core/unhead/head'
import '~/assets/styles/global.css'

createRoot(document.getElementById('__app_root__')!).render(
  <StrictMode>
    <UnheadProvider head={head}>
      <RouterProvider router={router} />
    </UnheadProvider>
  </StrictMode>,
)
