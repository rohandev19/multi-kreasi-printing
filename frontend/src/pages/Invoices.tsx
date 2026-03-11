import { useEffect, useState } from 'react';
import api from '../api/axios';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: { companyName: string };
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-700',
  Sent: 'bg-blue-100 text-blue-700',
  Partially_Paid: 'bg-amber-100 text-amber-700',
  Fully_Paid: 'bg-emerald-100 text-emerald-700',
  Overdue: 'bg-red-100 text-red-700',
  Cancelled: 'bg-slate-100 text-slate-700',
};

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/api/v1/invoices');
      setInvoices(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'Fully_Paid' && status !== 'Cancelled';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Invoices</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Invoice Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-base font-medium text-slate-700">No invoices yet</p>
                      <p className="text-sm text-slate-500">Invoices will be generated automatically when orders are completed</p>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => {
                  const overdueStatus = isOverdue(invoice.dueDate, invoice.status);
                  return (
                    <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {invoice.customer?.companyName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-right tabular-nums font-semibold text-slate-900">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${overdueStatus ? statusColors['Overdue'] : statusColors[invoice.status] || 'bg-gray-100 text-gray-700'}`}>
                          {overdueStatus ? 'Overdue' : formatStatus(invoice.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(invoice.dueDate).toLocaleDateString('id-ID')}
                        {overdueStatus && (
                          <span className="ml-2 text-red-600 text-xs font-medium">
                            ({Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 3600 * 24))} days)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
