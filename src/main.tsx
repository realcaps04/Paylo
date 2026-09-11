import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider } from 'convex/react'
import './index.css'
import App from './App'
import { convex } from '@/lib/convex'

if (
  window.matchMedia('(display-mode: standalone)').matches ||
  Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
) {
  document.body.classList.add('standalone')
}

const tree = (
  <StrictMode>
    <App />
  </StrictMode>
)

createRoot(document.getElementById('root')!).render(
  convex ? <ConvexProvider client={convex}>{tree}</ConvexProvider> : tree,
)
