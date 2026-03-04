import { useState } from 'react';
import type { PortfolioProject } from '../types/portfolio';
import { generateInvestorPitchDeck } from '../utils/investorPitchDeckGenerator';
import { Toast } from './ui/Toast';

interface PitchDeckCustomizerProps {
  project: PortfolioProject;
  onClose?: () => void;
}

export function PitchDeckCustomizer({ project, onClose }: PitchDeckCustomizerProps) {
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [customization, setCustomization] = useState({
    companyName: 'ROI Calculate',
    agentName: 'Investment Advisor',
    agentEmail: 'info@example.com',
    agentPhone: '+1 (555) 000-0000',
    primaryColor: '#4f46e5',
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
      : { r: 79, g: 70, b: 229 };
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

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-2 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition text-sm font-medium"
        title="Download customized investor pitch deck"
      >
        📊 Pitch Deck
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Customize Investor Pitch Deck</h3>

            <div className="space-y-6 mb-6">
              {/* Company Information */}
              <div className="space-y-3 pb-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900">Company & Agent Info</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={customization.companyName}
                    onChange={e => setCustomization(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    value={customization.agentName}
                    onChange={e => setCustomization(prev => ({ ...prev, agentName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customization.agentEmail}
                    onChange={e => setCustomization(prev => ({ ...prev, agentEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customization.agentPhone}
                    onChange={e => setCustomization(prev => ({ ...prev, agentPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Branding */}
              <div className="space-y-3 pb-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900">Branding</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customization.primaryColor}
                      onChange={e => setCustomization(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customization.primaryColor}
                      onChange={e => setCustomization(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-mono"
                      placeholder="#4f46e5"
                    />
                  </div>
                </div>
              </div>

              {/* Sections */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">PDF Sections</h4>
                <p className="text-sm text-gray-600">Select which sections to include in the pitch deck:</p>

                <div className="space-y-2">
                  {Object.entries(customization.sections).map(([section, included]) => (
                    <label key={section} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={included}
                        onChange={() => handleSectionToggle(section as keyof typeof customization.sections)}
                        className="w-4 h-4 border border-gray-300 rounded text-indigo-600 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">
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
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-indigo-900 mb-2">Preview</h4>
              <p className="text-sm text-indigo-800">
                {Object.values(customization.sections).filter(Boolean).length} section
                {Object.values(customization.sections).filter(Boolean).length !== 1 ? 's' : ''} will be included in the PDF.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isGenerating}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
