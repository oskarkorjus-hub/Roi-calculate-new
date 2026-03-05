import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// import { AuthProvider } from './lib/auth-context'
import { TierProvider } from './lib/tier-context'
import { ComparisonProvider } from './lib/comparison-context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TierProvider>
      <ComparisonProvider>
        <App />
      </ComparisonProvider>
    </TierProvider>
  </StrictMode>,
)
