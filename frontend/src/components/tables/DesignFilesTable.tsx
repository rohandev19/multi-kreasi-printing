import React from 'react';
import { FileImage, Check, X, Clock, Eye, Download, Trash, NotePencil } from '@phosphor-icons/react';

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

interface DesignFilesTableProps {
  files: DesignFile[];
  userRole: string;
  loading: boolean;
  onPreview: (id: string) => void;
  onDownload: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRevisionRequest: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  Uploaded: { color: 'bg-blue-100 text-blue-700', icon: <Clock size={14} weight="regular" /> },
  AI_Check: { color: 'bg-primary-100 text-primary-700', icon: <Clock size={14} weight="regular" /> },
  Manual_Review: { color: 'bg-amber-100 text-amber-700', icon: <Clock size={14} weight="regular" /> },
  Approved: { color: 'bg-emerald-100 text-emerald-700', icon: <Check size={14} weight="regular" /> },
  Rejected: { color: 'bg-red-100 text-red-700', icon: <X size={14} weight="regular" /> },
  Revision_Required: { color: 'bg-orange-100 text-orange-700', icon: <X size={14} weight="regular" /> },
};

export const DesignFilesTable: React.FC<DesignFilesTableProps> = ({
  files,
  userRole,
  loading,
  onPreview,
  onDownload,
  onApprove,
  onReject,
  onRevisionRequest,
  onDelete,
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const formatStatus = (status: string) => status.replace(/_/g, ' ');

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isDesigner = userRole === 'Designer';
  const canManage = userRole === 'Owner' || userRole === 'Manager';

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {files.map((file) => (
          <div key={file.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3 flex flex-col">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <FileImage size={16} className="text-blue-500 flex-shrink-0" weight="regular" />
                <div className="font-medium text-slate-900 break-all">{file.originalName}</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[file.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                {statusConfig[file.status]?.icon}
                {formatStatus(file.status)}
              </span>
              <span className="text-slate-500">v{file.version} • {formatFileSize(file.fileSize)}</span>
            </div>
            
            <div className="text-sm space-y-1">
              <div>
                <span className="text-slate-500 mr-2">Order:</span>
                <span className="font-medium text-slate-900">{file.order?.orderNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-2">Customer:</span>
                <span className="text-slate-900">{file.order?.customer?.companyName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 mr-2">Uploaded:</span>
                <span className="text-slate-900">{new Date(file.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => onPreview(file.id)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Preview"
              >
                <Eye size={18} weight="regular" />
              </button>
              <button
                onClick={() => onDownload(file.id)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Download"
              >
                <Download size={18} weight="regular" />
              </button>
              {(isDesigner || canManage) && file.status === 'Manual_Review' && (
                <>
                  <button
                    onClick={() => onApprove(file.id)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Approve"
                  >
                    <Check size={18} weight="regular" />
                  </button>
                  <button
                    onClick={() => onReject(file.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Reject"
                  >
                    <X size={18} weight="regular" />
                  </button>
                  <button
                    onClick={() => onRevisionRequest(file.id)}
                    className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Request Revision"
                  >
                    <NotePencil size={18} weight="regular" />
                  </button>
                </>
              )}
              {canManage && onDelete && (
                <button
                  onClick={() => onDelete(file.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash size={18} weight="regular" />
                </button>
              )}
            </div>
          </div>
        ))}
        {files.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            <FileImage size={48} className="mx-auto mb-3 text-slate-300" weight="regular" />
            <p>No design files found.</p>
          </div>
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hidden md:block">
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
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {files.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                  <FileImage size={48} className="mx-auto mb-3 text-slate-300" weight="regular" />
                  <p>No design files found.</p>
                </td>
              </tr>
            ) : (
              files.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 flex items-center gap-2">
                    <FileImage size={16} className="text-blue-500" weight="regular" />
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
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => onPreview(file.id)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Preview"
                    >
                      <Eye size={18} weight="regular" />
                    </button>
                    <button
                      onClick={() => onDownload(file.id)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      title="Download"
                    >
                      <Download size={18} weight="regular" />
                    </button>
                    {(isDesigner || canManage) && file.status === 'Manual_Review' && (
                      <>
                        <button
                          onClick={() => onApprove(file.id)}
                          className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                          title="Approve"
                        >
                          <Check size={18} weight="regular" />
                        </button>
                        <button
                          onClick={() => onReject(file.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Reject"
                        >
                          <X size={18} weight="regular" />
                        </button>
                        <button
                          onClick={() => onRevisionRequest(file.id)}
                          className="p-1 text-slate-400 hover:text-orange-600 transition-colors"
                          title="Request Revision"
                        >
                          <NotePencil size={18} weight="regular" />
                        </button>
                      </>
                    )}
                    {canManage && onDelete && (
                      <button
                        onClick={() => onDelete(file.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash size={18} weight="regular" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
