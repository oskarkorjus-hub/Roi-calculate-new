import { useState, type ReactNode } from 'react';
import { EmailCollectionModal } from './EmailCollectionModal';
import { Toast } from './ui/Toast';

interface ResultsWithEmailCollectionProps {
  projectName: string;
  children: ReactNode; // The results content to display
  onExport: (email: string, name?: string, propertyName?: string) => Promise<void>;
  onSkip: () => void;
  isExporting?: boolean;
  autoShowEmail?: boolean; // Show email modal on mount if true
}

export function ResultsWithEmailCollection({
  projectName,
  children,
  onExport,
  onSkip,
  isExporting = false,
  autoShowEmail = true,
}: ResultsWithEmailCollectionProps) {
  const [showEmailModal, setShowEmailModal] = useState(autoShowEmail);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleEmailSubmit = async (email: string, name?: string, propertyName?: string) => {
    try {
      await onExport(email, name, propertyName);
      setShowEmailModal(false);
      setToast({
        message: 'Report sent successfully!',
        type: 'success',
      });
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Failed to send report',
        type: 'error',
      });
    }
  };

  const handleSkip = () => {
    setShowEmailModal(false);
    onSkip();
  };

  return (
    <>
      {/* Results Display */}
      <div className={showEmailModal ? 'opacity-50 pointer-events-none' : ''}>
        {children}
      </div>

      {/* Email Collection Modal */}
      {showEmailModal && (
        <EmailCollectionModal
          projectName={projectName}
          onSubmit={handleEmailSubmit}
          onSkip={handleSkip}
          isLoading={isExporting}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
