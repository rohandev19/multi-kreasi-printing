import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { Package, Warning, TrendDown, TrendUp } from '@phosphor-icons/react';
import { useRoleContext } from '../contexts/RoleContext';
import { WarehouseTable } from '../components/tables/WarehouseTable';
import { MaterialFormModal } from '../components/modals/MaterialFormModal';
import { AdjustStockModal } from '../components/modals/AdjustStockModal';
import { RecordShipmentModal } from '../components/modals/RecordShipmentModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';

interface Material {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  minStock: number;
  category: string;
  status: 'In_Stock' | 'Low_Stock' | 'Out_of_Stock';
}



export default function Warehouse() {
  const { role, loading: roleLoading } = useRoleContext();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error: toastError } = useToast();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editMaterialId, setEditMaterialId] = useState<string | null>(null);
  
  const [adjustStockMaterial, setAdjustStockMaterial] = useState<Material | null>(null);
  const [shipmentMaterial, setShipmentMaterial] = useState<Material | null>(null);
  
  const [deleteMaterialId, setDeleteMaterialId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMaterials = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/inventory');
      const materialData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
      setMaterials(materialData);
    } catch (err: any) {
      console.error(err);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!roleLoading && role) {
      fetchMaterials();
    }
  }, [role, roleLoading, fetchMaterials]);

  const handleAdjustStock = (id: string) => {
    const material = materials.find(m => m.id === id);
    if (material) setAdjustStockMaterial(material);
  };

  const handleRecordShipment = (id: string) => {
    const material = materials.find(m => m.id === id);
    if (material) setShipmentMaterial(material);
  };

  const handleAddMaterial = () => {
    setEditMaterialId(null);
    setIsFormOpen(true);
  };

  const handleEditMaterial = (id: string) => {
    setEditMaterialId(id);
    setIsFormOpen(true);
  };

  const handleDeleteMaterial = (id: string) => {
    setDeleteMaterialId(id);
  };

  const confirmDelete = async () => {
    if (!deleteMaterialId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/v1/inventory/${deleteMaterialId}`);
      success('Bahan Baku Dihapus', 'Bahan baku telah berhasil dihapus dari inventaris.');
      fetchMaterials();
    } catch (err: any) {
      toastError('Gagal Menghapus', err.response?.data?.message || 'Silakan coba lagi.');
    } finally {
      setIsDeleting(false);
      setDeleteMaterialId(null);
    }
  };

  const stats = {
    total: materials.length,
    inStock: materials.filter(m => m.status === 'In_Stock').length,
    lowStock: materials.filter(m => m.status === 'Low_Stock').length,
    outOfStock: materials.filter(m => m.status === 'Out_of_Stock').length,
  };

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const canManageCatalog = role === 'Owner' || role === 'Manager';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Gudang & Inventaris Stok</h2>
        {canManageCatalog && (
          <button 
            onClick={handleAddMaterial}
            className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Tambah Bahan Baku
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Bahan Baku</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <Package className="text-slate-900" size={32} weight="regular" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Stok Tersedia</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.inStock}</p>
            </div>
            <TrendUp className="text-emerald-500" size={32} weight="regular" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Stok Menipis</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.lowStock}</p>
            </div>
            <Warning className="text-amber-500" size={32} weight="regular" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Stok Habis</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStock}</p>
            </div>
            <TrendDown className="text-red-500" size={32} weight="regular" />
          </div>
        </div>
      </div>

      <WarehouseTable 
        materials={materials} 
        userRole={role || ''} 
        loading={loading}
        onAdjustStock={handleAdjustStock}
        onRecordShipment={handleRecordShipment}
        onEditMaterial={handleEditMaterial}
        onDeleteMaterial={handleDeleteMaterial}
      />

      {/* Modals */}
      <MaterialFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchMaterials}
        materialId={editMaterialId}
      />

      <AdjustStockModal
        isOpen={!!adjustStockMaterial}
        onClose={() => setAdjustStockMaterial(null)}
        onSuccess={fetchMaterials}
        materialId={adjustStockMaterial?.id || null}
        materialName={adjustStockMaterial?.name}
        currentQuantity={adjustStockMaterial?.quantity}
        unit={adjustStockMaterial?.unit}
      />

      <RecordShipmentModal
        isOpen={!!shipmentMaterial}
        onClose={() => setShipmentMaterial(null)}
        onSuccess={fetchMaterials}
        materialId={shipmentMaterial?.id || null}
        materialName={shipmentMaterial?.name}
        unit={shipmentMaterial?.unit}
      />

      <ConfirmDialog
        isOpen={!!deleteMaterialId}
        title="Hapus Bahan Baku"
        message="Apakah Anda yakin ingin menghapus bahan baku ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus"
        variant="danger"
        loading={isDeleting}
        onClose={() => setDeleteMaterialId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
