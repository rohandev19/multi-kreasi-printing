import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { InvoicesTable } from '../components/tables/InvoicesTable';
import { CreateInvoiceModal } from '../components/modals/CreateInvoiceModal';
import { InvoiceDetailModal } from '../components/modals/InvoiceDetailModal';
import { RecordPaymentModal } from '../components/modals/RecordPaymentModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: { companyName: string };
  order?: { orderNumber: string };
  amount: number;
  status: string;
  dueDate: string;
}

export default function Invoices() {
  const { role, loading: roleLoading } = useRoleContext();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { success, error: toastError } = useToast();

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailInvoiceId, setDetailInvoiceId] = useState<string | null>(null);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!roleLoading && role) {
      fetchInvoices();
    }
  }, [role, roleLoading]);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/api/v1/invoices');
      const invoiceData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
      setInvoices(invoiceData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (id: string) => {
    // Navigate to download endpoint or open detail modal
    setDetailInvoiceId(id);
  };

  const handleViewDetails = (id: string) => {
    setDetailInvoiceId(id);
  };

  const handleRecordPayment = (id: string) => {
    setPaymentInvoiceId(id);
  };

  const handleSendReminder = async (id: string) => {
    try {
      await api.post(`/api/v1/invoices/${id}/reminder`);
      success('Pengingat Terkirim', 'Pengingat pembayaran telah dikirim ke pelanggan.');
    } catch (err: any) {
      toastError('Gagal Mengirim Pengingat', err.response?.data?.message || 'Silakan coba lagi.');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteInvoiceId(id);
  };

  const confirmDelete = async () => {
    if (!deleteInvoiceId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/v1/invoices/${deleteInvoiceId}`);
      success('Faktur Dihapus', 'Faktur telah berhasil dihapus.');
      fetchInvoices();
    } catch (err: any) {
      toastError('Gagal Menghapus', err.response?.data?.message || 'Silakan coba lagi.');
    } finally {
      setIsDeleting(false);
      setDeleteInvoiceId(null);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isCustomer = role === 'Customer';
  const canManage = role === 'Owner' || role === 'Manager' || role === 'Finance_Staff';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">
          {isCustomer ? 'Faktur Saya' : 'Daftar Faktur'}
        </h2>
        {canManage && (
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Buat Faktur
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <InvoicesTable
        invoices={invoices}
        userRole={role || ''}
        loading={loading}
        onDownload={handleDownload}
        onViewDetails={handleViewDetails}
        onRecordPayment={handleRecordPayment}
        onSendReminder={handleSendReminder}
        onDelete={handleDelete}
      />

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchInvoices}
      />

      <InvoiceDetailModal
        isOpen={!!detailInvoiceId}
        invoiceId={detailInvoiceId}
        onClose={() => setDetailInvoiceId(null)}
      />

      <RecordPaymentModal
        isOpen={!!paymentInvoiceId}
        invoiceId={paymentInvoiceId}
        onClose={() => setPaymentInvoiceId(null)}
        onSuccess={fetchInvoices}
      />

      <ConfirmDialog
        isOpen={!!deleteInvoiceId}
        title="Hapus Faktur"
        message="Apakah Anda yakin ingin menghapus faktur ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="danger"
        loading={isDeleting}
        onClose={() => setDeleteInvoiceId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
