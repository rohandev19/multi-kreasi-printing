// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { Truck } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface RecordShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  materialId: string | null;
  materialName?: string;
  unit?: string;
}

const shipmentSchema = z.object({
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  supplier: z.string().optional(),
  referenceNumber: z.string().optional(),
});

type ShipmentFormValues = z.infer<typeof shipmentSchema>;

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
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      quantity: 0,
      supplier: '',
      referenceNumber: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        quantity: 0,
        supplier: '',
        referenceNumber: ''
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.post(`/api/v1/inventory/${materialId}/shipment`, data);
      success('Shipment Recorded', `Received ${data.quantity} ${unit} of ${materialName}.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Failed to record shipment', err.response?.data?.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Incoming Shipment" size="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
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
                {...register('quantity')}
                className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.quantity ? 'border-red-500' : ''}`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-slate-500 sm:text-sm">{unit}</span>
              </div>
            </div>
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supplier / Vendor</label>
            <input
              type="text"
              {...register('supplier')}
              className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.supplier ? 'border-red-500' : ''}`}
              placeholder="e.g., CV Paper Supplier"
            />
            {errors.supplier && <p className="text-red-500 text-xs mt-1">{errors.supplier.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">PO / Reference Number</label>
            <input
              type="text"
              {...register('referenceNumber')}
              className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.referenceNumber ? 'border-red-500' : ''}`}
              placeholder="e.g., PO-2026-045"
            />
            {errors.referenceNumber && <p className="text-red-500 text-xs mt-1">{errors.referenceNumber.message}</p>}
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
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Record Shipment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
