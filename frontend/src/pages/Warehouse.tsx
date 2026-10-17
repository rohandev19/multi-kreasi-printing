import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Package, Warning, TrendDown, TrendUp, Truck, CheckCircle, Buildings, Plus, PencilSimple, Trash, Download } from '@phosphor-icons/react';
import { exportWarehouseInventory } from '../utils/exportUtils';
import { useRoleContext } from '../contexts/RoleContext';
import { WarehouseTable } from '../components/tables/WarehouseTable';
import { OutgoingShipmentsTable } from '../components/tables/OutgoingShipmentsTable';
import { MaterialFormModal } from '../components/modals/MaterialFormModal';
import { AdjustStockModal } from '../components/modals/AdjustStockModal';
import { RecordShipmentModal } from '../components/modals/RecordShipmentModal';
import { SuratJalanModal } from '../components/modals/SuratJalanModal';
import { ConfirmDeliveryModal } from '../components/modals/ConfirmDeliveryModal';
import { DispatchShipmentModal } from '../components/modals/DispatchShipmentModal';
import { SupplierFormModal } from '../components/modals/SupplierFormModal';
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
  const canManage = role === 'Owner' || role === 'Manager' || role === 'Warehouse_Staff';
  const [activeTab, setActiveTab] = useState<'inventory' | 'shipments' | 'suppliers'>('inventory');

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error: toastError } = useToast();

  // Outbound shipments state
  const [shipments, setShipments] = useState<any[]>([]);
  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [selectedSuratJalanId, setSelectedSuratJalanId] = useState<string | null>(null);
  const [confirmDeliveryShipment, setConfirmDeliveryShipment] = useState<{ id: string; shipmentNumber: string } | null>(null);
  const [dispatchShipmentState, setDispatchShipmentState] = useState<{
    shipment: any;
    isUpdateOnly: boolean;
  } | null>(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editMaterialId, setEditMaterialId] = useState<string | null>(null);
  
  const [adjustStockMaterial, setAdjustStockMaterial] = useState<Material | null>(null);
  const [shipmentMaterial, setShipmentMaterial] = useState<Material | null>(null);
  
  const [deleteMaterialId, setDeleteMaterialId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Suppliers state
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
  const [editSupplierId, setEditSupplierId] = useState<string | null>(null);
  const [deleteSupplierId, setDeleteSupplierId] = useState<string | null>(null);
  const [isDeletingSupplier, setIsDeletingSupplier] = useState(false);

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

  const fetchShipments = useCallback(async () => {
    setShipmentsLoading(true);
    try {
      const response = await api.get('/api/v1/shipments');
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setShipments(data);
    } catch (err: any) {
      console.error('Failed to load shipments', err);
      setShipments([]);
    } finally {
      setShipmentsLoading(false);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    setSuppliersLoading(true);
    try {
      const res = await api.get('/api/v1/suppliers');
      setSuppliers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load suppliers', err);
      setSuppliers([]);
    } finally {
      setSuppliersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!roleLoading && role) {
      fetchMaterials();
      fetchShipments();
      fetchSuppliers();
    }
  }, [role, roleLoading, fetchMaterials, fetchShipments, fetchSuppliers]);

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

  const confirmDeleteSupplier = async () => {
    if (!deleteSupplierId) return;
    setIsDeletingSupplier(true);
    try {
      await api.delete(`/api/v1/suppliers/${deleteSupplierId}`);
      success('Pemasok Dihapus', 'Pemasok berhasil dihapus.');
      fetchSuppliers();
    } catch (err: any) {
      toastError('Gagal Menghapus Pemasok', err.response?.data?.message || 'Gagal menghapus pemasok.');
    } finally {
      setIsDeletingSupplier(false);
      setDeleteSupplierId(null);
    }
  };

  const handleUpdateShipmentStatus = async (shipmentId: string, status: string) => {
    try {
      await api.patch(`/api/v1/shipments/${shipmentId}/status`, { status });
      success('Status Diperbarui', `Status pengiriman diubah ke ${status}.`);
      fetchShipments();
    } catch (err: any) {
      toastError('Gagal Memperbarui', err.response?.data?.message || 'Gagal mengubah status.');
    }
  };

  const stats = {
    total: materials.length,
    inStock: materials.filter(m => m.status === 'In_Stock').length,
    lowStock: materials.filter(m => m.status === 'Low_Stock').length,
    outOfStock: materials.filter(m => m.status === 'Out_of_Stock').length,
  };

  const shipmentStats = {
    total: shipments.length,
    preparing: shipments.filter(s => s.status === 'Preparing').length,
    inTransit: shipments.filter(s => s.status === 'In_Transit').length,
    delivered: shipments.filter(s => s.status === 'Delivered').length,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gudang & Logistik</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen rantai pasok bahan baku produksi dan monitoring surat jalan pengiriman produk jadi.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Link
            to="/dashboard/delivery"
            className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors border border-blue-200 flex items-center gap-1.5 shadow-2xs"
          >
            <Truck size={16} weight="bold" />
            <span>Portal Driver & POD</span>
          </Link>

          {activeTab === 'inventory' && materials.length > 0 && (
            <button
              onClick={() => exportWarehouseInventory(materials)}
              className="px-3.5 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors border border-slate-200 flex items-center gap-1.5 shadow-2xs"
              title="Ekspor Stok Bahan Baku ke CSV/Excel"
            >
              <Download size={16} weight="bold" />
              <span>Ekspor Stok</span>
            </button>
          )}

          {activeTab === 'inventory' && canManageCatalog && (
            <button 
              onClick={handleAddMaterial}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs"
            >
              Tambah Bahan Baku
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package size={18} weight="bold" />
          Bahan Baku & Inventaris Stok
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 font-semibold">
            {materials.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('shipments')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'shipments'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck size={18} weight="bold" />
          Surat Jalan & Pengiriman (Outbound)
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700 font-semibold">
            {shipments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'suppliers'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Buildings size={18} weight="bold" />
          Pemasok / Supplier
          <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 font-semibold">
            {suppliers.length}
          </span>
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Bahan</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
                </div>
                <Package className="text-slate-400" size={32} weight="duotone" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok Tersedia</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{stats.inStock}</p>
                </div>
                <TrendUp className="text-emerald-500" size={32} weight="duotone" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok Menipis</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">{stats.lowStock}</p>
                </div>
                <Warning className="text-amber-500" size={32} weight="duotone" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stok Habis</p>
                  <p className="text-2xl font-black text-red-600 mt-1">{stats.outOfStock}</p>
                </div>
                <TrendDown className="text-red-500" size={32} weight="duotone" />
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
        </>
      ) : activeTab === 'shipments' ? (
        <>
          {/* Shipments Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Surat Jalan</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{shipmentStats.total}</p>
                </div>
                <Truck className="text-slate-400" size={32} weight="duotone" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menyiapkan</p>
                  <p className="text-2xl font-black text-amber-600 mt-1">{shipmentStats.preparing}</p>
                </div>
                <Warning className="text-amber-500" size={32} weight="duotone" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dalam Perjalanan</p>
                  <p className="text-2xl font-black text-blue-600 mt-1">{shipmentStats.inTransit}</p>
                </div>
                <Truck className="text-blue-500" size={32} weight="duotone" />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selesai (POD)</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{shipmentStats.delivered}</p>
                </div>
                <CheckCircle className="text-emerald-500" size={32} weight="duotone" />
              </div>
            </div>
          </div>

          <OutgoingShipmentsTable
            shipments={shipments}
            loading={shipmentsLoading}
            onViewSuratJalan={(id) => setSelectedSuratJalanId(id)}
            onConfirmDelivery={(sh) => setConfirmDeliveryShipment(sh)}
            onUpdateStatus={handleUpdateShipmentStatus}
            onDispatchShipment={(sh, isUpdateOnly) =>
              setDispatchShipmentState({ shipment: sh, isUpdateOnly: !!isUpdateOnly })
            }
            userRole={role || ''}
          />
        </>
      ) : (
        /* Suppliers Tab */
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daftar Rekanan Pemasok</h2>
              <p className="text-xs text-slate-500">Pemasok bahan baku kertas, tinta, film laminasi, dan perlengkapan cetak</p>
            </div>
            {canManage && (
              <button
                onClick={() => {
                  setEditSupplierId(null);
                  setIsSupplierFormOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                <Plus size={16} weight="bold" />
                Tambah Pemasok
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            {suppliersLoading ? (
              <div className="py-12 text-center text-sm text-slate-500">Memuat data pemasok...</div>
            ) : suppliers.length === 0 ? (
              <div className="py-12 text-center">
                <Buildings size={40} weight="duotone" className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">Belum ada data pemasok</p>
                <p className="text-xs text-slate-400 mt-1">Tambahkan data rekanan pemasok bahan baku Anda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Nama Perusahaan</th>
                      <th className="px-6 py-3.5">Kontak Person</th>
                      <th className="px-6 py-3.5">Kontak</th>
                      <th className="px-6 py-3.5">Alamat</th>
                      <th className="px-6 py-3.5 text-center">Material Terkait</th>
                      {canManage && <th className="px-6 py-3.5 text-right">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {suppliers.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {s.name}
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {s.contactPerson || '-'}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {s.email && <div className="text-slate-700 font-medium">{s.email}</div>}
                          {s.phone && <div className="text-slate-400">{s.phone}</div>}
                          {!s.email && !s.phone && '-'}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                          {s.address || '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                            {s._count?.materials || 0} bahan
                          </span>
                        </td>
                        {canManage && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditSupplierId(s.id);
                                  setIsSupplierFormOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit Pemasok"
                              >
                                <PencilSimple size={16} weight="bold" />
                              </button>
                              <button
                                onClick={() => setDeleteSupplierId(s.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus Pemasok"
                              >
                                <Trash size={16} weight="bold" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

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

      <SuratJalanModal
        isOpen={!!selectedSuratJalanId}
        onClose={() => setSelectedSuratJalanId(null)}
        shipmentId={selectedSuratJalanId}
      />

      <DispatchShipmentModal
        isOpen={!!dispatchShipmentState}
        onClose={() => setDispatchShipmentState(null)}
        onSuccess={fetchShipments}
        shipment={dispatchShipmentState?.shipment || null}
        isUpdateOnly={dispatchShipmentState?.isUpdateOnly}
      />

      <ConfirmDeliveryModal
        isOpen={!!confirmDeliveryShipment}
        onClose={() => setConfirmDeliveryShipment(null)}
        shipmentId={confirmDeliveryShipment?.id || null}
        shipmentNumber={confirmDeliveryShipment?.shipmentNumber}
        onSuccess={fetchShipments}
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

      <SupplierFormModal
        isOpen={isSupplierFormOpen}
        onClose={() => setIsSupplierFormOpen(false)}
        onSuccess={fetchSuppliers}
        supplierId={editSupplierId}
      />

      <ConfirmDialog
        isOpen={!!deleteSupplierId}
        title="Hapus Data Pemasok"
        message="Apakah Anda yakin ingin menghapus data rekanan pemasok ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Pemasok"
        variant="danger"
        loading={isDeletingSupplier}
        onClose={() => setDeleteSupplierId(null)}
        onConfirm={confirmDeleteSupplier}
      />
    </div>
  );
}

