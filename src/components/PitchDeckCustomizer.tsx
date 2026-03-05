import { useState } from 'react';
import type { PortfolioProject } from '../types/portfolio';
import { generateInvestorPitchDeck } from '../utils/investorPitchDeckGenerator';
import { Toast } from './ui/Toast';

interface PitchDeckCustomizerProps {
  project: PortfolioProject;
  onClose?: () => void;
  variant?: 'default' | 'minimal' | 'menu-item';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PitchDeckCustomizer({ project, onClose, variant = 'default', isOpen, onOpenChange }: PitchDeckCustomizerProps) {
  const [internalShowModal, setInternalShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Support controlled mode (external state) or uncontrolled mode (internal state)
  const showModal = isOpen !== undefined ? isOpen : internalShowModal;
  const setShowModal = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalShowModal(open);
    }
  };

  const [customization, setCustomization] = useState({
    companyName: 'ROI Calculate',
    agentName: 'Investment Advisor',
    agentEmail: 'info@example.com',
    agentPhone: '+1 (555) 000-0000',
    primaryColor: '#10b981',
    sections: {
      executiveSummary: true,
      dealHighlights: true,
      financialProjections: true,
      marketAnalysis: true,
      riskAssessment: true,
      legalStructure: true,
      callToAction: true,
    },
  });

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 16, g: 185, b: 129 };
  };

  const handleSectionToggle = (section: keyof typeof customization.sections) => {
    setCustomization(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: !prev.sections[section],
      },
    }));
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      await generateInvestorPitchDeck(project, {
        companyName: customization.companyName,
        agentName: customization.agentName,
        agentEmail: customization.agentEmail,
        agentPhone: customization.agentPhone,
        primaryColor: hexToRgb(customization.primaryColor),
        sections: customization.sections,
      });

      setToast({ message: 'Pitch deck generated successfully!', type: 'success' });
      setShowModal(false);
      onClose?.();
    } catch (error) {
      setToast({ message: 'Failed to generate pitch deck', type: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    onClose?.();
  };

  // Render the trigger button based on variant
  const renderTrigger = () => {
    if (variant === 'menu-item') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenModal();
          }}
          className="w-full px-3 py-2.5 text-left text-xs text-zinc-300 hover:bg-zinc-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Custom Pitch Deck
        </button>
      );
    }

    const buttonClass = variant === 'minimal'
      ? 'px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition'
      : 'px-3 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition text-sm font-medium';

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleOpenModal();
        }}
        className={buttonClass}
        title="Download customized investor pitch deck"
      >
        {variant === 'minimal' ? 'Pitch' : (
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Pitch Deck
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Only render trigger when not in controlled mode */}
      {isOpen === undefined && renderTrigger()}

      {/* Modal - Dark Theme */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">Customize Investor Pitch Deck</h3>

            <div className="space-y-6 mb-6">
              {/* Company Information */}
              <div className="space-y-3 pb-4 border-b border-zinc-800">
                <h4 className="font-semibold text-white">Company & Agent Info</h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={customization.companyName}
                      onChange={e => setCustomization(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">
                      Agent Name
                    </label>
                    <input
                      type="text"
                      value={customization.agentName}
                      onChange={e => setCustomization(prev => ({ ...prev, agentName: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={customization.agentEmail}
                      onChange={e => setCustomization(prev => ({ ...prev, agentEmail: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={customization.agentPhone}
                      onChange={e => setCustomization(prev => ({ ...prev, agentPhone: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Branding */}
              <div className="space-y-3 pb-4 border-b border-zinc-800">
                <h4 className="font-semibold text-white">Branding</h4>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customization.primaryColor}
                      onChange={e => setCustomization(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="h-10 w-14 border border-zinc-700 rounded-lg cursor-pointer bg-zinc-800"
                    />
                    <input
                      type="text"
                      value={customization.primaryColor}
                      onChange={e => setCustomization(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      placeholder="#10b981"
                    />
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white">PDF Sections</h4>
                <p className="text-xs text-zinc-500">Select sections to include:</p>

                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(customization.sections).map(([section, included]) => (
                    <label key={section} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-zinc-800/50 transition">
                      <input
                        type="checkbox"
                        checked={included}
                        onChange={() => handleSectionToggle(section as keyof typeof customization.sections)}
                        className="w-4 h-4 border border-zinc-600 rounded bg-zinc-800 text-emerald-500 cursor-pointer focus:ring-emerald-500 focus:ring-offset-zinc-900"
                      />
                      <span className="text-sm text-zinc-300">
                        {section
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())
                          .trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Summary */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-6">
              <p className="text-sm text-emerald-400">
                {Object.values(customization.sections).filter(Boolean).length} section
                {Object.values(customization.sections).filter(Boolean).length !== 1 ? 's' : ''} will be included in the PDF.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isGenerating}
                className="flex-1 px-4 py-2 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Download PDF'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
