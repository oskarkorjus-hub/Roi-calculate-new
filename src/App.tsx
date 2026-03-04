import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useCallback, Suspense } from 'react';
import { getCalculatorById } from './calculators/registry';
import { ScenarioComparison } from './components';
import { Portfolio } from './pages/Portfolio';
import { CalculatorHome } from './pages/CalculatorHome';
import { Navigation } from './components/layout/Navigation';
import { CalculatorHeader } from './components/layout/CalculatorHeader';
import { Footer } from './components/layout/Footer';
import { Landing } from './pages/Landing';
import { Pricing } from './pages/Pricing';
import { FAQ } from './pages/FAQ';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Contact } from './pages/Contact';

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Show header only when viewing a calculator */}
      {activeView === 'calculator' && activeCalculator && (
        <CalculatorHeader
          calculator={activeCalculator}
          onNavigateHome={handleNavigateHome}
        />
      )}

      {/* Main View Navigation */}
      {activeView !== 'calculator' && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-1 border-b border-gray-200">
              <button
                onClick={() => handleViewChange('home')}
                className={`px-4 py-3 font-medium text-sm ${
                  activeView === 'home'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Calculators
              </button>
              <button
                onClick={() => handleViewChange('portfolio')}
                className={`px-4 py-3 font-medium text-sm ${
                  activeView === 'portfolio'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                💼 Portfolio
              </button>
              <button
                onClick={() => handleViewChange('comparison')}
                className={`px-4 py-3 font-medium text-sm ${
                  activeView === 'comparison'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ⚖️ Compare
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          {activeView === 'home' ? (
            <CalculatorHome onSelectCalculator={handleCalculatorChange} />
          ) : activeView === 'calculator' && ActiveComponent ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <ActiveComponent />
            </div>
          ) : activeView === 'portfolio' ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Portfolio />
            </div>
          ) : activeView === 'comparison' ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <ScenarioComparison />
            </div>
          ) : (
            <div>View not found</div>
          )}
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/calculators" element={<CalculatorApp />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
