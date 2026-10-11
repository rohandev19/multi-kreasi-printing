// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Trash } from '@phosphor-icons/react';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId?: string | null;
}

interface Product {
  id: string;
  name: string;
  basePrice: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

const orderItemSchema = z.object({
  productId: z.string().min(1, 'Produk wajib dipilih'),
  quantity: z.coerce.number().min(1, 'Jumlah minimal 1'),
  price: z.coerce.number().min(0, 'Harga tidak boleh negatif'),
});

const orderSchema = z.object({
  customerId: z.string().min(1, 'Pelanggan wajib dipilih'),
  status: z.enum(['Draft', 'Pending_Approval', 'Approved', 'In_Production', 'Completed']).default('Pending_Approval'),
  paymentStatus: z.enum(['Unpaid', 'Partial', 'Paid']).default('Unpaid'),
  items: z.array(orderItemSchema).min(1, 'Minimal 1 item produk diperlukan'),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  orderId
}) => {
  const isEditMode = !!orderId;
  const { success, error } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<any>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerId: '',
      status: 'Draft',
      paymentStatus: 'Unpaid',
      items: [{ productId: '', quantity: 1, price: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [productsRes, customersRes] = await Promise.all([
          api.get('/api/v1/products'),
          api.get('/api/v1/customers')
        ]);
        
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : productsRes.data.data || []);
        setCustomers(Array.isArray(customersRes.data) ? customersRes.data : customersRes.data.data || []);
      } catch (err: any) {
        console.error('Error fetching dropdown data', err);
      }
    };

    const fetchOrderDetails = async () => {
      setFetchingData(true);
      try {
        const response = await api.get(`/api/v1/orders/${orderId}`);
        const order = response.data;
        
        reset({
          customerId: order.customerId || '',
          status: order.status || 'Draft',
          paymentStatus: order.paymentStatus || 'Unpaid',
          items: order.items && order.items.length > 0 
            ? order.items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.unitPrice
              }))
            : [{ productId: '', quantity: 1, price: 0 }]
        });
      } catch {
        error('Gagal', 'Gagal memuat detail pesanan');
        onClose();
      } finally {
        setFetchingData(false);
      }
    };

    if (isOpen) {
      fetchInitialData();
      if (isEditMode) {
        fetchOrderDetails();
      } else {
        reset({
          customerId: '',
          status: 'Draft',
          paymentStatus: 'Unpaid',
          items: [{ productId: '', quantity: 1, price: 0 }]
        });
      }
    }
  }, [isOpen, orderId, isEditMode, reset, error, onClose]);

  const calculateTotal = () => {
    return watchItems.reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const onSubmit = async (data: OrderFormValues) => {
    setLoading(true);
    try {
      const payload = {
        customerId: data.customerId,
        status: data.status,
        paymentStatus: data.paymentStatus,
        items: data.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      };

      if (isEditMode) {
        await api.put(`/api/v1/orders/${orderId}`, payload);
        success('Pesanan Diperbarui', `Pesanan telah berhasil diperbarui.`);
      } else {
        await api.post('/api/v1/orders', payload);
        success('Pesanan Dibuat', `Pesanan baru telah berhasil dibuat.`);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Gagal menyimpan pesanan', err.response?.data?.message || 'Silakan coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Ubah Pesanan' : 'Buat Pesanan Baru'}
      size="2xl"
    >
      {fetchingData ? (
        <div className="p-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[80vh]">
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pelanggan <span className="text-red-500">*</span></label>
                <select
                  {...register('customerId')}
                  className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-slate-900 focus:border-slate-900 sm:text-sm ${errors.customerId ? 'border-red-500' : ''}`}
                >
                  <option value="">Pilih pelanggan...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
                {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status Pesanan</label>
                  <select
                    {...register('status')}
                    className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-slate-900 focus:border-slate-900 sm:text-sm ${errors.status ? 'border-red-500' : ''}`}
                  >
                    <option value="Draft">Draf</option>
                    <option value="Pending_Approval">Menunggu Persetujuan</option>
                    <option value="Approved">Disetujui</option>
                    <option value="In_Production">Dalam Produksi</option>
                    <option value="Completed">Selesai</option>
                  </select>
                  {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status Pembayaran</label>
                  <select
                    {...register('paymentStatus')}
                    className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-slate-900 focus:border-slate-900 sm:text-sm ${errors.paymentStatus ? 'border-red-500' : ''}`}
                  >
                    <option value="Unpaid">Belum Bayar</option>
                    <option value="Partial">Sebagian (DP)</option>
                    <option value="Paid">Lunas</option>
                  </select>
                  {errors.paymentStatus && <p className="text-red-500 text-xs mt-1">{errors.paymentStatus.message}</p>}
                </div>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Order Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800">Item Pesanan <span className="text-red-500">*</span></h3>
                <button
                  type="button"
                  onClick={() => append({ productId: '', quantity: 1, price: 0 })}
                  className="text-sm text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1"
                >
                  <Plus size={16} weight="bold" /> Tambah Item
                </button>
              </div>
              
              <div className="space-y-3">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl relative group transition-colors hover:border-slate-300">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Produk</label>
                        <select
                          {...register(`items.${index}.productId` as const)}
                          onChange={(e) => {
                            const productId = e.target.value;
                            setValue(`items.${index}.productId` as const, productId);
                            const product = products.find(p => p.id === productId);
                            if (product) {
                              setValue(`items.${index}.price` as const, product.basePrice);
                            }
                          }}
                          className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-slate-900 focus:border-slate-900 sm:text-sm ${errors.items?.[index]?.productId ? 'border-red-500' : ''}`}
                        >
                          <option value="">Pilih produk...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        {errors.items?.[index]?.productId && <p className="text-red-500 text-xs mt-1">{errors.items[index]?.productId?.message}</p>}
                      </div>
                      
                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Harga Satuan</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-slate-500 sm:text-sm">Rp</span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            {...register(`items.${index}.price` as const)}
                            className={`w-full pl-9 border-slate-300 rounded-lg shadow-sm focus:ring-slate-900 focus:border-slate-900 sm:text-sm ${errors.items?.[index]?.price ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.items?.[index]?.price && <p className="text-red-500 text-xs mt-1">{errors.items[index]?.price?.message}</p>}
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Jumlah</label>
                        <input
                          type="number"
                          min="1"
                          {...register(`items.${index}.quantity` as const)}
                          className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-slate-900 focus:border-slate-900 sm:text-sm ${errors.items?.[index]?.quantity ? 'border-red-500' : ''}`}
                        />
                        {errors.items?.[index]?.quantity && <p className="text-red-500 text-xs mt-1">{errors.items[index]?.quantity?.message}</p>}
                      </div>
                    </div>
                    
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-5"
                        title="Hapus item"
                      >
                        <Trash size={18} weight="regular" />
                      </button>
                    )}
                  </div>
                ))}
                {errors.items?.root && <p className="text-red-500 text-sm mt-2">{errors.items.root.message}</p>}
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
              <span className="font-semibold text-slate-800">Total Pembayaran</span>
              <span className="text-xl font-bold text-slate-900">{formatCurrency(calculateTotal())}</span>
            </div>

          </div>
          
          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                isEditMode ? 'Simpan Perubahan' : 'Buat Pesanan'
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
