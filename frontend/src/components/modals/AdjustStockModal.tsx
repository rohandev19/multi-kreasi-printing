import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { Package, Plus, Minus } from '@phosphor-icons/react';

interface AdjustStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  materialId: string | null;
  materialName?: string;
  currentQuantity?: number;
  unit?: string;
}

export const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  materialId,
  materialName = 'Material',
  currentQuantity = 0,
  unit = 'units'
}) => {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      error('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }

    setLoading(true);
    try {
      const adjustment = adjustmentType === 'add' ? Number(quantity) : -Number(quantity);
      await api.post(`/api/v1/inventory/${materialId}/adjust`, { 
        quantity: adjustment,
        reason
      });
      success('Stock Adjusted', `Stock for ${materialName} has been updated.`);
      onSuccess();
      onClose();
      setQuantity('');
      setReason('');
    } catch (err: any) {
      error('Adjustment Failed', err.response?.data?.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adjust Stock" size="sm">
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-5">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2">
            <p className="text-sm text-slate-500 mb-1">Current Stock</p>
            <p className="text-xl font-bold text-slate-900">{currentQuantity} <span className="text-sm font-normal text-slate-500">{unit}</span></p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAdjustmentType('add')}
              className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-colors ${
                adjustmentType === 'add' 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Package size={20} className={adjustmentType === 'add' ? 'text-emerald-500' : ''} weight="regular" />
                <Plus size={16} className={adjustmentType === 'add' ? 'text-emerald-500' : ''} weight="bold" />
              </div>
              <span className="text-sm font-medium">Add Stock</span>
            </button>
            <button
              type="button"
              onClick={() => setAdjustmentType('subtract')}
              className={`p-3 border rounded-xl flex flex-col items-center gap-2 transition-colors ${
                adjustmentType === 'subtract' 
                  ? 'border-red-500 bg-red-50 text-red-700' 
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Package size={20} className={adjustmentType === 'subtract' ? 'text-red-500' : ''} weight="regular" />
                <Minus size={16} className={adjustmentType === 'subtract' ? 'text-red-500' : ''} weight="bold" />
              </div>
              <span className="text-sm font-medium">Subtract Stock</span>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantity to {adjustmentType === 'add' ? 'Add' : 'Subtract'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-slate-500 sm:text-sm">{unit}</span>
              </div>
            </div>
            {quantity && typeof quantity === 'number' && (
              <p className="text-xs text-slate-500 mt-2">
                New total will be: <span className="font-bold text-slate-700">
                  {adjustmentType === 'add' ? currentQuantity + quantity : Math.max(0, currentQuantity - quantity)} {unit}
                </span>
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason (Optional)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder={adjustmentType === 'add' ? 'e.g., Manual stock count correction' : 'e.g., Damaged goods, waste'}
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
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
              adjustmentType === 'add' 
                ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' 
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            }`}
          >
            {loading ? 'Saving...' : 'Confirm Adjustment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
