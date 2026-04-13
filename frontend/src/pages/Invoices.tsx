import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { InvoicesTable } from '../components/tables/InvoicesTable';

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
    alert(`Download invoice ${id}`);
  };

  const handleViewDetails = (id: string) => {
    alert(`View details for invoice ${id}`);
  };

  const handleRecordPayment = async (id: string) => {
    try {
      await api.post(`/api/v1/invoices/${id}/payment`, { amount: 0, method: 'Transfer' }); // Dummy amount for now
      alert(`Payment recorded for invoice ${id}`);
      fetchInvoices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record payment');
    }
  };

  const handleSendReminder = (id: string) => {
    alert(`Send reminder for invoice ${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      alert(`Delete invoice ${id}`);
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isCustomer = role === 'Customer';
  const canManage = role === 'Owner' || role === 'Manager' || role === 'Finance_Staff';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">
          {isCustomer ? 'My Invoices' : 'Invoices'}
        </h2>
        {canManage && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Create Invoice
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
    </div>
  );
}
