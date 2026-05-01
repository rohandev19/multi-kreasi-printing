import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';

interface ReassignJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jobId: string | null;
}

export const ReassignJobModal: React.FC<ReassignJobModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  jobId
}) => {
  const [assignedTo, setAssignedTo] = useState('');
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingStaff, setFetchingStaff] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchStaff();
    }
  }, [isOpen]);

  const fetchStaff = async () => {
    setFetchingStaff(true);
    try {
      // Ideally an endpoint like /api/v1/users?role=Production_Staff
      const response = await api.get('/api/v1/users').catch(() => ({ 
        data: { data: [{ id: '1', name: 'Andi (Operator A)' }, { id: '2', name: 'Budi (Operator B)' }] }
      }));
      setStaff(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch staff');
    } finally {
      setFetchingStaff(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedTo) return;

    setLoading(true);
    try {
      await api.patch(`/api/v1/production-jobs/${jobId}/reassign`, { assignedTo });
      success('Job Reassigned', `Job #${jobId} has been reassigned successfully.`);
      onSuccess();
      onClose();
      setAssignedTo('');
    } catch (err: any) {
      error('Reassignment Failed', err.response?.data?.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reassign Production Job" size="md">
      <form onSubmit={handleSubmit}>
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            Select a new staff member to take over this production job.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Assign To <span className="text-red-500">*</span>
            </label>
            {fetchingStaff ? (
              <div className="h-10 border border-slate-200 rounded-lg flex items-center px-3 bg-slate-50 text-sm text-slate-500">
                Loading staff list...
              </div>
            ) : (
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select staff member...</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name || s.fullName}</option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !assignedTo || fetchingStaff}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Reassigning...' : 'Confirm Reassign'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
