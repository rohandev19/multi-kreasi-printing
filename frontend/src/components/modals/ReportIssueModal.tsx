import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { AlertTriangle } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jobId: string | null;
}

const issueSchema = z.object({
  issue: z.string().min(5, 'Please provide a detailed description of the issue'),
});

type IssueFormValues = z.infer<typeof issueSchema>;

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  jobId
}) => {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      issue: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({ issue: '' });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: IssueFormValues) => {
    setLoading(true);
    try {
      // Assuming endpoint allows patching status and adding a note
      await api.patch(`/api/v1/production-jobs/${jobId}/issue`, { issue: data.issue });
      success('Issue Reported', `An issue has been logged for job #${jobId}.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Failed to report issue', err.response?.data?.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Production Issue" size="md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <AlertTriangle className="text-amber-500 w-6 h-6 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Reporting an issue will pause this production job and notify the manager.
            </p>
          </div>
          
          <div>
            <label htmlFor="issue" className="block text-sm font-medium text-slate-700 mb-1">
              Describe the Issue <span className="text-red-500">*</span>
            </label>
            <textarea
              id="issue"
              rows={4}
              {...register('issue')}
              className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${errors.issue ? 'border-red-500' : ''}`}
              placeholder="E.g., Out of paper, printer jam, design error..."
            ></textarea>
            {errors.issue && <p className="text-red-500 text-xs mt-1">{errors.issue.message}</p>}
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
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Report Issue'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
