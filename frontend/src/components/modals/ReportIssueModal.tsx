import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { Warning } from '@phosphor-icons/react';
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
  issue: z.string().min(5, 'Silakan berikan deskripsi kendala secara detail'),
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
      success('Kendala Dilaporkan', `Kendala telah dicatat untuk tugas #${jobId}.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Gagal melaporkan kendala', err.response?.data?.message || 'Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Laporkan Kendala Produksi" size="md">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <Warning className="text-amber-500 w-6 h-6 flex-shrink-0" weight="regular" />
            <p className="text-sm text-amber-800">
              Melaporkan kendala akan menjeda pekerjaan produksi ini dan memberitahu manajer.
            </p>
          </div>
          
          <div>
            <label htmlFor="issue" className="block text-sm font-medium text-slate-700 mb-1">
              Deskripsi Kendala <span className="text-red-500">*</span>
            </label>
            <textarea
              id="issue"
              rows={4}
              {...register('issue')}
              className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${errors.issue ? 'border-red-500' : ''}`}
              placeholder="cth., Kehabisan kertas, mesin cetak macet, kesalahan desain..."
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
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50"
          >
            {loading ? 'Mengirim...' : 'Laporkan Kendala'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
