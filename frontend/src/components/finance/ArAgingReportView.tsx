import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import {
  CurrencyDollar,
  Clock,
  WarningOctagon,
  UsersThree,
  ArrowClockwise,
  SlidersHorizontal,
  FileArrowDown,
  ShieldCheck,
  Funnel,
  MagnifyingGlass,
  CheckCircle,
  Warning,
  XCircle,
} from '@phosphor-icons/react';
import { CustomerCreditTermsModal } from '../modals/CustomerCreditTermsModal';

export interface AgingBuckets {
  current: number;
  bucket1_30: number;
  bucket31_60: number;
  bucket61_90: number;
  bucketOver90: number;
  totalOutstanding: number;
  overdueCount: number;
  overdueAmount: number;
}

export type CreditRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CustomerAgingRow {
  customerId: string;
  companyName: string;
  email: string | null;
  phone: string | null;
  creditLimit: number;
  paymentTermDays: number;
  creditStatus: string;
  creditNotes: string | null;
  availableCredit: number;
  aging: AgingBuckets;
  riskLevel: CreditRiskLevel;
  invoiceCount: number;
}

export interface ArAgingReportResult {
  summary: {
    totalReceivables: number;
    totalCurrent: number;
    totalOverdue: number;
    bucket1_30Total: number;
    bucket31_60Total: number;
    bucket61_90Total: number;
    bucketOver90Total: number;
    totalCustomersWithOutstanding: number;
    highRiskCustomersCount: number;
  };
  customers: CustomerAgingRow[];
  generatedAt: string;
}

export const ArAgingReportView: React.FC = () => {
  const [data, setData] = useState<ArAgingReportResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [referenceDate, setReferenceDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );

  // Selected customer for credit terms modal
  const [editingCustomer, setEditingCustomer] = useState<CustomerAgingRow | null>(
    null,
  );

  const fetchAgingReport = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/v1/invoices/ar-aging', {
        params: { referenceDate: new Date(referenceDate).toISOString() },
      });
      setData(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Gagal memuat Laporan Umur Piutang (AR Aging).',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgingReport();
  }, [referenceDate]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val || 0);
  };

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    if (!data?.customers) return [];
    return data.customers.filter((c) => {
      const matchesSearch =
        c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.phone && c.phone.includes(searchQuery));

      const matchesRisk =
        riskFilter === 'ALL' || c.riskLevel === riskFilter;

      const matchesStatus =
        statusFilter === 'ALL' || c.creditStatus === statusFilter;

      return matchesSearch && matchesRisk && matchesStatus;
    });
  }, [data?.customers, searchQuery, riskFilter, statusFilter]);

  // Export to CSV
  const handleExportCsv = () => {
    if (!filteredCustomers.length) return;
    const headers = [
      'ID Pelanggan',
      'Nama Perusahaan',
      'Plafon Kredit (IDR)',
      'TOP (Hari)',
      'Status Kredit',
      'Lancar (Current)',
      '1-30 Hari',
      '31-60 Hari',
      '61-90 Hari',
      '>90 Hari',
      'Total Piutang',
      'Sisa Plafon',
      'Tingkat Risiko',
    ];

    const rows = filteredCustomers.map((c) => [
      c.customerId,
      `"${c.companyName}"`,
      c.creditLimit,
      c.paymentTermDays,
      c.creditStatus,
      c.aging.current,
      c.aging.bucket1_30,
      c.aging.bucket31_60,
      c.aging.bucket61_90,
      c.aging.bucketOver90,
      c.aging.totalOutstanding,
      c.availableCredit,
      c.riskLevel,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `AR_Aging_Report_${referenceDate}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRiskBadge = (level: CreditRiskLevel) => {
    switch (level) {
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={13} weight="fill" /> Low Risk
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={13} weight="fill" /> Medium
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Warning size={13} weight="fill" /> High Risk
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={13} weight="fill" /> Critical
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Active
          </span>
        );
      case 'ON_HOLD':
        return (
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800">
            Hold
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-rose-100 text-rose-800">
            Suspended
          </span>
        );
      default:
        return (
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">
              Laporan Umur Piutang (AR Aging)
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-md">
              B2B Accounting
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Matriks umur piutang korporat per jatuh tempo, plafon kredit, dan monitoring risiko kredit macet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">Per Tanggal:</label>
            <input
              type="date"
              value={referenceDate}
              onChange={(e) => setReferenceDate(e.target.value)}
              className="text-xs rounded-lg border-slate-300 focus:border-slate-900 focus:ring-slate-900 py-1.5 px-2.5"
            />
          </div>

          <button
            onClick={fetchAgingReport}
            disabled={loading}
            className="p-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Muat Ulang Data"
          >
            <ArrowClockwise size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={!filteredCustomers.length}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <FileArrowDown size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <WarningOctagon size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Piutang Berjalan
              </span>
              <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                <CurrencyDollar size={18} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(data.summary.totalReceivables)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Dari {data.summary.totalCustomersWithOutstanding} pelanggan aktif
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Piutang Lancar (Current)
              </span>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-700">
              {formatCurrency(data.summary.totalCurrent)}
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              {data.summary.totalReceivables > 0
                ? `${Math.round(
                    (data.summary.totalCurrent / data.summary.totalReceivables) *
                      100,
                  )}% dari total piutang`
                : '100%'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Tertunggak (Overdue)
              </span>
              <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                <Clock size={18} />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-700">
              {formatCurrency(data.summary.totalOverdue)}
            </div>
            <p className="text-xs text-rose-600 mt-1">
              {data.summary.totalReceivables > 0
                ? `${Math.round(
                    (data.summary.totalOverdue / data.summary.totalReceivables) *
                      100,
                  )}% melewati jatuh tempo`
                : '0% overdue'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Nasabah Berisiko Tinggi
              </span>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <UsersThree size={18} />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-700">
              {data.summary.highRiskCustomersCount} Pelanggan
            </div>
            <p className="text-xs text-amber-600 mt-1">
              Kategori High & Critical risk
            </p>
          </div>
        </div>
      )}

      {/* Aging Breakdown Bar */}
      {data && data.summary.totalReceivables > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Komposisi Umur Piutang:</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Lancar: {formatCurrency(data.summary.totalCurrent)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                1-30 Hari: {formatCurrency(data.summary.bucket1_30Total)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                31-60 Hari: {formatCurrency(data.summary.bucket31_60Total)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                61-90 Hari: {formatCurrency(data.summary.bucket61_90Total)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                &gt;90 Hari: {formatCurrency(data.summary.bucketOver90Total)}
              </span>
            </div>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden">
            {data.summary.totalCurrent > 0 && (
              <div
                style={{
                  width: `${(data.summary.totalCurrent / data.summary.totalReceivables) * 100}%`,
                }}
                className="bg-emerald-500 h-full"
                title={`Lancar: ${formatCurrency(data.summary.totalCurrent)}`}
              />
            )}
            {data.summary.bucket1_30Total > 0 && (
              <div
                style={{
                  width: `${(data.summary.bucket1_30Total / data.summary.totalReceivables) * 100}%`,
                }}
                className="bg-sky-500 h-full"
                title={`1-30 Hari: ${formatCurrency(data.summary.bucket1_30Total)}`}
              />
            )}
            {data.summary.bucket31_60Total > 0 && (
              <div
                style={{
                  width: `${(data.summary.bucket31_60Total / data.summary.totalReceivables) * 100}%`,
                }}
                className="bg-amber-500 h-full"
                title={`31-60 Hari: ${formatCurrency(data.summary.bucket31_60Total)}`}
              />
            )}
            {data.summary.bucket61_90Total > 0 && (
              <div
                style={{
                  width: `${(data.summary.bucket61_90Total / data.summary.totalReceivables) * 100}%`,
                }}
                className="bg-orange-500 h-full"
                title={`61-90 Hari: ${formatCurrency(data.summary.bucket61_90Total)}`}
              />
            )}
            {data.summary.bucketOver90Total > 0 && (
              <div
                style={{
                  width: `${(data.summary.bucketOver90Total / data.summary.totalReceivables) * 100}%`,
                }}
                className="bg-rose-500 h-full"
                title={`>90 Hari: ${formatCurrency(data.summary.bucketOver90Total)}`}
              />
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Cari nama perusahaan atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border-slate-300 focus:border-slate-900 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Funnel size={14} />
            <span>Risiko:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs rounded-lg border-slate-300 py-1.5 px-2.5 focus:border-slate-900 focus:ring-slate-900"
            >
              <option value="ALL">Semua Tingkat</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical Risk</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded-lg border-slate-300 py-1.5 px-2.5 focus:border-slate-900 focus:ring-slate-900"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Corporate AR Aging Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <SlidersHorizontal size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">Tidak ada data piutang ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">
              Sesuaikan kata kunci pencarian atau filter status Anda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Perusahaan / Nasabah</th>
                  <th className="py-3 px-3 text-right">Plafon Kredit</th>
                  <th className="py-3 px-3 text-center">TOP</th>
                  <th className="py-3 px-3 text-right text-emerald-700 bg-emerald-50/50">
                    Lancar (Current)
                  </th>
                  <th className="py-3 px-3 text-right text-sky-700">1 - 30 Hari</th>
                  <th className="py-3 px-3 text-right text-amber-700">31 - 60 Hari</th>
                  <th className="py-3 px-3 text-right text-orange-700">61 - 90 Hari</th>
                  <th className="py-3 px-3 text-right text-rose-700">&gt; 90 Hari</th>
                  <th className="py-3 px-3 text-right font-bold text-slate-900 bg-slate-100/60">
                    Total Piutang
                  </th>
                  <th className="py-3 px-3 text-right">Sisa Plafon</th>
                  <th className="py-3 px-3 text-center">Risiko</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((row) => {
                  const hasDebt = row.aging.totalOutstanding > 0;
                  return (
                    <tr
                      key={row.customerId}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        row.riskLevel === 'CRITICAL' ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {row.companyName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {row.email || row.phone || '-'}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-slate-800">
                        {row.creditLimit > 0
                          ? formatCurrency(row.creditLimit)
                          : <span className="text-slate-400">Rp 0 (Cash)</span>}
                      </td>

                      <td className="py-3 px-3 text-center font-medium">
                        {row.paymentTermDays > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                            {row.paymentTermDays} Hari
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Cash</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-emerald-700 bg-emerald-50/30">
                        {row.aging.current > 0
                          ? formatCurrency(row.aging.current)
                          : '-'}
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-sky-700">
                        {row.aging.bucket1_30 > 0
                          ? formatCurrency(row.aging.bucket1_30)
                          : '-'}
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-amber-700">
                        {row.aging.bucket31_60 > 0
                          ? formatCurrency(row.aging.bucket31_60)
                          : '-'}
                      </td>

                      <td className="py-3 px-3 text-right font-medium text-orange-700">
                        {row.aging.bucket61_90 > 0
                          ? formatCurrency(row.aging.bucket61_90)
                          : '-'}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-rose-700">
                        {row.aging.bucketOver90 > 0
                          ? formatCurrency(row.aging.bucketOver90)
                          : '-'}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-900 bg-slate-100/60">
                        {hasDebt ? formatCurrency(row.aging.totalOutstanding) : 'Rp 0'}
                      </td>

                      <td className="py-3 px-3 text-right text-slate-700 font-medium">
                        {row.creditLimit > 0
                          ? formatCurrency(row.availableCredit)
                          : '-'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {getRiskBadge(row.riskLevel)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        {getStatusBadge(row.creditStatus)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setEditingCustomer(row)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          Kelola Kredit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Credit Terms Edit Modal */}
      <CustomerCreditTermsModal
        isOpen={!!editingCustomer}
        customer={
          editingCustomer
            ? {
                id: editingCustomer.customerId,
                companyName: editingCustomer.companyName,
                creditLimit: editingCustomer.creditLimit,
                paymentTermDays: editingCustomer.paymentTermDays,
                creditStatus: editingCustomer.creditStatus,
                creditNotes: editingCustomer.creditNotes,
                currentOutstanding: editingCustomer.aging.totalOutstanding,
              }
            : null
        }
        onClose={() => setEditingCustomer(null)}
        onSuccess={fetchAgingReport}
      />
    </div>
  );
};
