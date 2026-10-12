import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  MagnifyingGlass,
  Funnel,
  CheckCircle,
  TrendUp,
  CaretDown,
  CaretLeft,
  CaretRight,
  Eye,
  PencilSimple,
  PaperPlaneTilt,
  Trash,
  Clock,
  XCircle,
  ShoppingBag,
  Hourglass,
  ArrowSquareOut,
} from '@phosphor-icons/react';
import CreateQuotationModal from '../components/modals/CreateQuotationModal';
import QuotationDetailModal from '../components/modals/QuotationDetailModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Quotations() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const [selectedQuotation, setSelectedQuotation] = useState<string | null>(null);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/quotations');
      setQuotations(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error(err);
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
            <PencilSimple size={12} weight="regular" /> Draf
          </span>
        );
      case 'Pending_Manager_Approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Hourglass size={12} weight="bold" /> ACC Manager
          </span>
        );
      case 'Sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            <PaperPlaneTilt size={12} weight="regular" /> Terkirim
          </span>
        );
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle size={12} weight="bold" /> PO Diterima
          </span>
        );
      case 'Converted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
            <ShoppingBag size={12} weight="bold" /> Jadi Pesanan
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
            <XCircle size={12} weight="regular" /> Ditolak
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
            <Clock size={12} weight="regular" /> Kedaluwarsa
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  const getItemsSummary = (items: any[]) => {
    if (!items || items.length === 0) return 'Tidak ada item';
    const firstItem = items[0];
    const name = firstItem.product?.name || 'Item Percetakan';
    const qty = firstItem.quantity || 0;
    if (items.length > 1) {
      return `${name} × ${qty}, +${items.length - 1} lainnya`;
    }
    return `${name} × ${qty}`;
  };

  // Filtered Quotations
  const filteredQuotations = useMemo(() => {
    return quotations.filter((quo) => {
      const qNum = quo.quotationNumber?.toLowerCase() || '';
      const cName = quo.customer?.companyName?.toLowerCase() || quo.customer?.name?.toLowerCase() || '';
      const po = quo.poNumber?.toLowerCase() || '';
      const matchSearch = !searchQuery || qNum.includes(searchQuery.toLowerCase()) || cName.includes(searchQuery.toLowerCase()) || po.includes(searchQuery.toLowerCase());
      const matchStatus = !statusFilter || quo.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [quotations, searchQuery, statusFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const pendingApproval = quotations.filter((q) => q.status === 'Pending_Manager_Approval').length;
    const acceptedOrConverted = quotations.filter((q) => q.status === 'Accepted' || q.status === 'Converted');
    const acceptedCount = acceptedOrConverted.length;
    const acceptedSum = acceptedOrConverted.reduce((acc, q) => acc + Number(q.totalAmount || 0), 0);
    const conversionRate = quotations.length ? Math.round((acceptedCount / quotations.length) * 100) : 0;
    return { pendingApproval, acceptedCount, acceptedSum, conversionRate };
  }, [quotations]);

  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const paginatedQuotations = filteredQuotations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleConvertToOrder = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin mengubah penawaran ini menjadi pesanan produksi resmi?')) return;
    setIsConverting(true);
    try {
      const res = await api.post(`/api/v1/quotations/${id}/convert`);
      success('Berhasil Dikonversi', 'Penawaran berhasil diubah menjadi pesanan produksi.');
      fetchQuotations();
      navigate(`/dashboard/orders/${res.data.id}`);
    } catch (err: any) {
      showError('Gagal Mengubah', err.response?.data?.message || 'Gagal mengubah penawaran menjadi pesanan.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDeleteQuotation = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/api/v1/quotations/${deleteTargetId}`);
      success('Dihapus', 'Penawaran telah berhasil dihapus.');
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
      fetchQuotations();
    } catch (err: any) {
      showError('Gagal Menghapus', err.response?.data?.message || 'Tidak dapat menghapus penawaran.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Penawaran Harga (Quotations)</h1>
          <p className="text-sm text-slate-500 mt-1">
            Workflow penawaran B2B, matriks approval diskon manager, verifikasi PO, dan konversi ke pesanan produksi.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedQuotation(null);
            setIsCreateModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-xl shadow-sm hover:bg-slate-800 transition-all active:scale-95"
        >
          <Plus size={18} weight="bold" />
          Buat Penawaran Baru
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <Hourglass size={24} weight="fill" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Menunggu ACC Manager</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="text-2xl font-extrabold text-slate-900">{metrics.pendingApproval}</h3>
              <span className="text-xs text-amber-700 font-semibold">Diskon &gt; 10%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle size={24} weight="fill" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total PO Diterima</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="text-2xl font-extrabold text-slate-900">{metrics.acceptedCount}</h3>
              <span className="text-xs font-bold font-mono text-emerald-700">{formatCurrency(metrics.acceptedSum)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
            <TrendUp size={24} weight="bold" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tingkat Konversi PO</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="text-2xl font-extrabold text-slate-900">{metrics.conversionRate}%</h3>
              <span className="text-xs text-slate-400">dari {quotations.length} penawaran</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full sm:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlass className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Cari no. penawaran, nama pelanggan, atau nomor PO..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div className="relative w-full sm:w-60">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Funnel className="h-4 w-4 text-slate-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full pl-10 pr-8 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-slate-900 appearance-none text-slate-700 font-medium"
              >
                <option value="">Semua Status</option>
                <option value="Pending_Manager_Approval">Menunggu ACC Manager</option>
                <option value="Sent">Terkirim ke Klien</option>
                <option value="Accepted">PO Diterima</option>
                <option value="Converted">Dikonversi Pesanan</option>
                <option value="Rejected">Ditolak</option>
                <option value="Draft">Draf</option>
              </select>
              <CaretDown className="absolute right-3 top-3 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* QUOTATIONS TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  No. Penawaran & PO
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden md:table-cell">
                  Item Cetak
                </th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Total Nilai
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Berlaku Sampai
                </th>
                <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                      <span>Memuat data penawaran...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                    Tidak ada penawaran harga yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                paginatedQuotations.map((quo) => (
                  <tr key={quo.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-mono font-bold text-primary-600 hover:underline cursor-pointer"
                          onClick={() => {
                            setSelectedQuotation(quo.id);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          {quo.quotationNumber}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                          v{quo.version || 1}
                        </span>
                      </div>
                      {quo.poNumber && (
                        <div className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                          <CheckCircle size={12} weight="bold" /> PO: {quo.poNumber}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">
                        {quo.customer?.companyName || quo.customer?.name || 'Klien'}
                      </div>
                      <div className="text-xs text-slate-500">{quo.customer?.email}</div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell truncate max-w-[200px]" title={getItemsSummary(quo.items)}>
                      {getItemsSummary(quo.items)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-mono font-bold text-slate-900 block">
                        {formatCurrency(quo.totalAmount)}
                      </span>
                      {Number(quo.discountPercent || 0) > 0 && (
                        <span className="text-[11px] font-mono text-rose-600 block">
                          Diskon {quo.discountPercent}%
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-600">
                      {quo.validUntil ? new Date(quo.validUntil).toLocaleDateString('id-ID') : '-'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(quo.status)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => {
                            setSelectedQuotation(quo.id);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Lihat Detail & Aksi"
                        >
                          <Eye size={18} weight="bold" />
                        </button>

                        {quo.status === 'Accepted' && (
                          <button 
                            onClick={() => handleConvertToOrder(quo.id)}
                            disabled={isConverting}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Konversi ke Pesanan Produksi"
                          >
                            <ShoppingBag size={18} weight="bold" />
                          </button>
                        )}

                        {quo.status === 'Converted' && quo.orderId && (
                          <button 
                            onClick={() => navigate(`/dashboard/orders/${quo.orderId}`)}
                            className="p-1.5 text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Buka Pesanan Terkait"
                          >
                            <ArrowSquareOut size={18} weight="bold" />
                          </button>
                        )}

                        {quo.status === 'Draft' && (
                          <button 
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Draf"
                            onClick={() => {
                              setDeleteTargetId(quo.id);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Trash size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan <span className="font-bold text-slate-900">{filteredQuotations.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> sampai <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredQuotations.length)}</span> dari <span className="font-bold text-slate-900">{filteredQuotations.length}</span> penawaran
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40"
            >
              <CaretLeft size={14} />
            </button>
            <span className="px-3 py-1 font-bold text-slate-800">
              {currentPage} / {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40"
            >
              <CaretRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      <CreateQuotationModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        quotationId={selectedQuotation}
        onSuccess={fetchQuotations}
      />

      {/* DETAIL & ACTION MODAL */}
      <QuotationDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)}
        quotationId={selectedQuotation}
        onRefresh={fetchQuotations}
      />

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title="Hapus Penawaran"
        message="Apakah Anda yakin ingin menghapus penawaran draf ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={handleDeleteQuotation}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
        variant="danger"
      />
    </div>
  );
}
