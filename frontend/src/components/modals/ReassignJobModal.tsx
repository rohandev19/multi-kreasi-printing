import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface ReassignJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jobId: string | null;
}

const reassignSchema = z.object({
  assignedTo: z.string().min(1, 'Please select a staff member'),
});

type ReassignFormValues = z.infer<typeof reassignSchema>;

export const ReassignJobModal: React.FC<ReassignJobModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  jobId
}) => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingStaff, setFetchingStaff] = useState(false);
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ReassignFormValues>({
    resolver: zodResolver(reassignSchema),
    defaultValues: {
      assignedTo: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      fetchStaff();
      reset({ assignedTo: '' });
    }
  }, [isOpen, reset]);

  const fetchStaff = async () => {
    setFetchingStaff(true);
    try {
      const response = await api.get('/api/v1/users');
      // Filter production staff locally if the API doesn't support query params yet
      const allUsers = Array.isArray(response.data) ? response.data : response.data.data || [];
      const prodStaff = allUsers.filter((u: any) => u.role === 'Production_Staff' || u.role === 'Production');
      setStaff(prodStaff.length > 0 ? prodStaff : allUsers);
    } catch {
      console.error('Failed to fetch staff');
    } finally {
      setFetchingStaff(false);
    }
  };

  const onSubmit = async (data: ReassignFormValues) => {
    setLoading(true);
    try {
      await api.patch(`/api/v1/production-jobs/${jobId}/assign`, { assigneeId: data.assignedTo });
      success('Job Reassigned', `Job #${jobId} has been reassigned successfully.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Reassignment Failed', err.response?.data?.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reassign Production Job" size="md">
      <form onSubmit={handleSubmit(onSubmit)}>
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
                {...register('assignedTo')}
                className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.assignedTo ? 'border-red-500' : ''}`}
              >
                <option value="">Select staff member...</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name || s.fullName}</option>
                ))}
              </select>
            )}
            {errors.assignedTo && <p className="text-red-500 text-xs mt-1">{errors.assignedTo.message}</p>}
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
            disabled={loading || fetchingStaff}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Reassigning...' : 'Confirm Reassign'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
