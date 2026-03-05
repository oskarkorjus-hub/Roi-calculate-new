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
    const contentWidth = pageWidth - 2 * margin;
    let y = 0;

    // Enterprise Color Palette
    const COLORS = {
      primary: { r: 16, g: 185, b: 129 },      // emerald-500
      primaryDark: { r: 5, g: 150, b: 105 },   // emerald-600
      dark: { r: 24, g: 24, b: 27 },           // zinc-900
      gray: { r: 113, g: 113, b: 122 },        // zinc-500
      lightGray: { r: 244, g: 244, b: 245 },   // zinc-100
      mediumGray: { r: 228, g: 228, b: 231 },  // zinc-200
      white: { r: 255, g: 255, b: 255 },
      success: { r: 22, g: 163, b: 74 },       // green-600
      warning: { r: 217, g: 119, b: 6 },       // amber-600
      danger: { r: 220, g: 38, b: 38 },        // red-600
    };

    // Helper: Draw gradient header
    const drawHeader = () => {
      const headerHeight = 35;
      // Draw gradient effect with multiple rectangles
      for (let i = 0; i < headerHeight; i++) {
        const ratio = i / headerHeight;
        const r = Math.round(COLORS.primaryDark.r + (COLORS.primary.r - COLORS.primaryDark.r) * ratio * 0.3);
        const g = Math.round(COLORS.primaryDark.g + (COLORS.primary.g - COLORS.primaryDark.g) * ratio * 0.3);
        const b = Math.round(COLORS.primaryDark.b + (COLORS.primary.b - COLORS.primaryDark.b) * ratio * 0.3);
        doc.setFillColor(r, g, b);
        doc.rect(0, i, pageWidth, 1, 'F');
      }

      // Logo text
      doc.setTextColor(COLORS.white.r, COLORS.white.g, COLORS.white.b);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('ROI CALCULATE', margin, 22);

      // Report type badge on right
      const badgeText = reportData.calculatorType.replace(/-/g, ' ').toUpperCase();
      const badgeWidth = doc.getTextWidth(badgeText) + 12;
      doc.setFillColor(255, 255, 255, 0.2);
      doc.roundedRect(pageWidth - margin - badgeWidth, 14, badgeWidth, 10, 2, 2, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(badgeText, pageWidth - margin - badgeWidth + 6, 21);

      return headerHeight + 10;
    };

    // Helper: Draw title section
    const drawTitleSection = (startY: number) => {
      let currentY = startY;

      // Main title
      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(reportData.title, contentWidth);
      doc.text(titleLines, margin, currentY);
      currentY += titleLines.length * 10 + 3;

      // Subtitle
      if (reportData.subtitle) {
        doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(reportData.subtitle, margin, currentY);
        currentY += 8;
      }

      // Generated date
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${reportData.generatedDate}`, margin, currentY);
      currentY += 12;

      return currentY;
    };

    // Helper: Draw investment grade card
    const drawRatingCard = (startY: number) => {
      if (!reportData.rating) return startY;

      const cardHeight = 40;

      // Card background
      doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
      doc.roundedRect(margin, startY, contentWidth, cardHeight, 4, 4, 'F');

      // Left accent bar
      doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
      doc.roundedRect(margin, startY, 4, cardHeight, 2, 2, 'F');

      // Grade letter (large)
      doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
      doc.setFontSize(36);
      doc.setFont('helvetica', 'bold');
      doc.text(reportData.rating.grade, margin + 16, startY + 28);

      // Grade label and description
      const labelX = margin + 55;
      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(reportData.rating.label, labelX, startY + 18);

      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(reportData.rating.description, labelX, startY + 28);

      // Key value on right
      doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(reportData.rating.value, pageWidth - margin - 12, startY + 24, { align: 'right' });

      return startY + cardHeight + 15;
    };

    // Helper: Draw section title
    const drawSectionTitle = (title: string, color: number[], currentY: number) => {
      // Colored left bar
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(margin, currentY, 3, 10, 'F');

      // Title text
      doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title.toUpperCase(), margin + 8, currentY + 7);

      return currentY + 16;
    };

    // Helper: Draw metric card
    const drawMetricCard = (metric: ReportMetric, x: number, y: number, width: number, height: number) => {
      // Background
      doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
      doc.roundedRect(x, y, width, height, 3, 3, 'F');

      // Label
      doc.setFontSize(8);
      doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
      doc.setFont('helvetica', 'normal');
      const labelText = metric.label.toUpperCase();
      const labelLines = doc.splitTextToSize(labelText, width - 10);
      doc.text(labelLines, x + 5, y + 8);

      // Value
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      if (metric.positive) {
        doc.setTextColor(COLORS.success.r, COLORS.success.g, COLORS.success.b);
      } else if (metric.negative) {
        doc.setTextColor(COLORS.danger.r, COLORS.danger.g, COLORS.danger.b);
      } else {
        doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
      }

      // Truncate value if too long
      let valueText = metric.value;
      const maxValueWidth = width - 10;
      while (doc.getTextWidth(valueText) > maxValueWidth && valueText.length > 5) {
        valueText = valueText.slice(0, -1);
      }
      doc.text(valueText, x + 5, y + height - 6);
    };

    // Helper: Check page break and add new page if needed
    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 25) {
        doc.addPage();
        y = 20;
        return true;
      }
      return false;
    };

    // Helper: Add footers to all pages
    const addFooters = () => {
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const footerY = pageHeight - 12;

        // Separator line
        doc.setDrawColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
        doc.setLineWidth(0.3);
        doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

        // Footer text
        doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('ROI Calculate | roicalculate.com', margin, footerY);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
      }
    };

    // Color map for sections
    const colorMap: Record<string, number[]> = {
      emerald: [COLORS.primary.r, COLORS.primary.g, COLORS.primary.b],
      cyan: [6, 182, 212],
      orange: [249, 115, 22],
      red: [COLORS.danger.r, COLORS.danger.g, COLORS.danger.b],
      purple: [168, 85, 247],
      blue: [59, 130, 246],
    };

    // ============ PAGE 1: Cover & Summary ============
    y = drawHeader();
    y = drawTitleSection(y);
    y = drawRatingCard(y);

    // Find first metrics section for cover page
    const firstMetricsSection = reportData.sections.find(s => s.type === 'metrics');
    if (firstMetricsSection && Array.isArray(firstMetricsSection.data)) {
      const color = colorMap[firstMetricsSection.color || 'emerald'];
      y = drawSectionTitle(firstMetricsSection.title, color, y);

      const metrics = firstMetricsSection.data as ReportMetric[];
      const cols = 2;
      const cardWidth = (contentWidth - 8) / cols;
      const cardHeight = 28;
      const gap = 8;

      let col = 0;
      let rowY = y;

      for (const metric of metrics) {
        if (checkPageBreak(cardHeight + 5)) {
          rowY = y;
          col = 0;
        }

        const x = margin + col * (cardWidth + gap);
        drawMetricCard(metric, x, rowY, cardWidth, cardHeight);

        col++;
        if (col >= cols) {
          col = 0;
          rowY += cardHeight + 6;
        }
      }
      y = rowY + (col > 0 ? cardHeight + 6 : 0) + 10;
    }

    // ============ PAGE 2+: Detailed Sections ============
    for (const section of reportData.sections) {
      // Skip first metrics section (already on cover)
      if (section === firstMetricsSection) continue;

      const color = colorMap[section.color || 'emerald'];

      checkPageBreak(50);
      y = drawSectionTitle(section.title, color, y);

      // Metrics section
      if (section.type === 'metrics' && Array.isArray(section.data)) {
        const metrics = section.data as ReportMetric[];
        const cols = 2;
        const cardWidth = (contentWidth - 8) / cols;
        const cardHeight = 28;
        const gap = 8;

        let col = 0;
        let rowY = y;

        for (const metric of metrics) {
          if (checkPageBreak(cardHeight + 5)) {
            rowY = y;
            col = 0;
          }

          const x = margin + col * (cardWidth + gap);
          drawMetricCard(metric, x, rowY, cardWidth, cardHeight);

          col++;
          if (col >= cols) {
            col = 0;
            rowY += cardHeight + 6;
          }
        }
        y = rowY + (col > 0 ? cardHeight + 6 : 0) + 10;
      }

      // Table section
      if (section.type === 'table' && Array.isArray(section.data)) {
        const rows = section.data as ReportTableRow[];
        if (rows.length > 0) {
          const numCols = rows[0].cells.length;
          const colWidth = contentWidth / numCols;
          const rowHeight = 8;

          // Table border
          doc.setDrawColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
          doc.setLineWidth(0.3);

          // Header row
          doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
          doc.rect(margin, y, contentWidth, rowHeight, 'F');
          doc.rect(margin, y, contentWidth, rowHeight, 'S');

          doc.setFontSize(9);
          doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
          doc.setFont('helvetica', 'bold');

          rows[0].cells.forEach((cell, i) => {
            doc.text(cell.toUpperCase(), margin + i * colWidth + 4, y + 5.5);
          });
          y += rowHeight;

          // Data rows
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);

          const maxRows = 25;
          for (let i = 1; i < Math.min(rows.length, maxRows); i++) {
            if (checkPageBreak(rowHeight + 2)) {
              // Redraw header on new page
              doc.setFillColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
              doc.rect(margin, y, contentWidth, rowHeight, 'F');
              doc.rect(margin, y, contentWidth, rowHeight, 'S');
              doc.setFont('helvetica', 'bold');
              rows[0].cells.forEach((cell, j) => {
                doc.text(cell.toUpperCase(), margin + j * colWidth + 4, y + 5.5);
              });
              y += rowHeight;
              doc.setFont('helvetica', 'normal');
            }

            // Alternating row background
            if (i % 2 === 0) {
              doc.setFillColor(250, 250, 252);
              doc.rect(margin, y, contentWidth, rowHeight, 'F');
            }

            // Row border
            doc.setDrawColor(COLORS.mediumGray.r, COLORS.mediumGray.g, COLORS.mediumGray.b);
            doc.rect(margin, y, contentWidth, rowHeight, 'S');

            doc.setFontSize(9);
            rows[i].cells.forEach((cell, j) => {
              // Truncate if too long
              let cellText = cell;
              const maxCellWidth = colWidth - 8;
              while (doc.getTextWidth(cellText) > maxCellWidth && cellText.length > 3) {
                cellText = cellText.slice(0, -1);
              }
              doc.text(cellText, margin + j * colWidth + 4, y + 5.5);
            });
            y += rowHeight;
          }

          if (rows.length > maxRows) {
            doc.setTextColor(COLORS.gray.r, COLORS.gray.g, COLORS.gray.b);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.text(`+ ${rows.length - maxRows} additional rows`, margin + 4, y + 6);
            y += 10;
          }
          y += 8;
        }
      }

      // Highlight section
      if (section.type === 'highlight' && typeof section.data === 'string') {
        checkPageBreak(24);

        // Background with accent border
        doc.setFillColor(240, 253, 244);
        doc.roundedRect(margin, y, contentWidth, 20, 3, 3, 'F');
        doc.setFillColor(color[0], color[1], color[2]);
        doc.roundedRect(margin, y, 4, 20, 2, 2, 'F');

        doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const highlightLines = doc.splitTextToSize(section.data, contentWidth - 20);
        doc.text(highlightLines, margin + 12, y + 12);
        y += 28;
      }

      // Text section
      if (section.type === 'text' && typeof section.data === 'string') {
        checkPageBreak(20);
        doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(section.data, contentWidth);
        doc.text(lines, margin, y + 5);
        y += lines.length * 5 + 12;
      }
    }

    // Add footers to all pages
    addFooters();

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

      // Debug logging
      console.log('Email payload:', {
        email: trimmed,
        fileName,
        reportType: reportData.title,
        pdfBase64Length: pdfBase64?.length || 0,
      });

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
                  className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder:text-zinc-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none [&:-webkit-autofill]:bg-zinc-800 [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#27272a_inset] [&:-webkit-autofill]:border-zinc-700"
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
