import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Application from '~/app'
import '~/assets/styles/gloabl.css'

createRoot(document.getElementById('__app_root__')!).render(
  <StrictMode>
    <Application />
  </StrictMode>,
)
