import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { UploadCloud } from 'lucide-react';

interface UploadDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadDesignModal: React.FC<UploadDesignModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  
  const [orderId, setOrderId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [version, setVersion] = useState(1);
  const [notes, setNotes] = useState('');
  
  const [orders, setOrders] = useState<any[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEligibleOrders();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setOrderId('');
    setFile(null);
    setVersion(1);
    setNotes('');
  };

  const fetchEligibleOrders = async () => {
    setFetchingOrders(true);
    try {
      const response = await api.get('/api/v1/orders');
      setOrders(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch {
      console.error('Failed to fetch orders');
    } finally {
      setFetchingOrders(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !file) {
      error('Validation Error', 'Please select an order and choose a file to upload.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('file', file);
      formData.append('version', version.toString());
      if (notes) formData.append('notes', notes);

      await api.post('/api/v1/design-files/upload', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      success('Upload Successful', `Design file ${file.name} uploaded successfully.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Upload Failed', err.response?.data?.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Design File" size="md">
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Order <span className="text-red-500">*</span>
            </label>
            {fetchingOrders ? (
              <div className="h-10 border border-slate-200 rounded-lg flex items-center px-3 bg-slate-50 text-sm text-slate-500">
                Loading orders...
              </div>
            ) : (
              <select
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Select an order...</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} - {o.customer?.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              File <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors bg-slate-50">
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                <div className="flex text-sm text-slate-600 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} required />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500">PNG, JPG, PDF, AI, PSD up to 50MB</p>
              </div>
            </div>
            {file && (
              <p className="mt-2 text-sm text-emerald-600 font-medium">Selected: {file.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Version</label>
              <input
                type="number"
                min="1"
                value={version}
                onChange={(e) => setVersion(parseInt(e.target.value))}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Changelog</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Fixed logo color"
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
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
            disabled={loading || !orderId || !file}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
