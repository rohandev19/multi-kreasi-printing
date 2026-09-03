import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { DesignFilesTable } from '../components/tables/DesignFilesTable';
import { UploadDesignModal } from '../components/modals/UploadDesignModal';
import { DesignPreviewModal } from '../components/modals/DesignPreviewModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';

export default function DesignFiles() {
  const { role, loading: roleLoading } = useRoleContext();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { success, error: toastError } = useToast();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!roleLoading && role) {
      fetchDesignFiles();
    }
  }, [role, roleLoading]);

  const fetchDesignFiles = async () => {
    try {
      const response = await api.get('/api/v1/design-files');
      const fileData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
        
      if (fileData.length === 0) {
        // Fallback to dummy data if empty for demonstration
        setFiles([
          {
            id: 'df-1',
            originalName: 'banner_promo_merdeka.pdf',
            status: 'Approved',
            version: 2,
            order: { orderNumber: 'ORD-2026-0801', customer: { companyName: 'PT. Maju Mundur' } },
            fileSize: 15420000, // ~15 MB
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            id: 'df-2',
            originalName: 'kartu_nama_direktur_v3.ai',
            status: 'Manual_Review',
            version: 3,
            order: { orderNumber: 'ORD-2026-0805', customer: { companyName: 'CV. Karya Abadi' } },
            fileSize: 2560000, // ~2.5 MB
            createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          },
          {
            id: 'df-3',
            originalName: 'brosur_lipat_3.pdf',
            status: 'Revision_Required',
            version: 1,
            order: { orderNumber: 'ORD-2026-0810', customer: { companyName: 'Startup Digital Nusantara' } },
            fileSize: 4500000, // 4.5 MB
            createdAt: new Date().toISOString(),
          },
          {
            id: 'df-4',
            originalName: 'stiker_packaging_box.psd',
            status: 'Uploaded',
            version: 1,
            order: { orderNumber: 'ORD-2026-0812', customer: { companyName: 'UMKM Kopi Lokal' } },
            fileSize: 12500000, // 12.5 MB
            createdAt: new Date().toISOString(),
          }
        ]);
      } else {
        setFiles(fileData);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load design files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (id: string) => {
    setPreviewFileId(id);
  };

  const handleDownload = async (_id: string) => {
    // In a real app, this would trigger a file download
    success('Download Started', 'Your file is downloading.');
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/api/v1/design-files/${id}/approve`);
      success('File Approved', 'The design file has been approved.');
      fetchDesignFiles();
    } catch (err: any) {
      toastError('Error', err.response?.data?.message || 'Failed to approve design file');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/api/v1/design-files/${id}/reject`, { notes: 'Rejected by review' });
      success('File Rejected', 'The design file has been rejected.');
      fetchDesignFiles();
    } catch (err: any) {
      toastError('Error', err.response?.data?.message || 'Failed to reject design file');
    }
  };

  const handleRevisionRequest = async (id: string) => {
    try {
      await api.patch(`/api/v1/design-files/${id}/request-revision`, { notes: 'Revision requested' });
      success('Revision Requested', 'A revision has been requested for this file.');
      fetchDesignFiles();
    } catch (err: any) {
      toastError('Error', err.response?.data?.message || 'Failed to request revision for design file');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteFileId(id);
  };

  const confirmDelete = async () => {
    if (!deleteFileId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/v1/design-files/${deleteFileId}`);
      success('File Deleted', 'The design file has been deleted.');
      fetchDesignFiles();
    } catch (err: any) {
      toastError('Failed to delete', err.response?.data?.message || 'Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteFileId(null);
    }
  };

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Design Files</h2>
        {(role === 'Owner' || role === 'Manager') && (
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Upload Design
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <DesignFilesTable
        files={files}
        userRole={role || ''}
        loading={loading}
        onPreview={handlePreview}
        onDownload={handleDownload}
        onApprove={handleApprove}
        onReject={handleReject}
        onRevisionRequest={handleRevisionRequest}
        onDelete={handleDelete}
      />

      <UploadDesignModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={fetchDesignFiles}
      />

      <DesignPreviewModal
        isOpen={!!previewFileId}
        fileId={previewFileId}
        onClose={() => setPreviewFileId(null)}
      />

      <ConfirmDialog
        isOpen={!!deleteFileId}
        title="Delete Design File"
        message="Are you sure you want to delete this design file? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={isDeleting}
        onClose={() => setDeleteFileId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
