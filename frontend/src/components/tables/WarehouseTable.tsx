import React from 'react';
import { Package, AlertTriangle, TrendingDown, TrendingUp, Edit, Plus, Trash2, ArrowRightLeft } from 'lucide-react';

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

interface WarehouseTableProps {
  materials: Material[];
  userRole: string;
  loading: boolean;
  onAdjustStock: (id: string) => void;
  onRecordShipment: (id: string) => void;
  onEditMaterial?: (id: string) => void;
  onDeleteMaterial?: (id: string) => void;
}

export const WarehouseTable: React.FC<WarehouseTableProps> = ({
  materials,
  userRole,
  loading,
  onAdjustStock,
  onRecordShipment,
  onEditMaterial,
  onDeleteMaterial,
}) => {
  const getStatusBadge = (status: string) => {
    const config = {
      In_Stock: { color: 'bg-emerald-100 text-emerald-700', icon: <TrendingUp size={14} /> },
      Low_Stock: { color: 'bg-amber-100 text-amber-700', icon: <AlertTriangle size={14} /> },
      Out_of_Stock: { color: 'bg-red-100 text-red-700', icon: <TrendingDown size={14} /> },
    };
    return config[status as keyof typeof config] || config.In_Stock;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const canManageCatalog = userRole === 'Owner' || userRole === 'Manager';

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {materials.map((material) => {
          const badge = getStatusBadge(material.status);
          const isLow = material.status !== 'In_Stock';
          
          return (
            <div key={material.id} className={`bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3 flex flex-col ${isLow ? 'bg-red-50/30' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-slate-900">{material.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{material.sku}</div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                  {badge.icon}
                  {material.status.replace(/_/g, ' ')}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-500 block text-xs">Category</span>
                  <span className="text-slate-900">{material.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-xs">Quantity</span>
                  <span className={`font-medium ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
                    {material.quantity} {material.unit}
                  </span>
                </div>
                <div className="col-span-2 flex justify-between text-xs text-slate-500 border-t border-slate-100 pt-2 mt-1">
                  <span>Min Stock: {material.minStock} {material.unit}</span>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onAdjustStock(material.id)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Adjust Stock"
                >
                  <ArrowRightLeft size={18} />
                </button>
                <button
                  onClick={() => onRecordShipment(material.id)}
                  className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Record Shipment"
                >
                  <Plus size={18} />
                </button>
                
                {canManageCatalog && onEditMaterial && (
                  <button
                    onClick={() => onEditMaterial(material.id)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit Material"
                  >
                    <Edit size={18} />
                  </button>
                )}
                
                {canManageCatalog && onDeleteMaterial && (
                  <button
                    onClick={() => onDeleteMaterial(material.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Material"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {materials.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            <Package size={48} className="mx-auto mb-3 text-slate-300" />
            <p>No materials found in warehouse.</p>
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
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {materials.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  <Package size={48} className="mx-auto mb-3 text-slate-300" />
                  <p>No materials found in warehouse.</p>
                </td>
              </tr>
            ) : (
              materials.map((material) => {
                const badge = getStatusBadge(material.status);
                const isLow = material.status !== 'In_Stock';
                
                return (
                  <tr key={material.id} className={`hover:bg-slate-50 transition-colors ${isLow ? 'bg-red-50/30' : ''}`}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {material.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-mono">
                      {material.sku}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {material.category}
                    </td>
                    <td className={`px-6 py-4 text-sm text-right tabular-nums font-medium ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
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
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => onAdjustStock(material.id)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Adjust Stock"
                      >
                        <ArrowRightLeft size={18} />
                      </button>
                      <button
                        onClick={() => onRecordShipment(material.id)}
                        className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Record Shipment"
                      >
                        <Plus size={18} />
                      </button>
                      
                      {canManageCatalog && onEditMaterial && (
                        <button
                          onClick={() => onEditMaterial(material.id)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Edit Material"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                      
                      {canManageCatalog && onDeleteMaterial && (
                        <button
                          onClick={() => onDeleteMaterial(material.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="Delete Material"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
