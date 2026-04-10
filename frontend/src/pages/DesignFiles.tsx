import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useRoleContext } from '../contexts/RoleContext';
import { DesignFilesTable } from '../components/tables/DesignFilesTable';

export default function DesignFiles() {
  const { role, loading: roleLoading } = useRoleContext();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      setFiles(fileData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load design files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (id: string) => {
    alert(`Preview design file ${id}`);
  };

  const handleDownload = async (id: string) => {
    alert(`Download design file ${id}`);
  };

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/api/v1/design-files/${id}/approve`);
      fetchDesignFiles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve design file');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.patch(`/api/v1/design-files/${id}/reject`, { notes: 'Rejected by review' });
      fetchDesignFiles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject design file');
    }
  };

  const handleRevisionRequest = async (id: string) => {
    try {
      await api.patch(`/api/v1/design-files/${id}/request-revision`, { notes: 'Revision requested' });
      fetchDesignFiles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to request revision for design file');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      alert(`Delete design file ${id}`);
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
        <h2 className="text-2xl font-bold text-slate-800">Design Files</h2>
        {(role === 'Owner' || role === 'Manager' || role === 'Sales') && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
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
    </div>
  );
}
