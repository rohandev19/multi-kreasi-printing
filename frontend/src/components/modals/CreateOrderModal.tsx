// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Trash2 } from 'lucide-react';
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
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
});

const orderSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  status: z.enum(['Draft', 'Pending_Approval', 'Approved', 'In_Production', 'Completed']).default('Pending_Approval'),
  paymentStatus: z.enum(['Unpaid', 'Partial', 'Paid']).default('Unpaid'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
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
      } catch {
        console.error('Error fetching dropdown data', _err);
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
        error('Error', 'Failed to load order details');
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
        success('Order Updated', `Order has been updated successfully.`);
      } else {
        await api.post('/api/v1/orders', payload);
        success('Order Created', `New order has been created successfully.`);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      error('Failed to save order', err.response?.data?.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Order' : 'Create New Order'}
      size="2xl"
    >
      {fetchingData ? (
        <div className="p-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col max-h-[80vh]">
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer <span className="text-red-500">*</span></label>
                <select
                  {...register('customerId')}
                  className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.customerId ? 'border-red-500' : ''}`}
                >
                  <option value="">Select a customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
                {errors.customerId && <p className="text-red-500 text-xs mt-1">{errors.customerId.message}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Order Status</label>
                  <select
                    {...register('status')}
                    className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.status ? 'border-red-500' : ''}`}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending_Approval">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="In_Production">In Production</option>
                    <option value="Completed">Completed</option>
                  </select>
                  {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment</label>
                  <select
                    {...register('paymentStatus')}
                    className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.paymentStatus ? 'border-red-500' : ''}`}
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                  {errors.paymentStatus && <p className="text-red-500 text-xs mt-1">{errors.paymentStatus.message}</p>}
                </div>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Order Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800">Order Items <span className="text-red-500">*</span></h3>
                <button
                  type="button"
                  onClick={() => append({ productId: '', quantity: 1, price: 0 })}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  <Plus size={16} /> Add Item
                </button>
              </div>
              
              <div className="space-y-3">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl relative group transition-colors hover:border-slate-300">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Product</label>
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
                          className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.items?.[index]?.productId ? 'border-red-500' : ''}`}
                        >
                          <option value="">Select product...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        {errors.items?.[index]?.productId && <p className="text-red-500 text-xs mt-1">{errors.items[index]?.productId?.message}</p>}
                      </div>
                      
                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Unit Price</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-slate-500 sm:text-sm">Rp</span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            {...register(`items.${index}.price` as const)}
                            className={`w-full pl-9 border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.items?.[index]?.price ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.items?.[index]?.price && <p className="text-red-500 text-xs mt-1">{errors.items[index]?.price?.message}</p>}
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                        <input
                          type="number"
                          min="1"
                          {...register(`items.${index}.quantity` as const)}
                          className={`w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.items?.[index]?.quantity ? 'border-red-500' : ''}`}
                        />
                        {errors.items?.[index]?.quantity && <p className="text-red-500 text-xs mt-1">{errors.items[index]?.quantity?.message}</p>}
                      </div>
                    </div>
                    
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-5"
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                {errors.items?.root && <p className="text-red-500 text-sm mt-2">{errors.items.root.message}</p>}
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center">
              <span className="font-medium text-indigo-900">Total Amount</span>
              <span className="text-xl font-bold text-indigo-700">{formatCurrency(calculateTotal())}</span>
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                isEditMode ? 'Save Changes' : 'Create Order'
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
