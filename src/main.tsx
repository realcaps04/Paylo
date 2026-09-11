import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

if (
  window.matchMedia('(display-mode: standalone)').matches ||
  // @ts-expect-error iOS Safari
  navigator.standalone
) {
  document.body.classList.add('standalone')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
