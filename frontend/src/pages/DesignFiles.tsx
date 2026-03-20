import { useEffect, useState } from 'react';
import api from '../api/axios';
import { FileImage, Check, X, Clock } from 'lucide-react';

interface DesignFile {
  id: string;
  originalName: string;
  status: string;
  version: number;
  order: {
    orderNumber: string;
    customer: { companyName: string };
  };
  fileSize: number;
  createdAt: string;
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  Uploaded: { color: 'bg-blue-100 text-blue-700', icon: <Clock size={14} /> },
  AI_Check: { color: 'bg-purple-100 text-purple-700', icon: <Clock size={14} /> },
  Manual_Review: { color: 'bg-amber-100 text-amber-700', icon: <Clock size={14} /> },
  Approved: { color: 'bg-emerald-100 text-emerald-700', icon: <Check size={14} /> },
  Rejected: { color: 'bg-red-100 text-red-700', icon: <X size={14} /> },
  Revision_Required: { color: 'bg-orange-100 text-orange-700', icon: <X size={14} /> },
};

export default function DesignFiles() {
  const [files, setFiles] = useState<DesignFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDesignFiles();
  }, []);

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

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(2)} KB`;
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Design Files</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Upload Design
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Version
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Uploaded
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {files.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <FileImage size={48} className="mx-auto mb-3 text-slate-300" />
                    <p>No design files yet.</p>
                  </td>
                </tr>
              ) : (
                files.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 flex items-center gap-2">
                      <FileImage size={16} className="text-blue-500" />
                      {file.originalName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {file.order?.orderNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {file.order?.customer?.companyName || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[file.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                        {statusConfig[file.status]?.icon}
                        {formatStatus(file.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      v{file.version}
                    </td>
                    <td className="px-6 py-4 text-sm text-right tabular-nums text-slate-700">
                      {formatFileSize(file.fileSize)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(file.createdAt).toLocaleDateString('id-ID')}
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
