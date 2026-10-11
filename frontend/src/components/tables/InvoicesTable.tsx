import React from 'react';
import { Download, CreditCard, Bell, Trash, Eye } from '@phosphor-icons/react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: { companyName: string };
  order?: { orderNumber: string };
  amount: number;
  status: string;
  dueDate: string;
}

interface InvoicesTableProps {
  invoices: Invoice[];
  userRole: string;
  loading: boolean;
  onDownload: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onRecordPayment?: (id: string) => void;
  onSendReminder?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  Draft: { label: 'Draf', color: 'bg-gray-100 text-gray-700' },
  Sent: { label: 'Terkirim', color: 'bg-slate-100 text-slate-900' },
  Partially_Paid: { label: 'Dibayar Sebagian', color: 'bg-amber-100 text-amber-700' },
  Fully_Paid: { label: 'Lunas', color: 'bg-emerald-100 text-emerald-700' },
  Overdue: { label: 'Jatuh Tempo', color: 'bg-red-100 text-red-700' },
  Cancelled: { label: 'Dibatalkan', color: 'bg-slate-100 text-slate-700' },
};

export const InvoicesTable: React.FC<InvoicesTableProps> = ({
  invoices,
  userRole,
  loading,
  onDownload,
  onViewDetails,
  onRecordPayment,
  onSendReminder,
  onDelete,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const formatStatus = (status: string) => {
    return statusConfig[status]?.label || status.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isCustomer = userRole === 'Customer';
  const isFinance = userRole === 'Finance_Staff';
  const isOwner = userRole === 'Owner';
  const canManage = isOwner || userRole === 'Manager' || isFinance;

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3 flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-slate-900">{invoice.invoiceNumber}</div>
                <div className="text-xs text-slate-500">
                  Jatuh Tempo: {new Date(invoice.dueDate).toLocaleDateString('id-ID')}
                </div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusConfig[invoice.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                {formatStatus(invoice.status)}
              </span>
            </div>
            
            <div className="text-sm space-y-1">
              {!isCustomer && (
                <div>
                  <span className="text-slate-500 mr-2">Pelanggan:</span>
                  <span className="font-medium text-slate-900">{invoice.customer?.companyName || '-'}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500 mr-2">Pesanan:</span>
                <span className="text-slate-900">{invoice.order?.orderNumber || '-'}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center border-t border-slate-100 pt-3">
              <span className="text-sm text-slate-500 font-medium">Jumlah:</span>
              <span className="font-bold text-slate-900">{formatCurrency(invoice.amount)}</span>
            </div>
            
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              {isCustomer ? (
                <button
                  onClick={() => onDownload(invoice.id)}
                  className="p-1.5 text-slate-400 hover:text-black hover:bg-slate-100 rounded-lg transition-colors"
                  title="Unduh Faktur"
                >
                  <Download size={18} weight="regular" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onViewDetails?.(invoice.id)}
                    className="p-1.5 text-slate-400 hover:text-black hover:bg-slate-100 rounded-lg transition-colors"
                    title="Lihat Detail"
                  >
                    <Eye size={18} weight="regular" />
                  </button>
                  <button
                    onClick={() => onDownload(invoice.id)}
                    className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Unduh Faktur"
                  >
                    <Download size={18} weight="regular" />
                  </button>
                  
                  {canManage && invoice.status !== 'Fully_Paid' && (
                    <button
                      onClick={() => onRecordPayment?.(invoice.id)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Catat Pembayaran"
                    >
                      <CreditCard size={18} weight="regular" />
                    </button>
                  )}
                  
                  {canManage && (invoice.status === 'Sent' || invoice.status === 'Overdue') && (
                    <button
                      onClick={() => onSendReminder?.(invoice.id)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Kirim Pengingat"
                    >
                      <Bell size={18} weight="regular" />
                    </button>
                  )}
                  
                  {isOwner && onDelete && (
                    <button
                      onClick={() => onDelete(invoice.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Faktur"
                    >
                      <Trash size={18} weight="regular" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
        {invoices.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            Tidak ada faktur ditemukan.
          </div>
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Nomor Faktur
              </th>
              {!isCustomer && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Pelanggan
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Pesanan
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Jumlah
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Jatuh Tempo
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={isCustomer ? 6 : 7} className="px-6 py-12 text-center text-slate-500">
                  Tidak ada faktur ditemukan.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {invoice.invoiceNumber}
                  </td>
                  {!isCustomer && (
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {invoice.customer?.companyName || '-'}
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {invoice.order?.orderNumber || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right tabular-nums font-medium text-slate-900">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[invoice.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                      {formatStatus(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(invoice.dueDate).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {isCustomer ? (
                      <button
                        onClick={() => onDownload(invoice.id)}
                        className="p-1 text-slate-400 hover:text-black transition-colors"
                        title="Unduh Faktur"
                      >
                        <Download size={18} weight="regular" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => onViewDetails?.(invoice.id)}
                          className="p-1 text-slate-400 hover:text-black transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye size={18} weight="regular" />
                        </button>
                        <button
                          onClick={() => onDownload(invoice.id)}
                          className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
                          title="Unduh Faktur"
                        >
                          <Download size={18} weight="regular" />
                        </button>
                        
                        {canManage && invoice.status !== 'Fully_Paid' && (
                          <button
                            onClick={() => onRecordPayment?.(invoice.id)}
                            className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Catat Pembayaran"
                          >
                            <CreditCard size={18} weight="regular" />
                          </button>
                        )}
                        
                        {canManage && (invoice.status === 'Sent' || invoice.status === 'Overdue') && (
                          <button
                            onClick={() => onSendReminder?.(invoice.id)}
                            className="p-1 text-slate-400 hover:text-amber-600 transition-colors"
                            title="Kirim Pengingat"
                          >
                            <Bell size={18} weight="regular" />
                          </button>
                        )}
                        
                        {isOwner && onDelete && (
                          <button
                            onClick={() => onDelete(invoice.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="Hapus Faktur"
                          >
                            <Trash size={18} weight="regular" />
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
