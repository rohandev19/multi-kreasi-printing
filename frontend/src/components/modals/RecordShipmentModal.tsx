import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { Truck } from 'lucide-react';

interface RecordShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  materialId: string | null;
  materialName?: string;
  unit?: string;
}

export const RecordShipmentModal: React.FC<RecordShipmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  materialId,
  materialName = 'Material',
  unit = 'units'
}) => {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  
  const [quantity, setQuantity] = useState<number | ''>('');
  const [supplier, setSupplier] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      error('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/api/v1/inventory/${materialId}/shipment`, { 
        quantity: Number(quantity),
        supplier,
        referenceNumber
      });
      success('Shipment Recorded', `Received ${quantity} ${unit} of ${materialName}.`);
      onSuccess();
      onClose();
      setQuantity('');
      setSupplier('');
      setReferenceNumber('');
    } catch (err: any) {
      error('Failed to record shipment', err.response?.data?.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Incoming Shipment" size="sm">
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <Truck className="text-indigo-500 w-6 h-6 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-indigo-900">{materialName}</p>
              <p className="text-xs text-indigo-700">Record newly arrived stock from suppliers.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantity Received <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-slate-500 sm:text-sm">{unit}</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supplier / Vendor</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., CV Paper Supplier"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">PO / Reference Number</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g., PO-2026-045"
            />
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
            disabled={loading || !quantity}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Record Shipment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
