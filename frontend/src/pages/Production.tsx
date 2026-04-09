import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { ProductionTable } from '../components/tables/ProductionTable';

export default function Production() {
  const { role, loading: roleLoading } = useRoleContext();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      fetchJobs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start job');
    }
  };

  const handleCompleteJob = async (id: string) => {
    try {
      await api.patch(`/api/v1/production-jobs/${id}/complete`, { passedQualityCheck: true });
      fetchJobs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete job');
    }
  };

  const handleReportIssue = (id: string) => {
    // Navigate to report issue or open modal
    alert(`Report issue for job ${id}`);
  };

  const handleReassign = (id: string) => {
    // Open reassign modal
    alert(`Reassign job ${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      // API call to delete
      alert(`Delete job ${id}`);
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
    </div>
  );
}
