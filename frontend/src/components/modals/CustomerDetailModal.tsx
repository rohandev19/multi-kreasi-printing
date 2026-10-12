import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import {
  Envelope,
  ShoppingBag,
  CreditCard,
  Phone,
  Medal,
  ShieldCheck,
  PencilSimple,
} from '@phosphor-icons/react';
import { CustomerCreditTermsModal } from './CustomerCreditTermsModal';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  customerId
}) => {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/api/v1/customers/${customerId}`);
        setCustomer(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat detail pelanggan');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && customerId) {
      fetchCustomer();
    } else {
      setCustomer(null);
      setError('');
    }
  }, [isOpen, customerId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const tierColors: Record<string, string> = {
    Standard: 'bg-slate-100 text-slate-700',
    Silver: 'bg-gray-200 text-gray-800',
    Gold: 'bg-amber-100 text-amber-700',
    Platinum: 'bg-slate-900 text-white',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profil Pelanggan" size="md">
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>
        ) : customer ? (
          <div className="space-y-6">
            {/* Header block */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{customer.companyName || customer.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5"><Envelope size={16} className="text-slate-400" weight="regular" /> {customer.email}</div>
                  {customer.phone && <div className="flex items-center gap-1.5"><Phone size={16} className="text-slate-400" weight="regular" /> {customer.phone}</div>}
                </div>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${tierColors[customer.loyaltyTier || 'Standard'] || tierColors.Standard}`}>
                <Medal size={14} weight="regular" />
                {customer.loyaltyTier || 'Standard'}
              </span>
            </div>

            <hr className="border-slate-100" />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <ShoppingBag size={16} weight="regular" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Pesanan</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{customer.totalOrders || 0}</div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <CreditCard size={16} weight="regular" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Pengeluaran</span>
                </div>
                <div className="text-xl font-bold text-slate-900">{formatCurrency(customer.totalRevenue || 0)}</div>
              </div>
            </div>

            {/* Credit & TOP Profile Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-slate-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Fasilitas Kredit & Term of Payment (TOP)
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      customer.creditStatus === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : customer.creditStatus === 'ON_HOLD'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {customer.creditStatus || 'ACTIVE'}
                  </span>
                  <button
                    onClick={() => setIsCreditModalOpen(true)}
                    className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                    title="Ubah Ketentuan Kredit"
                  >
                    <PencilSimple size={15} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 text-xs">
                <div>
                  <p className="text-slate-500">Plafon Kredit</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {formatCurrency(Number(customer.creditLimit || 0))}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Term of Payment</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {customer.paymentTermDays > 0
                      ? `${customer.paymentTermDays} Hari`
                      : 'Cash / Segera'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Sisa Plafon</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {formatCurrency(
                      Math.max(
                        0,
                        Number(customer.creditLimit || 0) -
                          Number(customer.outstandingBalance || 0),
                      ),
                    )}
                  </p>
                </div>
              </div>

              {customer.creditNotes && (
                <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="font-medium text-slate-700">Catatan Kredit: </span>
                  {customer.creditNotes}
                </div>
              )}
            </div>

            {/* Outstanding Balance Warning */}
            {customer.outstandingBalance > 0 && (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-red-800">Sisa Tagihan Tertunggak</h4>
                  <p className="text-xs text-red-600">Perlu segera dilunasi</p>
                </div>
                <div className="text-lg font-bold text-red-700">
                  {formatCurrency(customer.outstandingBalance)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">Data pelanggan tidak ditemukan.</div>
        )}
      </div>
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center rounded-b-xl">
        {customer && (
          <button
            onClick={() => setIsCreditModalOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <PencilSimple size={14} />
            Kelola Plafon & Kredit
          </button>
        )}
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors ml-auto"
        >
          Tutup
        </button>
      </div>

      {/* Credit Terms Edit Modal */}
      {customer && (
        <CustomerCreditTermsModal
          isOpen={isCreditModalOpen}
          customer={{
            id: customer.id,
            companyName: customer.companyName || customer.name,
            creditLimit: Number(customer.creditLimit || 0),
            paymentTermDays: Number(customer.paymentTermDays || 0),
            creditStatus: customer.creditStatus || 'ACTIVE',
            creditNotes: customer.creditNotes,
            currentOutstanding: Number(customer.outstandingBalance || 0),
          }}
          onClose={() => setIsCreditModalOpen(false)}
          onSuccess={async () => {
            const res = await api.get(`/api/v1/customers/${customerId}`);
            setCustomer(res.data);
          }}
        />
      )}
    </Modal>
  );
};
