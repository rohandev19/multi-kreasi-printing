import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useToast } from '../contexts/ToastContext';
import { CreateTicketModal } from '../components/modals/CreateTicketModal';
import { TicketDetailModal } from '../components/modals/TicketDetailModal';
import {
  Lifebuoy,
  Plus,
  Funnel,
  Tag,
  Clock,
  WarningCircle,
  ChatCircleDots,
  MagnifyingGlass,
  ArrowClockwise,
} from '@phosphor-icons/react';

export const Tickets: React.FC = () => {
  const { error: toastError } = useToast();

  const [tickets, setTickets] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const [ticketsRes, metricsRes] = await Promise.all([
        api.get('/api/v1/tickets', { params }),
        api.get('/api/v1/tickets/metrics'),
      ]);

      setTickets(ticketsRes.data);
      setMetrics(metricsRes.data);
    } catch (err: any) {
      toastError('Gagal Memuat Tiket', err.response?.data?.message || 'Gagal memuat daftar tiket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, categoryFilter, priorityFilter]);

  const filteredTickets = useMemo(() => {
    if (!search.trim()) return tickets;
    const q = search.toLowerCase();
    return tickets.filter(
      (t) =>
        t.ticketNumber?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q) ||
        t.customer?.companyName?.toLowerCase().includes(q) ||
        t.user?.fullName?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q),
    );
  }, [tickets, search]);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; bg: string; text: string }> = {
      Open: { label: 'Terbuka', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
      Assigned: { label: 'Ditugaskan', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
      In_Progress: { label: 'Diproses', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
      Resolved: { label: 'Terselesaikan', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
      Closed: { label: 'Ditutup', bg: 'bg-neutral-100 border-neutral-300', text: 'text-neutral-700' },
      Reopened: { label: 'Dibuka Kembali', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
    };
    const c = config[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-700' };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { label: string; bg: string; text: string }> = {
      Low: { label: 'Low', bg: 'bg-neutral-100', text: 'text-neutral-700' },
      Normal: { label: 'Normal', bg: 'bg-sky-100', text: 'text-sky-800' },
      High: { label: 'High', bg: 'bg-orange-100', text: 'text-orange-800' },
      Urgent: { label: 'Urgent', bg: 'bg-rose-100 ring-1 ring-rose-400', text: 'text-rose-800 font-bold' },
    };
    const c = config[priority] || { label: priority, bg: 'bg-gray-100', text: 'text-gray-700' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs ${c.bg} ${c.text}`}>
        {priority === 'Urgent' && <WarningCircle size={12} weight="fill" className="animate-pulse" />}
        {c.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <Lifebuoy size={28} weight="bold" />
            <span>Pusat Bantuan &amp; Tiket Dukungan</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Kelola pengaduan pelanggan, lacak status kendala, dan koordinasi solusi layanan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTickets}
            className="p-2.5 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
            title="Muat Ulang Data"
          >
            <ArrowClockwise size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-black text-white hover:bg-neutral-800 text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={18} weight="bold" />
            <span>Buat Tiket Baru</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Total Tiket</span>
            <div className="text-2xl font-bold mt-1 text-[var(--text-primary)]">{metrics.total}</div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">Tiket Aktif</span>
            <div className="text-2xl font-bold mt-1 text-blue-700">{metrics.open}</div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Terselesaikan</span>
            <div className="text-2xl font-bold mt-1 text-emerald-700">{metrics.resolved}</div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Urgensi Tinggi</span>
            <div className="text-2xl font-bold mt-1 text-rose-700">{metrics.urgent}</div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] col-span-2 md:col-span-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">Rata-rata Resolusi</span>
            <div className="text-2xl font-bold mt-1 text-purple-700">{metrics.overallAvgHours} <span className="text-sm font-normal text-[var(--text-secondary)]">jam</span></div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]">
        <div className="relative flex-1">
          <MagnifyingGlass size={18} className="absolute left-3 top-3 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Cari berdasarkan No. Tiket, Subjek, atau Pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mr-1">
            <Funnel size={14} />
            <span>Filter:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
          >
            <option value="">Semua Status</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="In_Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Reopened">Reopened</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
          >
            <option value="">Semua Kategori</option>
            <option value="Order_Issue">Kendala Pesanan</option>
            <option value="Design_Problem">Masalah Desain</option>
            <option value="Payment_Question">Pembayaran</option>
            <option value="Technical_Issue">Masalah Teknis</option>
            <option value="General_Inquiry">Pertanyaan Umum</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
          >
            <option value="">Semua Prioritas</option>
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-secondary)]/50 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                <th className="px-4 py-3">No. Tiket</th>
                <th className="px-4 py-3">Subjek &amp; Pelanggan</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Prioritas</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Petugas</th>
                <th className="px-4 py-3">Dibuat</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {loading && tickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-[var(--text-secondary)]">
                    <ArrowClockwise size={24} className="animate-spin mx-auto mb-2 text-neutral-500" />
                    Memuat data tiket...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-[var(--text-secondary)]">
                    <Lifebuoy size={36} className="mx-auto mb-2 text-neutral-400 opacity-60" />
                    Belum ada tiket bantuan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-[var(--bg-secondary)]/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedTicketId(t.id)}
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-xs text-black">
                      {t.ticketNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--text-primary)]">{t.subject}</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {t.customer?.companyName || t.user?.fullName || 'Pelanggan Umum'}
                        {t.order && ` • #${t.order.orderNumber}`}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="inline-flex items-center gap-1 text-[var(--text-secondary)]">
                        <Tag size={13} />
                        {t.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getPriorityBadge(t.priority)}</td>
                    <td className="px-4 py-3">{getStatusBadge(t.status)}</td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                      {t.assignedTo?.fullName || (
                        <span className="italic text-neutral-400">Belum Ditugaskan</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1">
                        <Clock size={13} />
                        <span>{new Date(t.createdAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicketId(t.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-default)] hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <ChatCircleDots size={14} />
                        <span>Percakapan ({t._count?.messages || 0})</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchTickets}
      />

      <TicketDetailModal
        isOpen={!!selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        ticketId={selectedTicketId}
        onUpdated={fetchTickets}
      />
    </div>
  );
};

export default Tickets;
