import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// import { registerSW } from 'virtual:pwa-register'  // TEMPORARILY DISABLED

// registerSW({ immediate: true })  // TEMPORARILY DISABLED

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
