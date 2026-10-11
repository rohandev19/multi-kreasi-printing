import { useState, useEffect } from 'react';
import { Plus, MagnifyingGlass, Funnel, Calendar, FileText, CheckCircle, TrendUp, CaretDown, CaretLeft, CaretRight, Eye, PencilSimple, PaperPlaneTilt, Copy, Trash, Clock, XCircle, ShoppingBag, Download, Users } from '@phosphor-icons/react';
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
  const [isConverting, setIsConverting] = useState(false);
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Draft':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600"><PencilSimple size={12} weight="regular" /> Draf</span>;
      case 'Sent':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-700"><PaperPlaneTilt size={12} weight="regular" /> Terkirim</span>;
      case 'Viewed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-100 text-primary-700"><Eye size={12} weight="regular" /> Dilihat</span>;
      case 'Accepted':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle size={12} weight="regular" /> Diterima</span>;
      case 'Declined':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle size={12} weight="regular" /> Ditolak</span>;
      case 'Expired':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500"><Clock size={12} weight="regular" /> Kedaluwarsa</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const [quotations, setQuotations] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const res = await api.get('/api/v1/quotations');
      setQuotations(res.data);
    } catch (err: any) {
      console.error(err);
      setQuotations([]);
    }
  };

  const getItemsSummary = (items: { product?: { name?: string }; quantity?: number }[]) => {
    if (!items || items.length === 0) return 'Tidak ada item';
    const firstItem = items[0];
    const name = firstItem.product?.name || 'Item';
    const qty = firstItem.quantity || 0;
    if (items.length > 1) {
      return `${name} × ${qty}, +${items.length - 1} lainnya`;
    }
    return `${name} × ${qty}`;
  };

  const totalPages = Math.ceil(quotations.length / itemsPerPage);
  const paginatedQuotations = quotations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleConvertToOrder = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin mengubah penawaran ini menjadi pesanan produksi?')) return;
    setIsConverting(true);
    try {
      const res = await api.post(`/api/v1/quotations/${id}/convert`);
      success('Berhasil Diubah', 'Penawaran berhasil diubah menjadi pesanan produksi.');
      fetchQuotations(); // Refresh list
      // Optionally navigate to the new order
      navigate(`/dashboard/orders/${res.data.id}`);
    } catch (err: any) {
      showError('Gagal Mengubah', err.response?.data?.message || 'Gagal mengubah penawaran menjadi pesanan');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Penawaran Harga</h1>
          <p className="text-sm text-slate-500 mt-1">Buat dan kelola penawaran harga untuk klien</p>
        </div>
        <button
          onClick={() => {
            setSelectedQuotation(null);
            setIsCreateModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold rounded-xl shadow-sm hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all active:scale-95"
        >
          <Plus size={18} weight="regular" />
          Buat Penawaran
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <FileText size={24} weight="regular" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Penawaran Menunggu</p>
            <h3 className="text-2xl font-extrabold text-slate-900">24</h3>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle size={24} weight="regular" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Diterima Bulan Ini</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-extrabold text-slate-900">18</h3>
              <span className="text-sm font-bold text-emerald-600">{formatCurrency(145000000)}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
            <TrendUp size={24} weight="regular" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tingkat Konversi</p>
            <h3 className="text-2xl font-extrabold text-slate-900">68%</h3>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          
          <div className="flex-1 w-full lg:w-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlass className="h-4 w-4 text-slate-400" weight="regular" />
              </div>
              <input
                type="text"
                placeholder="Cari penawaran..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Funnel className="h-4 w-4 text-slate-400" weight="regular" />
              </div>
              <select className="block w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-primary-600 appearance-none text-slate-700">
                <option value="">Semua Status</option>
                <option value="Draft">Draf</option>
                <option value="Sent">Terkirim</option>
                <option value="Viewed">Dilihat</option>
                <option value="Accepted">Diterima</option>
                <option value="Declined">Ditolak</option>
                <option value="Expired">Kedaluwarsa</option>
              </select>
              <CaretDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" weight="regular" />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-slate-400" weight="regular" />
              </div>
              <select className="block w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-primary-600 appearance-none text-slate-700">
                <option>Semua Waktu</option>
                <option>Bulan Ini</option>
                <option>30 Hari Terakhir</option>
              </select>
              <CaretDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" weight="regular" />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-4 w-4 text-slate-400" weight="regular" />
              </div>
              <select className="block w-full pl-10 pr-10 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-primary-600 appearance-none text-slate-700">
                <option value="">Semua Staf Penjualan</option>
                <option value="John">John Sales</option>
                <option value="Sarah">Sarah Manager</option>
              </select>
              <CaretDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" weight="regular" />
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">No. Penawaran</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pelanggan</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Ringkasan Item</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total Nilai</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Berlaku Sampai</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {paginatedQuotations.map((quo) => (
                <tr key={quo.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono font-bold text-primary-600 hover:underline cursor-pointer" onClick={() => { setSelectedQuotation(quo.id); setIsDetailModalOpen(true); }}>
                      {quo.quotationNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-900">{quo.customer?.companyName || 'Tidak Diketahui'}</div>
                    <div className="text-xs text-slate-500">{quo.customer?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell truncate max-w-[200px]" title={getItemsSummary(quo.items)}>
                    {getItemsSummary(quo.items)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-mono font-bold ${quo.status === 'Expired' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {formatCurrency(quo.totalAmount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`text-slate-600`}>
                      {quo.validUntil ? new Date(quo.validUntil).toLocaleDateString('id-ID') : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(quo.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedQuotation(quo.id); setIsDetailModalOpen(true); }}
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Lihat Penawaran"
                      >
                        <Eye size={18} weight="regular" />
                      </button>
                      
                      {quo.status === 'Draft' && (
                        <>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Ubah Penawaran"
                            onClick={() => { setSelectedQuotation(quo.id); setIsCreateModalOpen(true); }}
                          >
                            <PencilSimple size={18} weight="regular" />
                          </button>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Kirim ke Pelanggan"
                          >
                            <PaperPlaneTilt size={18} weight="regular" />
                          </button>
                          <button 
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                            onClick={() => setIsDeleteModalOpen(true)}
                          >
                            <Trash size={18} weight="regular" />
                          </button>
                        </>
                      )}

                      {quo.status === 'Accepted' && (
                        <button 
                          onClick={() => handleConvertToOrder(quo.id)}
                          disabled={isConverting}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Ubah Menjadi Pesanan"
                        >
                          <ShoppingBag size={18} weight="regular" />
                        </button>
                      )}

                      <button 
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Unduh PDF"
                      >
                        <Download size={18} weight="regular" />
                      </button>

                      <button 
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Duplikat"
                      >
                        <Copy size={18} weight="regular" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Menampilkan <span className="font-bold text-slate-900">{quotations.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> sampai <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, quotations.length)}</span> dari <span className="font-bold text-slate-900">{quotations.length}</span> penawaran
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 disabled:opacity-50 transition-colors"
            >
              <CaretLeft size={18} weight="regular" />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
            >
              <CaretRight size={18} weight="regular" />
            </button>
          </div>
        </div>
      </div>

      <CreateQuotationModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        quotationId={selectedQuotation} 
      />

      <QuotationDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        quotationId={selectedQuotation} 
      />

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title="Hapus Penawaran"
        message="Apakah Anda yakin ingin menghapus draf penawaran ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={() => setIsDeleteModalOpen(false)}
        onClose={() => setIsDeleteModalOpen(false)}
        variant="danger"
      />

    </div>
  );

}
