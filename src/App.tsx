import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useCallback, Suspense } from 'react';
import { getCalculatorById } from './calculators/registry';
import { ScenarioComparison } from './components';
import { Portfolio } from './pages/Portfolio';
import { CalculatorHome } from './pages/CalculatorHome';
import { Navigation } from './components/layout/Navigation';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { CalculatorHeader } from './components/layout/CalculatorHeader';
import { Footer } from './components/layout/Footer';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ResetPassword } from './pages/ResetPassword';
import { Settings } from './pages/Settings';
import { useAuth } from './lib/auth-context';
import { ProtectedRoute } from './components/ProtectedRoute';

const ACTIVE_CALCULATOR_KEY = 'baliinvest_active_calculator';
const ACTIVE_VIEW_KEY = 'baliinvest_active_view';
const RECENT_CALCULATORS_KEY = 'baliinvest_recent_calculators';
const MAX_RECENT = 5;

type ViewType = 'home' | 'calculator' | 'portfolio' | 'comparison';

function CalculatorApp() {
  const [activeView, setActiveView] = useState<ViewType>(() => {
    const saved = localStorage.getItem(ACTIVE_VIEW_KEY);
    return (saved as ViewType) || 'home';
  });

  const [activeCalculatorId, setActiveCalculatorId] = useState<string>(() => {
    const saved = localStorage.getItem(ACTIVE_CALCULATOR_KEY);
    return saved && getCalculatorById(saved) ? saved : 'mortgage';
  });

  const handleCalculatorChange = useCallback((id: string) => {
    setActiveCalculatorId(id);
    localStorage.setItem(ACTIVE_CALCULATOR_KEY, id);

    // Add to recently used
    const recent = JSON.parse(localStorage.getItem(RECENT_CALCULATORS_KEY) || '[]') as string[];
    const updated = [id, ...recent.filter(c => c !== id)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_CALCULATORS_KEY, JSON.stringify(updated));

    setActiveView('calculator');
    localStorage.setItem(ACTIVE_VIEW_KEY, 'calculator');
  }, []);

  const handleNavigateHome = useCallback(() => {
    setActiveView('home');
    localStorage.setItem(ACTIVE_VIEW_KEY, 'home');
  }, []);

  const handleViewChange = useCallback((view: ViewType) => {
    setActiveView(view);
    localStorage.setItem(ACTIVE_VIEW_KEY, view);
  }, []);

  const activeCalculator = getCalculatorById(activeCalculatorId);
  const ActiveComponent = activeCalculator?.component;

  return (
    <DashboardLayout
      activeView={activeView}
      onViewChange={handleViewChange}
      onSelectCalculator={handleCalculatorChange}
    >
      {/* Show calculator header when viewing a calculator */}
      {activeView === 'calculator' && activeCalculator && (
        <CalculatorHeader
          calculator={activeCalculator}
          onNavigateHome={handleNavigateHome}
        />
      )}

      {/* Main Content */}
      <Suspense fallback={<div className="text-center py-8 text-zinc-400">Loading...</div>}>
        {activeView === 'home' ? (
          <CalculatorHome onSelectCalculator={handleCalculatorChange} />
        ) : activeView === 'calculator' && ActiveComponent ? (
          <div className="w-full">
            <ActiveComponent />
          </div>
        ) : activeView === 'portfolio' ? (
          <Portfolio />
        ) : activeView === 'comparison' ? (
          <ScenarioComparison />
        ) : (
          <div className="text-zinc-400">View not found</div>
        )}
      </Suspense>
    </DashboardLayout>
  );
}

function AppRoutes() {
  const { isPasswordRecovery } = useAuth();
  const location = window.location.pathname;
  const isDashboard = location.startsWith('/calculators');

  // Redirect to reset password page when password recovery link is clicked
  if (isPasswordRecovery) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-1">
          <ResetPassword />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <Routes>
      {/* Dashboard route - uses its own layout */}
      <Route path="/calculators" element={<ProtectedRoute><CalculatorApp /></ProtectedRoute>} />

      {/* Public routes - use Navigation + Footer */}
      <Route path="*" element={
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
