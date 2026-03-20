import { useEffect, useState } from 'react';
import api from '../api/axios';

interface ProductionJob {
  id: string;
  order: { orderNumber: string };
  machine: { name: string } | null;
  status: string;
  startTime: string | null;
  assignedStaff: { fullName: string } | null;
}

const statusColors: Record<string, string> = {
  Queue: 'bg-gray-100 text-gray-700',
  Assigned: 'bg-blue-100 text-blue-700',
  In_Progress: 'bg-purple-100 text-purple-700',
  Quality_Check: 'bg-indigo-100 text-indigo-700',
  Completed: 'bg-emerald-100 text-emerald-700',
};

export default function Production() {
  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/api/v1/production-jobs');
      // Handle if response is wrapped in a data property or is directly an array
      const jobData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
      setJobs(jobData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load production jobs');
      setJobs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status: string) => status.replace(/_/g, ' ');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Production Jobs</h2>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Job ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Machine
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Assigned Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Start Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No production jobs yet.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      #{job.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {job.order?.orderNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {job.machine?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[job.status] || 'bg-gray-100 text-gray-700'}`}>
                        {formatStatus(job.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {job.assignedStaff?.fullName || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {job.startTime ? new Date(job.startTime).toLocaleString('id-ID') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
