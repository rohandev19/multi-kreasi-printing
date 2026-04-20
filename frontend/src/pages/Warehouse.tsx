import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { Package, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { useRoleContext } from '../contexts/RoleContext';
import { WarehouseTable } from '../components/tables/WarehouseTable';

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

const fallbackMaterials: Material[] = [
  { id: '1', name: 'A4 Paper 80gsm', sku: 'PPR-A4-80', quantity: 5000, unit: 'sheets', minStock: 1000, category: 'Paper', status: 'In_Stock' },
  { id: '2', name: 'Vinyl Banner Material', sku: 'VNL-BNR-01', quantity: 250, unit: 'm²', minStock: 500, category: 'Vinyl', status: 'Low_Stock' },
  { id: '3', name: 'Inkjet Ink Cyan', sku: 'INK-CYN-01', quantity: 0, unit: 'liters', minStock: 5, category: 'Ink', status: 'Out_of_Stock' },
  { id: '4', name: 'Laminating Film', sku: 'LAM-FLM-01', quantity: 1200, unit: 'm²', minStock: 300, category: 'Laminate', status: 'In_Stock' },
  { id: '5', name: 'Cardstock 300gsm', sku: 'CRD-300', quantity: 800, unit: 'sheets', minStock: 1000, category: 'Paper', status: 'Low_Stock' },
];

export default function Warehouse() {
  const { role, loading: roleLoading } = useRoleContext();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/inventory');
      const materialData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
      setMaterials(materialData.length > 0 ? materialData : fallbackMaterials);
    } catch (err: any) {
      console.error(err);
      setMaterials(fallbackMaterials);
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
    alert(`Adjust stock for material ${id}`);
  };

  const handleRecordShipment = (id: string) => {
    alert(`Record shipment for material ${id}`);
  };

  const handleEditMaterial = (id: string) => {
    alert(`Edit material ${id}`);
  };

  const handleDeleteMaterial = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      alert(`Delete material ${id}`);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const canManageCatalog = role === 'Owner' || role === 'Manager';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Warehouse Inventory</h2>
        {canManageCatalog && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Add Material
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Materials</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
            </div>
            <Package className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">In Stock</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.inStock}</p>
            </div>
            <TrendingUp className="text-emerald-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Low Stock</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{stats.lowStock}</p>
            </div>
            <AlertTriangle className="text-amber-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.outOfStock}</p>
            </div>
            <TrendingDown className="text-red-500" size={32} />
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
    </div>
  );
}
