import { useCallback, useState } from 'react';
import { usePortfolio } from './usePortfolio';
import { createProjectSummary } from '../utils/projectMetrics';
import { sendPDFByEmail } from '../utils/sendEmail';

interface ExportOptions {
  calculatorId: string;
  data: any;
  result: any;
  currency: string;
  formatDisplay: (idr: number) => string;
  generatePDF: () => string | Promise<string>; // Returns base64 PDF
}

export function useProjectExport() {
  const { addProject, logEmail } = usePortfolio();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportWithEmail = useCallback(
    async (
      options: ExportOptions,
      email: string,
      name?: string,
      propertyName?: string
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        // Create project summary
        const summary = createProjectSummary(
          options.calculatorId,
          options.data,
          options.result,
          options.currency
        );

        // Add to portfolio
        const project = addProject({
          ...summary,
          projectName: propertyName || summary.projectName,
        });

        // Generate PDF
        const pdfBase64 = typeof options.generatePDF === 'function'
          ? await Promise.resolve(options.generatePDF())
          : options.generatePDF;

        // Send email
        const success = await sendPDFByEmail({
          email,
          pdfBase64,
          fileName: `${summary.projectName}-report.pdf`,
          reportType: options.calculatorId,
        });

        if (success) {
          // Log email
          logEmail(email, name, propertyName || summary.projectName, options.calculatorId);
        }

        return {
          success,
          project,
          message: success
            ? 'Report sent and project saved!'
            : 'Project saved, but email sending failed',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Export failed';
        setError(errorMessage);
        return {
          success: false,
          project: null,
          message: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [addProject, logEmail]
  );

  const exportWithoutEmail = useCallback(
    (options: ExportOptions) => {
      try {
        // Create project summary
        const summary = createProjectSummary(
          options.calculatorId,
          options.data,
          options.result,
          options.currency
        );

        // Add to portfolio
        const project = addProject(summary);

        return {
          success: true,
          project,
          message: 'Project saved to portfolio!',
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Export failed';
        setError(errorMessage);
        return {
          success: false,
          project: null,
          message: errorMessage,
        };
      }
    },
    [addProject]
  );

  return {
    isLoading,
    error,
    exportWithEmail,
    exportWithoutEmail,
    clearError: () => setError(null),
  };
}
