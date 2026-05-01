import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';

interface MaterialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  materialId?: string | null;
}

export const MaterialFormModal: React.FC<MaterialFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  materialId
}) => {
  const isEditMode = !!materialId;
  const { success, error } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Paper');
  const [unit, setUnit] = useState('sheets');
  const [minStock, setMinStock] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        fetchMaterialDetails();
      } else {
        resetForm();
      }
    }
  }, [isOpen, materialId]);

  const fetchMaterialDetails = async () => {
    setFetchingData(true);
    try {
      const response = await api.get(`/api/v1/inventory/${materialId}`);
      const material = response.data;
      
      setName(material.name || '');
      setSku(material.sku || '');
      setCategory(material.category || 'Paper');
      setUnit(material.unit || 'sheets');
      setMinStock(material.minStock || 0);
    } catch (err) {
      error('Error', 'Failed to load material details');
      onClose();
    } finally {
      setFetchingData(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSku('');
    setCategory('Paper');
    setUnit('sheets');
    setMinStock('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      sku,
      category,
      unit,
      minStock: Number(minStock)
    };

    try {
      if (isEditMode) {
        await api.put(`/api/v1/inventory/${materialId}`, payload);
        success('Material Updated', `${name} has been updated successfully.`);
      } else {
        await api.post('/api/v1/inventory', payload);
        success('Material Added', `${name} has been added to inventory.`);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Failed to save material', err.response?.data?.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Material' : 'Add New Material'}
      size="md"
    >
      {fetchingData ? (
        <div className="p-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Material Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., A4 Paper 80gsm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SKU <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., PPR-A4-80"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="Paper">Paper</option>
                  <option value="Ink">Ink</option>
                  <option value="Vinyl">Vinyl</option>
                  <option value="Laminate">Laminate</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit of Measure <span className="text-red-500">*</span></label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="sheets">Sheets</option>
                  <option value="m²">Square Meters (m²)</option>
                  <option value="liters">Liters</option>
                  <option value="kg">Kilograms</option>
                  <option value="pieces">Pieces</option>
                  <option value="boxes">Boxes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Min. Stock Alert <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="0"
                  value={minStock}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="e.g., 1000"
                  required
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
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Material')}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
