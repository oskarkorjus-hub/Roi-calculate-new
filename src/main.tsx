import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './lib/auth-context'
import { TierProvider } from './lib/tier-context'
import { PortfolioProvider } from './lib/portfolio-context'
import { ComparisonProvider } from './lib/comparison-context'
import { NotificationProvider } from './lib/notification-context'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <TierProvider>
        <NotificationProvider>
          <PortfolioProvider>
            <ComparisonProvider>
              <App />
            </ComparisonProvider>
          </PortfolioProvider>
        </NotificationProvider>
      </TierProvider>
    </AuthProvider>
  </StrictMode>,
)
