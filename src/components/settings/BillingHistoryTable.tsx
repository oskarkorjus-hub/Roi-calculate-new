import type { Invoice } from '../../types/billing';
import { formatCurrency, formatDate } from '../../lib/billing-service';

interface BillingHistoryTableProps {
  invoices: Invoice[];
}

export function BillingHistoryTable({ invoices }: BillingHistoryTableProps) {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-400">
        <svg
          className="w-12 h-12 mx-auto mb-4 text-zinc-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p>No billing history yet</p>
        <p className="text-sm text-zinc-500 mt-1">
          Your invoices will appear here after your first payment.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-zinc-400 border-b border-zinc-800">
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Description</th>
            <th className="pb-3 font-medium">Amount</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium text-right">Invoice</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-b border-zinc-800/50">
              <td className="py-4 text-zinc-300">
                {formatDate(invoice.date)}
              </td>
              <td className="py-4 text-white">
                {invoice.description}
              </td>
              <td className="py-4 text-white font-medium">
                {formatCurrency(invoice.amount)}
              </td>
              <td className="py-4">
                <StatusBadge status={invoice.status} />
              </td>
              <td className="py-4 text-right">
                {invoice.downloadUrl ? (
                  <button
                    onClick={() => {
                      // In a real app, this would download the invoice
                      alert('Demo: Invoice download triggered');
                    }}
                    className="text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </button>
                ) : (
                  <span className="text-zinc-500">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: Invoice['status'] }) {
  const styles = {
    paid: 'bg-emerald-500/20 text-emerald-400',
    pending: 'bg-amber-500/20 text-amber-400',
    failed: 'bg-red-500/20 text-red-400',
  };

  const labels = {
    paid: 'Paid',
    pending: 'Pending',
    failed: 'Failed',
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status === 'paid' && (
        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {labels[status]}
    </span>
  );
}
