import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { ProductionTable } from '../components/tables/ProductionTable';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ReportIssueModal } from '../components/modals/ReportIssueModal';
import { ReassignJobModal } from '../components/modals/ReassignJobModal';
import { useToast } from '../contexts/ToastContext';

export default function Production() {
  const { role, loading: roleLoading } = useRoleContext();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { success, error: toastError } = useToast();
  
  // Modal states
  const [reportIssueJobId, setReportIssueJobId] = useState<string | null>(null);
  const [reassignJobId, setReassignJobId] = useState<string | null>(null);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!roleLoading && role) {
      fetchJobs();
    }
  }, [role, roleLoading]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/v1/production-jobs');
      const jobData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
      setJobs(jobData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load production jobs');
      setJobs([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleStartJob = async (id: string) => {
    try {
      await api.patch(`/api/v1/production-jobs/${id}/start`);
      success('Job Started', 'The production job has been marked as in-progress.');
      fetchJobs();
    } catch (err: any) {
      toastError('Error', err.response?.data?.message || 'Failed to start job');
    }
  };

  const handleCompleteJob = async (id: string) => {
    try {
      await api.patch(`/api/v1/production-jobs/${id}/complete`, { passedQualityCheck: true });
      success('Job Completed', 'The production job has been completed.');
      fetchJobs();
    } catch (err: any) {
      toastError('Error', err.response?.data?.message || 'Failed to complete job');
    }
  };

  const handleReportIssue = (id: string) => {
    setReportIssueJobId(id);
  };

  const handleReassign = (id: string) => {
    setReassignJobId(id);
  };

  const handleDelete = (id: string) => {
    setDeleteJobId(id);
  };

  const confirmDelete = async () => {
    if (!deleteJobId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/v1/production-jobs/${deleteJobId}`);
      success('Job Deleted', 'The production job has been deleted.');
      fetchJobs();
    } catch (err: any) {
      toastError('Failed to delete', err.response?.data?.message || 'Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteJobId(null);
    }
  };

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Production Jobs</h2>
        {(role === 'Owner' || role === 'Manager') && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            New Job
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <ProductionTable 
        jobs={jobs} 
        userRole={role || ''} 
        loading={loading}
        onStartJob={handleStartJob}
        onCompleteJob={handleCompleteJob}
        onReportIssue={handleReportIssue}
        onReassign={handleReassign}
        onDelete={handleDelete}
      />

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
        title="Delete Production Job"
        message="Are you sure you want to delete this production job? This action cannot be undone."
        confirmLabel="Delete Job"
        variant="danger"
        loading={isDeleting}
        onClose={() => setDeleteJobId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
