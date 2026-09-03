import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { Download, Image as ImageIcon } from '@phosphor-icons/react';

interface DesignPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string | null;
}

export const DesignPreviewModal: React.FC<DesignPreviewModalProps> = ({
  isOpen,
  onClose,
  fileId
}) => {
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFileDetails = async (id: string) => {
      setLoading(true);
      setError('');
      try {
        if (id.startsWith('df-')) {
          // Return mock data for dummy IDs
          setFile({
            id: id,
            fileName: id === 'df-1' ? 'banner_promo_merdeka.pdf' : 
                     id === 'df-2' ? 'kartu_nama_direktur_v3.ai' : 
                     id === 'df-3' ? 'brosur_lipat_3.pdf' : 'stiker_packaging_box.psd',
            version: id === 'df-2' ? 3 : id === 'df-1' ? 2 : 1,
            order: { orderNumber: `ORD-2026-08${id.split('-')[1]}0` },
            notes: 'These are dummy design files for preview purposes. No actual file exists on the server.',
          });
          return;
        }
        const response = await api.get(`/api/v1/design-files/${id}`);
        setFile(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load design file');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && fileId) {
      fetchFileDetails(fileId);
    } else {
      setFile(null);
      setError('');
    }
  }, [isOpen, fileId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Design Preview" size="2xl">
      <div className="p-0 flex flex-col h-[70vh]">
        {loading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>
          </div>
        ) : file ? (
          <>
            <div className="flex-1 bg-slate-900 flex items-center justify-center relative overflow-hidden group">
              {/* If it's an image we could show it, for now a placeholder icon */}
              {file.fileUrl && file.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                <img src={file.fileUrl} alt={file.fileName} className="max-w-full max-h-full object-contain" />
              ) : (
                <div className="text-slate-600 flex flex-col items-center">
                  <ImageIcon size={64} className="mb-4 opacity-50" weight="regular" />
                  <p className="text-sm">Preview not available for this file type.</p>
                  <p className="text-xs mt-1 font-mono text-slate-500">{file.fileName}</p>
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 border-t border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{file.fileName}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                    <span className="font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">v{file.version}</span>
                    <span>Order: {file.order?.orderNumber}</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition-colors text-sm">
                  <Download size={16} weight="regular" />
                  Download
                </button>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Notes</p>
                <p className="text-sm text-slate-700">{file.notes || 'No notes provided for this version.'}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex justify-center items-center text-slate-500">
            File not found.
          </div>
        )}
      </div>
    </Modal>
  );
};
