import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../api/axios';
import { useToast } from '../../contexts/ToastContext';
import { Plus, Trash2, Search } from 'lucide-react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId?: string | null; // If provided, modal acts as Edit mode
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

interface OrderItemInput {
  productId: string;
  quantity: number;
  notes?: string;
  price?: number; // Pre-filled from product but editable
}

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
  
  // Form State
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<OrderItemInput[]>([
    { productId: '', quantity: 1, price: 0 }
  ]);
  const [status, setStatus] = useState('Pending');
  const [paymentStatus, setPaymentStatus] = useState('Unpaid');
  
  // Dropdown Data
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
      if (isEditMode) {
        fetchOrderDetails();
      } else {
        resetForm();
      }
    }
  }, [isOpen, orderId]);

  const fetchInitialData = async () => {
    try {
      // In a real app, we'd fetch products and customers from the API
      // For now, we simulate fetching dropdown data
      const [productsRes, customersRes] = await Promise.all([
        api.get('/api/v1/products').catch(() => ({ data: { data: getMockProducts() } })),
        api.get('/api/v1/customers').catch(() => ({ data: { data: getMockCustomers() } }))
      ]);
      
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : productsRes.data.data || getMockProducts());
      setCustomers(Array.isArray(customersRes.data) ? customersRes.data : customersRes.data.data || getMockCustomers());
    } catch (err) {
      console.error('Error fetching dropdown data', err);
    }
  };

  const fetchOrderDetails = async () => {
    setFetchingData(true);
    try {
      const response = await api.get(`/api/v1/orders/${orderId}`);
      const order = response.data;
      
      setCustomerId(order.customerId || '');
      setStatus(order.status);
      setPaymentStatus(order.paymentStatus);
      
      if (order.items && order.items.length > 0) {
        setItems(order.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.unitPrice,
        })));
      }
    } catch (err) {
      error('Error', 'Failed to load order details');
      onClose();
    } finally {
      setFetchingData(false);
    }
  };

  const resetForm = () => {
    setCustomerId('');
    setItems([{ productId: '', quantity: 1, price: 0 }]);
    setStatus('Pending');
    setPaymentStatus('Unpaid');
  };

  // Mock data fallbacks if endpoints don't exist yet
  const getMockProducts = () => [
    { id: '1', name: 'Business Cards (1 Box)', basePrice: 50000 },
    { id: '2', name: 'A4 Flyer (1 Rim)', basePrice: 150000 },
    { id: '3', name: 'Banner 2x1m', basePrice: 85000 },
  ];
  
  const getMockCustomers = () => [
    { id: '1', name: 'Budi Santoso', email: 'budi@example.com' },
    { id: '2', name: 'Siti Aminah', email: 'siti@example.com' },
  ];

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    const newItems = [...items];
    newItems[index].productId = productId;
    newItems[index].price = product ? product.basePrice : 0;
    setItems(newItems);
  };

  const updateItemQty = (index: number, qty: number) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, qty);
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!customerId) {
      error('Validation Error', 'Please select a customer');
      return;
    }
    
    if (items.some(item => !item.productId)) {
      error('Validation Error', 'Please select a product for all items');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerId,
        status,
        paymentStatus,
        items: items.map(item => ({
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
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer <span className="text-red-500">*</span></label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Select a customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Order Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending_Approval">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="In_Production">In Production</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
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
                  onClick={addItem}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  <Plus size={16} /> Add Item
                </button>
              </div>
              
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl relative group transition-colors hover:border-slate-300">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Product</label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(index, e.target.value)}
                          className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        >
                          <option value="">Select product...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
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
                            value={item.price}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].price = Number(e.target.value);
                              setItems(newItems);
                            }}
                            className="w-full pl-9 border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItemQty(index, parseInt(e.target.value) || 1)}
                          className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-5"
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
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
