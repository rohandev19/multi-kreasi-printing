import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ReportIssueModal } from '../components/modals/ReportIssueModal';
import { ReassignJobModal } from '../components/modals/ReassignJobModal';
import { useToast } from '../contexts/ToastContext';
import { ListBullets, Columns, Factory, Play, ClipboardText, CheckCircle, Warning, Gear, DotsSixVertical, LockSimple } from '@phosphor-icons/react';

interface Job {
  id: string;
  jobNumber?: string;
  orderNumber: string;
  orderId?: string;
  orderStatus?: string;
  isProofLocked?: boolean;
  proofStatus?: string;
  product: string;
  machine: string;
  material: string;
  status: 'Queued' | 'In Progress' | 'Quality Check' | 'Completed';
  priority: 'Normal' | 'High' | 'Urgent';
  progress: number;
}



export default function Production() {
  const { role, loading: roleLoading } = useRoleContext();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState('');
  
  const { success, error: toastError } = useToast();
  
  // View states
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal states
  const [reportIssueJobId, setReportIssueJobId] = useState<string | null>(null);
  const [reassignJobId, setReassignJobId] = useState<string | null>(null);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);

  useEffect(() => {
    if (!roleLoading && role) {
      fetchJobs();
    }
  }, [role, roleLoading]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/production-jobs');
      const jobData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
        
      let mappedJobs: Job[] = jobData.map((j: any) => {
        const orderStatus = j.order?.status;
        const latestProof = j.order?.proofs?.[0];
        const isProofLocked =
          orderStatus === 'Proof_Pending_Approval' ||
          orderStatus === 'Proof_Rejected' ||
          (latestProof && latestProof.status !== 'Approved');

        // Robust status determination
        let mappedStatus: Job['status'] = 'Queued';
        if (
          j.status === 'In_Progress' ||
          j.status === 'In Progress' ||
          orderStatus === 'In_Production'
        ) {
          mappedStatus = 'In Progress';
        } else if (
          j.status === 'Quality_Check' ||
          j.status === 'Quality Check' ||
          j.status === 'QC' ||
          orderStatus === 'Quality_Check'
        ) {
          mappedStatus = 'Quality Check';
        } else if (
          j.status === 'Completed' ||
          orderStatus === 'Ready' ||
          orderStatus === 'Shipped' ||
          orderStatus === 'Delivered'
        ) {
          mappedStatus = 'Completed';
        } else {
          mappedStatus = 'Queued';
        }

        const calculatedProgress =
          mappedStatus === 'Completed'
            ? 100
            : mappedStatus === 'Quality Check'
            ? 90
            : mappedStatus === 'In Progress'
            ? 50
            : 0;

        const firstItem = j.order?.items?.[0];
        const itemProductName = firstItem?.product?.name || firstItem?.productName;
        const productName = itemProductName
          ? `${itemProductName} (${firstItem?.quantity || 1}x)`
          : j.order?.customer?.companyName
          ? `Pesanan ${j.order.customer.companyName}`
          : 'Pekerjaan Cetak';

        return {
          id: j.id,
          jobNumber: j.jobNumber || `PROD-${j.id.slice(0, 8)}`,
          orderNumber: j.order?.orderNumber || j.orderNumber || 'Unknown Order',
          orderId: j.order?.id || j.orderId,
          orderStatus: orderStatus,
          isProofLocked: !!isProofLocked,
          proofStatus: latestProof?.status,
          product: productName,
          machine: j.machine?.name || j.assignedMachine?.name || 'Belum Ditugaskan',
          material: j.assignee?.fullName ? `Ditugaskan ke: ${j.assignee.fullName}` : 'Belum Ada Petugas',
          status: mappedStatus,
          priority: j.priority || j.order?.priority || 'Normal',
          progress: calculatedProgress,
        };
      });
      
      setJobs(mappedJobs);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleStartJob = async (id: string, isLocked?: boolean) => {
    if (isLocked) {
      toastError(
        'Produksi Terkunci (Proof Belum Disetujui)',
        'Mesin cetak tidak dapat dijalankan karena bukti cetak (proof) belum disetujui oleh pelanggan.'
      );
      return;
    }

    try {
      await api.patch(`/api/v1/production-jobs/${id}/start`);
      success('Pekerjaan Dimulai', 'Pekerjaan produksi telah ditandai sedang berjalan.');
      fetchJobs();
    } catch (err: any) {
      toastError('Gagal memulai pekerjaan', err.response?.data?.message || 'Silakan coba lagi.');
    }
  };

  const handleMarkQC = async (id: string) => {
    try {
      await api.patch(`/api/v1/production-jobs/${id}/qc`, { notes: 'Siap pemeriksaan kualitas.' });
      success('Perlu QC', 'Pekerjaan dikirim ke pemeriksaan kualitas.');
      fetchJobs();
    } catch (err: any) {
      toastError('Gagal mengirim ke QC', err.response?.data?.message || 'Silakan coba lagi.');
    }
  };

  const handleCompleteJob = async (id: string) => {
    try {
      await api.patch(`/api/v1/production-jobs/${id}/complete`, { passedQualityCheck: true });
      success('Pekerjaan Selesai', 'Pekerjaan produksi telah berhasil diselesaikan.');
      fetchJobs();
    } catch (err: any) {
      toastError('Gagal menyelesaikan pekerjaan', err.response?.data?.message || 'Silakan coba lagi.');
    }
  };

  const confirmDelete = async () => {
    setDeleteJobId(null);
  };

  const statusDisplayMap: Record<string, string> = {
    'All': 'Semua',
    'Queued': 'Dalam Antrean',
    'In Progress': 'Sedang Diproses',
    'Quality Check': 'Pemeriksaan Kualitas',
    'Completed': 'Selesai'
  };

  const statuses = ['All', 'Queued', 'In Progress', 'Quality Check', 'Completed'];
  const kanbanStatuses = ['Queued', 'In Progress', 'Quality Check', 'Completed'];
  
  const filteredJobs = jobs.filter(j => statusFilter === 'All' || j.status === statusFilter);

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto min-h-screen pb-24 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Antrean Produksi</h2>
          <p className="text-sm text-slate-500 mt-1">{jobs.length} pekerjaan sedang dipantau</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button 
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ListBullets size={16} weight="regular" /> Tabel
          </button>
          <button 
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Columns size={16} weight="regular" /> Kanban
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* FILTER TABS */}
      {viewMode === 'table' && (
        <div className="flex flex-wrap gap-2">
          {statuses.map(status => {
            const count = status === 'All' ? jobs.length : jobs.filter(j => j.status === status).length;
            const isActive = statusFilter === status;
            return (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${isActive ? 'bg-black text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                {statusDisplayMap[status] || status}
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && jobs.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Factory className="w-8 h-8 text-slate-300" weight="regular" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Antrean produksi kosong</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Semua selesai! Tidak ada pekerjaan produksi yang tertunda saat ini.
          </p>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && jobs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="px-5 py-4">ID Pekerjaan</th>
                  <th className="px-5 py-4">Produk</th>
                  <th className="px-5 py-4">Mesin & Petugas</th>
                  <th className="px-5 py-4">Status & Progres</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map(job => (
                  <tr key={job.id} className={`hover:bg-slate-50/80 transition-colors ${job.status === 'In Progress' ? 'border-l-4 border-slate-900' : 'border-l-4 border-transparent'}`}>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{job.jobNumber || job.id}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-slate-500">{job.orderNumber}</span>
                        {job.isProofLocked && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full" title="Proof belum disetujui klien">
                            <LockSimple size={11} weight="bold" /> ACC Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {job.product}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-700">{job.machine}</div>
                      <div className="text-xs text-slate-500">{job.material}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1
                          ${job.status === 'Queued' ? 'bg-slate-100 text-slate-600' :
                            job.status === 'In Progress' ? 'bg-primary-100 text-primary-700' :
                            job.status === 'Quality Check' ? 'bg-primary-100 text-primary-700' :
                            'bg-emerald-100 text-emerald-700'
                          }
                        `}>
                          {job.status === 'In Progress' && <span className="w-1.5 h-1.5 rounded-full bg-slate-900 animate-pulse"></span>}
                          {statusDisplayMap[job.status] || job.status}
                        </span>
                        <span className="text-xs font-bold text-slate-500">{job.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden w-48">
                        <div className={`h-full rounded-full transition-all duration-500 ${job.progress === 100 ? 'bg-emerald-500' : 'bg-black'}`} style={{ width: `${job.progress}%` }}></div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {job.status === 'Queued' && (
                          job.isProofLocked ? (
                            <button
                              onClick={() => handleStartJob(job.id, true)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors"
                              title="Terkunci: Bukti cetak belum disetujui klien"
                            >
                              <LockSimple size={14} weight="bold" /> Terkunci
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartJob(job.id, false)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition-colors shadow-2xs"
                            >
                              <Play size={14} weight="regular" /> Mulai
                            </button>
                          )
                        )}
                        {job.status === 'In Progress' && (
                          <>
                            <button onClick={() => handleMarkQC(job.id)} className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors">
                              <ClipboardText size={14} weight="regular" /> QC
                            </button>
                            <button onClick={() => handleCompleteJob(job.id)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors">
                              <CheckCircle size={14} weight="regular" /> Selesai
                            </button>
                          </>
                        )}
                        {job.status === 'Quality Check' && (
                          <button onClick={() => handleCompleteJob(job.id)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors">
                              <CheckCircle size={14} weight="regular" /> Selesai
                          </button>
                        )}
                        <button onClick={() => setReassignJobId(job.id)} className="p-1.5 border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition-colors" title="Tugaskan Ulang">
                          <Gear size={16} weight="regular" />
                        </button>
                        <button onClick={() => setReportIssueJobId(job.id)} className="p-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Laporkan Kendala">
                          <Warning size={16} weight="regular" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && jobs.length > 0 && (
        <div className="flex gap-6 overflow-x-auto pb-4 items-start snap-x">
          {kanbanStatuses.map(status => {
            const colJobs = jobs.filter(j => j.status === status);
            return (
              <div key={status} className="flex-none w-80 bg-slate-50/80 rounded-2xl p-4 min-h-[400px] border border-slate-200 snap-center">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800">{statusDisplayMap[status] || status}</h3>
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{colJobs.length}</span>
                </div>
                
                <div className="space-y-3">
                  {colJobs.map(job => (
                    <div key={job.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab group">
                      {job.isProofLocked && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 mb-2.5">
                          <LockSimple size={13} weight="bold" className="text-amber-700 shrink-0" />
                          <span>Terkunci: Menunggu ACC Proof</span>
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{job.jobNumber || job.id}</div>
                          <div className="font-semibold text-slate-800 mt-0.5">{job.product}</div>
                        </div>
                        <DotsSixVertical size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" weight="regular" />
                      </div>
                      
                      <div className="text-xs text-slate-500 mb-3 bg-slate-50 px-2 py-1 rounded inline-block">
                        {job.machine}
                      </div>
                      
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${
                          job.priority === 'Urgent' ? 'text-red-500' :
                          job.priority === 'High' ? 'text-amber-500' : 'text-slate-400'
                        }`}>
                          {job.priority === 'Urgent' ? 'Prioritas Kilat' : job.priority === 'High' ? 'Prioritas Tinggi' : 'Prioritas Normal'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{job.progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${job.progress === 100 ? 'bg-emerald-500' : 'bg-black'}`} style={{ width: `${job.progress}%` }}></div>
                      </div>
                      
                      <div className="mt-4 flex gap-2">
                        {job.status === 'Queued' && (
                          job.isProofLocked ? (
                            <button
                              onClick={() => handleStartJob(job.id, true)}
                              className="flex-1 py-1.5 bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                              title="Terkunci: Menunggu ACC Proof Klien"
                            >
                              <LockSimple size={14} weight="bold" /> ACC Pending
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartJob(job.id, false)}
                              className="flex-1 py-1.5 bg-black text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition-colors"
                            >
                              Mulai
                            </button>
                          )
                        )}
                        {job.status === 'In Progress' && (
                          <>
                            <button onClick={() => handleMarkQC(job.id)} className="flex-1 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors">Kirim QC</button>
                            <button onClick={() => handleCompleteJob(job.id)} className="flex-1 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors">Selesai</button>
                          </>
                        )}
                        {job.status === 'Quality Check' && (
                          <button onClick={() => handleCompleteJob(job.id)} className="flex-1 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors">Selesai</button>
                        )}
                        <button onClick={() => setReportIssueJobId(job.id)} className="px-2 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Laporkan Kendala">
                          <Warning size={14} weight="regular" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {colJobs.length === 0 && (
                    <div className="text-center p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium">
                      Tarik pekerjaan ke sini
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ReportIssueModal
        isOpen={!!reportIssueJobId}
        jobId={reportIssueJobId}
        onClose={() => setReportIssueJobId(null)}
        onSuccess={fetchJobs}
      />

      <ReassignJobModal
        isOpen={!!reassignJobId}
        jobId={reassignJobId}
        onClose={() => setReassignJobId(null)}
        onSuccess={fetchJobs}
      />

      <ConfirmDialog
        isOpen={!!deleteJobId}
        title="Hapus Pekerjaan Produksi"
        message="Apakah Anda yakin ingin menghapus pekerjaan ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="danger"
        onClose={() => setDeleteJobId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
