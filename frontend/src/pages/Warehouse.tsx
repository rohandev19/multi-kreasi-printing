import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Package, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

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
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fallback data for demo
  const fallbackMaterials: Material[] = [
    { id: '1', name: 'A4 Paper 80gsm', sku: 'PPR-A4-80', quantity: 5000, unit: 'sheets', minStock: 1000, category: 'Paper', status: 'In_Stock' },
    { id: '2', name: 'Vinyl Banner Material', sku: 'VNL-BNR-01', quantity: 250, unit: 'm²', minStock: 500, category: 'Vinyl', status: 'Low_Stock' },
    { id: '3', name: 'Inkjet Ink Cyan', sku: 'INK-CYN-01', quantity: 0, unit: 'liters', minStock: 5, category: 'Ink', status: 'Out_of_Stock' },
    { id: '4', name: 'Laminating Film', sku: 'LAM-FLM-01', quantity: 1200, unit: 'm²', minStock: 300, category: 'Laminate', status: 'In_Stock' },
    { id: '5', name: 'Cardstock 300gsm', sku: 'CRD-300', quantity: 800, unit: 'sheets', minStock: 1000, category: 'Paper', status: 'Low_Stock' },
  ];

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/api/v1/warehouse/materials');
      const materialData = Array.isArray(response.data) 
        ? response.data 
        : response.data.data || [];
      setMaterials(materialData.length > 0 ? materialData : fallbackMaterials);
    } catch (err: any) {
      setError('');
      setMaterials(fallbackMaterials); // Use fallback on error
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      In_Stock: { color: 'bg-emerald-100 text-emerald-700', icon: <TrendingUp size={14} /> },
      Low_Stock: { color: 'bg-amber-100 text-amber-700', icon: <AlertTriangle size={14} /> },
      Out_of_Stock: { color: 'bg-red-100 text-red-700', icon: <TrendingDown size={14} /> },
    };
    return config[status as keyof typeof config] || config.In_Stock;
  };

  const stats = {
    total: materials.length,
    inStock: materials.filter(m => m.status === 'In_Stock').length,
    lowStock: materials.filter(m => m.status === 'Low_Stock').length,
    outOfStock: materials.filter(m => m.status === 'Out_of_Stock').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Warehouse Inventory</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Add Material
        </button>
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

      {/* Materials Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Material
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Min Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {materials.map((material) => {
                const badge = getStatusBadge(material.status);
                return (
                  <tr key={material.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {material.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-mono">
                      {material.sku}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {material.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-right tabular-nums font-medium text-slate-900">
                      {material.quantity} {material.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-right tabular-nums text-slate-600">
                      {material.minStock} {material.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                        {badge.icon}
                        {material.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
