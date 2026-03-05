import { useState, useCallback } from 'react';
import { Toast } from './Toast';
import jsPDF from 'jspdf';

export interface ReportData {
  calculatorType: 'mortgage' | 'cashflow' | 'cap-rate' | 'irr' | 'npv' | 'dev-feasibility' | 'rental-roi' | 'xirr' | 'indonesia-tax' | 'rental-projection' | 'financing';
  title: string;
  subtitle?: string;
  currency: string;
  symbol: string;
  generatedDate: string;
  sections: ReportSection[];
  rating?: {
    grade: string;
    label: string;
    value: string;
    description: string;
  };
}

export interface ReportSection {
  title: string;
  icon?: string;
  color?: 'emerald' | 'cyan' | 'orange' | 'red' | 'purple' | 'blue';
  type: 'metrics' | 'table' | 'text' | 'highlight';
  data: ReportMetric[] | ReportTableRow[] | string;
}

export interface ReportMetric {
  label: string;
  value: string;
  highlight?: boolean;
  positive?: boolean;
  negative?: boolean;
}

export interface ReportTableRow {
  cells: string[];
  highlight?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reportData: ReportData;
}

export function ReportPreviewModal({ isOpen, onClose, reportData }: Props) {
  const [mode, setMode] = useState<'preview' | 'email'>('preview');
  const [email, setEmail] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const generatePDF = useCallback((): jsPDF => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = margin;

    // Helper functions
    const addPage = () => {
      doc.addPage();
      y = margin;
    };

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        addPage();
        return true;
      }
      return false;
    };

    // Header
    doc.setFillColor(16, 185, 129); // emerald
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(reportData.title, margin, 25);

    if (reportData.subtitle) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(reportData.subtitle, margin, 33);
    }

    // Date on right
    doc.setFontSize(10);
    doc.text(reportData.generatedDate, pageWidth - margin, 25, { align: 'right' });

    y = 55;

    // Rating section if present
    if (reportData.rating) {
      doc.setFillColor(240, 253, 244); // light emerald bg
      doc.roundedRect(margin, y, pageWidth - 2 * margin, 30, 3, 3, 'F');

      doc.setTextColor(16, 185, 129);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text(reportData.rating.grade, margin + 10, y + 20);

      doc.setTextColor(60, 60, 60);
      doc.setFontSize(14);
      doc.text(reportData.rating.label, margin + 35, y + 15);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(reportData.rating.description, margin + 35, y + 23);

      // Value on right
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(reportData.rating.value, pageWidth - margin - 10, y + 18, { align: 'right' });

      y += 40;
    }

    // Sections
    for (const section of reportData.sections) {
      checkPageBreak(40);

      // Section title
      const colorMap = {
        emerald: [16, 185, 129],
        cyan: [6, 182, 212],
        orange: [249, 115, 22],
        red: [239, 68, 68],
        purple: [168, 85, 247],
        blue: [59, 130, 246],
      };
      const color = colorMap[section.color || 'emerald'];

      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(margin, y, 3, 8, 'F');

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(section.title.toUpperCase(), margin + 8, y + 6);
      y += 15;

      // Section content based on type
      if (section.type === 'metrics' && Array.isArray(section.data)) {
        const metrics = section.data as ReportMetric[];
        const cols = Math.min(4, metrics.length);
        const colWidth = (pageWidth - 2 * margin) / cols;

        let col = 0;
        let rowY = y;

        for (const metric of metrics) {
          checkPageBreak(25);

          const x = margin + col * colWidth;

          // Background
          doc.setFillColor(250, 250, 250);
          doc.roundedRect(x + 2, rowY, colWidth - 4, 22, 2, 2, 'F');

          // Label
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 120);
          doc.setFont('helvetica', 'normal');
          doc.text(metric.label.toUpperCase(), x + 6, rowY + 8);

          // Value
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          if (metric.positive) {
            doc.setTextColor(16, 185, 129);
          } else if (metric.negative) {
            doc.setTextColor(239, 68, 68);
          } else {
            doc.setTextColor(30, 30, 30);
          }
          doc.text(metric.value, x + 6, rowY + 17);

          col++;
          if (col >= cols) {
            col = 0;
            rowY += 26;
          }
        }
        y = rowY + (col > 0 ? 26 : 0) + 5;
      }

      if (section.type === 'table' && Array.isArray(section.data)) {
        const rows = section.data as ReportTableRow[];
        if (rows.length > 0) {
          const numCols = rows[0].cells.length;
          const colWidth = (pageWidth - 2 * margin) / numCols;

          // Header row
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F');
          doc.setFontSize(8);
          doc.setTextColor(80, 80, 80);
          doc.setFont('helvetica', 'bold');

          rows[0].cells.forEach((cell, i) => {
            doc.text(cell.toUpperCase(), margin + i * colWidth + 4, y + 5.5);
          });
          y += 10;

          // Data rows
          doc.setFont('helvetica', 'normal');
          for (let i = 1; i < Math.min(rows.length, 12); i++) {
            checkPageBreak(8);

            if (i % 2 === 0) {
              doc.setFillColor(250, 250, 250);
              doc.rect(margin, y, pageWidth - 2 * margin, 7, 'F');
            }

            doc.setTextColor(60, 60, 60);
            doc.setFontSize(9);
            rows[i].cells.forEach((cell, j) => {
              doc.text(cell, margin + j * colWidth + 4, y + 5);
            });
            y += 7;
          }

          if (rows.length > 12) {
            doc.setTextColor(120, 120, 120);
            doc.setFontSize(8);
            doc.text(`+ ${rows.length - 12} more rows`, margin + 4, y + 5);
            y += 8;
          }
          y += 5;
        }
      }

      if (section.type === 'highlight' && typeof section.data === 'string') {
        checkPageBreak(25);
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 2, 2, 'F');
        doc.setTextColor(16, 185, 129);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(section.data, margin + 8, y + 11);
        y += 25;
      }

      if (section.type === 'text' && typeof section.data === 'string') {
        checkPageBreak(15);
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(section.data, pageWidth - 2 * margin);
        doc.text(lines, margin, y + 5);
        y += lines.length * 5 + 10;
      }
    }

    // Footer
    const footerY = pageHeight - 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Generated by ROI Calculate | roicalculate.com', margin, footerY);
    doc.text(`Page 1 of ${doc.getNumberOfPages()}`, pageWidth - margin, footerY, { align: 'right' });

    return doc;
  }, [reportData]);

  const handleDownload = useCallback(async () => {
    setIsExporting(true);
    try {
      const doc = generatePDF();
      const filename = `${reportData.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
      doc.save(filename);
      setToast({ message: 'PDF downloaded successfully!', type: 'success' });
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setToast({ message: 'Failed to generate PDF', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  }, [generatePDF, reportData.title, onClose]);

  const handleSendEmail = useCallback(async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsExporting(true);
    setEmailError(null);

    try {
      const doc = generatePDF();
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const fileName = `${reportData.title.replace(/\s+/g, '-')}.pdf`;

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          pdfBase64,
          fileName,
          reportType: reportData.title,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Failed to send email');
      }

      setToast({ message: `Report sent to ${trimmed}!`, type: 'success' });
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to send email';
      setToast({ message: `${errorMsg}. Try downloading instead.`, type: 'error' });
    } finally {
      setIsExporting(false);
    }
  }, [email, generatePDF, reportData, onClose]);

  if (!isOpen) return null;

  const getSectionColor = (color?: string) => {
    const colors = {
      emerald: 'border-emerald-500 bg-emerald-500/10',
      cyan: 'border-cyan-500 bg-cyan-500/10',
      orange: 'border-orange-500 bg-orange-500/10',
      red: 'border-red-500 bg-red-500/10',
      purple: 'border-purple-500 bg-purple-500/10',
      blue: 'border-blue-500 bg-blue-500/10',
    };
    return colors[color as keyof typeof colors] || colors.emerald;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{reportData.title}</h2>
            {reportData.subtitle && <p className="text-white/70 text-sm">{reportData.subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition p-2"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Rating Card */}
          {reportData.rating && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-black text-emerald-400">{reportData.rating.grade}</div>
                <div>
                  <div className="text-lg font-bold text-white">{reportData.rating.label}</div>
                  <div className="text-sm text-zinc-400">{reportData.rating.description}</div>
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-400">{reportData.rating.value}</div>
            </div>
          )}

          {/* Sections Preview */}
          {reportData.sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-1 h-5 rounded-full ${
                  section.color === 'cyan' ? 'bg-cyan-500' :
                  section.color === 'orange' ? 'bg-orange-500' :
                  section.color === 'red' ? 'bg-red-500' :
                  section.color === 'purple' ? 'bg-purple-500' :
                  section.color === 'blue' ? 'bg-blue-500' :
                  'bg-emerald-500'
                }`} />
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">{section.title}</h3>
              </div>

              {section.type === 'metrics' && Array.isArray(section.data) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(section.data as ReportMetric[]).map((metric, i) => (
                    <div key={i} className="bg-zinc-800 rounded-lg p-3 border border-zinc-700">
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">{metric.label}</div>
                      <div className={`text-lg font-bold ${
                        metric.positive ? 'text-emerald-400' :
                        metric.negative ? 'text-red-400' :
                        'text-white'
                      }`}>{metric.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {section.type === 'table' && Array.isArray(section.data) && (
                <div className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-zinc-700/50">
                        {(section.data as ReportTableRow[])[0]?.cells.map((cell, i) => (
                          <th key={i} className="px-4 py-2 text-left text-xs font-bold text-zinc-400 uppercase">{cell}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(section.data as ReportTableRow[]).slice(1, 6).map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-zinc-800' : 'bg-zinc-800/50'}>
                          {row.cells.map((cell, j) => (
                            <td key={j} className="px-4 py-2 text-zinc-300">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(section.data as ReportTableRow[]).length > 6 && (
                    <div className="px-4 py-2 text-center text-xs text-zinc-500 bg-zinc-700/30">
                      + {(section.data as ReportTableRow[]).length - 6} more rows in PDF
                    </div>
                  )}
                </div>
              )}

              {section.type === 'highlight' && typeof section.data === 'string' && (
                <div className={`rounded-lg p-4 border-l-4 ${getSectionColor(section.color)}`}>
                  <p className="text-white font-medium">{section.data}</p>
                </div>
              )}

              {section.type === 'text' && typeof section.data === 'string' && (
                <p className="text-zinc-400 text-sm">{section.data}</p>
              )}
            </div>
          ))}

          {/* Generated date */}
          <div className="text-center text-xs text-zinc-500 pt-4 border-t border-zinc-800">
            Report generated on {reportData.generatedDate} • ROI Calculate
          </div>
        </div>

        {/* Action Footer */}
        <div className="border-t border-zinc-800 p-4 bg-zinc-800/50">
          {mode === 'preview' ? (
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                disabled={isExporting}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isExporting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </>
                )}
              </button>
              <button
                onClick={() => setMode('email')}
                disabled={isExporting}
                className="flex-1 px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send to Email
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSendEmail}
                  disabled={isExporting}
                  className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send'
                  )}
                </button>
              </div>
              {emailError && (
                <p className="text-red-400 text-sm">{emailError}</p>
              )}
              <button
                onClick={() => setMode('preview')}
                className="text-sm text-zinc-400 hover:text-white transition"
              >
                ← Back to preview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportPreviewModal;
