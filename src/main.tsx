import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import router from '~/core/router/tanstack'
import '~/assets/styles/gloabl.css'

createRoot(document.getElementById('__app_root__')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
