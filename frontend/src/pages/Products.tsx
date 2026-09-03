import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  CheckCircle,
  CurrencyDollar,
  FolderPlus,
  Image as ImageIcon,
  MagnifyingGlass,
  Package,
  PencilSimple,
  Plus,
  Power,
  Tag,
  Trash,
  X,
} from '@phosphor-icons/react';
import api from '../api/axios';
import { useToast } from '../contexts/ToastContext';

type Category = {
  id: string;
  name: string;
  description?: string;
};

type Product = {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId?: string;
  category?: { name?: string };
  basePrice?: number;
  unitOfMeasure?: string;
  status?: string;
  createdAt?: string;
  pricingTiers?: Array<{ id?: string; minQuantity: number; maxQuantity?: number | null; unitPrice: number }>;
  images?: Array<{ url: string; isPrimary?: boolean }>;
};

type ProductFormState = {
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  basePrice: string;
  unitOfMeasure: string;
  status: string;
};

type PricingTierFormState = {
  minQuantity: number | string;
  maxQuantity: number | string;
  unitPrice: number | string;
};

const emptyForm: ProductFormState = {
  sku: '',
  name: '',
  description: '',
  categoryId: '',
  basePrice: '',
  unitOfMeasure: 'pcs',
  status: 'Active',
};

const emptyPricingTier: PricingTierFormState = {
  minQuantity: 1,
  maxQuantity: '',
  unitPrice: '',
};

const normalizeArrayResponse = (payload: unknown): any[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const record = payload as { data?: unknown; items?: unknown };
    if (Array.isArray(record.data)) return record.data;
    if (Array.isArray(record.items)) return record.items;
  }

  return [];
};

const formatCurrency = (value: number | string | null | undefined) =>
  `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

export default function Products() {
  const { success, error: showError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [pricingTiers, setPricingTiers] = useState<PricingTierFormState[]>([emptyPricingTier]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const resetProductForm = useCallback(() => {
    setForm(emptyForm);
    setPricingTiers([emptyPricingTier]);
    setImageFiles([]);
    setEditingProductId(null);
    setShowForm(false);
  }, []);

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get('/api/v1/products', { params: { page: 1, limit: 200 } }),
        api.get('/api/v1/products/categories'),
      ]);

      setProducts(normalizeArrayResponse(productsResponse.data));
      setCategories(normalizeArrayResponse(categoriesResponse.data));
    } catch (err: any) {
      console.error(err);
      showError('Gagal memuat katalog', err.response?.data?.message || 'Tidak dapat memuat produk saat ini.');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) => {
      const categoryName = categories.find((category) => category.id === product.categoryId)?.name || product.category?.name || '';
      return (
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        categoryName.toLowerCase().includes(query)
      );
    });
  }, [categories, products, search]);

  const handlePricingTierChange = (index: number, field: keyof PricingTierFormState, value: string) => {
    setPricingTiers((current) =>
      current.map((tier, tierIndex) => {
        if (tierIndex !== index) return tier;

        if (field === 'minQuantity' || field === 'maxQuantity') {
          return { ...tier, [field]: value === '' ? '' : Number(value) };
        }

        return { ...tier, [field]: value };
      }),
    );
  };

  const addPricingTier = () => {
    setPricingTiers((current) => [
      ...current,
      {
        minQuantity: current.length > 0 ? Number(current[current.length - 1].minQuantity || 1) + 1 : 1,
        maxQuantity: '',
        unitPrice: '',
      },
    ]);
  };

  const removePricingTier = (index: number) => {
    setPricingTiers((current) => (current.length === 1 ? [emptyPricingTier] : current.filter((_, tierIndex) => tierIndex !== index)));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImageFiles(Array.from(event.target.files ?? []));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      categoryId: form.categoryId,
      basePrice: Number(form.basePrice),
      unitOfMeasure: form.unitOfMeasure.trim() || 'pcs',
      status: form.status,
    };

    if (!payload.sku || !payload.name || !payload.categoryId || Number.isNaN(payload.basePrice) || payload.basePrice < 0) {
      showError('Validasi gagal', 'Lengkapi field produk wajib sebelum menyimpan.');
      return;
    }

    const normalizedTiers = pricingTiers
      .filter((tier) => Number(tier.minQuantity) > 0 && Number(tier.unitPrice) >= 0)
      .map((tier) => ({
        minQuantity: Number(tier.minQuantity),
        maxQuantity: tier.maxQuantity === '' ? undefined : Number(tier.maxQuantity),
        unitPrice: Number(tier.unitPrice),
      }))
      .filter((tier) => Number.isFinite(tier.minQuantity) && Number.isFinite(tier.unitPrice));

    setSubmitting(true);
    try {
      let targetProductId = editingProductId;

      if (editingProductId) {
        await api.patch(`/api/v1/products/${editingProductId}`, payload);
      } else {
        const response = await api.post('/api/v1/products', payload);
        targetProductId = response.data?.id || response.data?.data?.id || null;
      }

      if (targetProductId && normalizedTiers.length > 0) {
        await api.post(`/api/v1/products/${targetProductId}/pricing-tiers`, { tiers: normalizedTiers });
      }

      if (targetProductId && imageFiles.length > 0) {
        for (const [index, file] of imageFiles.entries()) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('isPrimary', String(index === 0));
          await api.post(`/api/v1/products/${targetProductId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      }

      success(editingProductId ? 'Produk diperbarui' : 'Produk ditambahkan', `${payload.name} ${editingProductId ? 'telah diperbarui' : 'telah ditambahkan'} ke katalog.`);
      resetProductForm();
      await fetchCatalog();
    } catch (err: any) {
      console.error(err);
      showError('Tidak dapat menyimpan produk', err.response?.data?.message || 'Periksa kembali detail produk dan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setForm({
      sku: product.sku || '',
      name: product.name || '',
      description: product.description || '',
      categoryId: product.categoryId || '',
      basePrice: String(product.basePrice ?? ''),
      unitOfMeasure: product.unitOfMeasure || 'pcs',
      status: product.status || 'Active',
    });
    setPricingTiers(
      product.pricingTiers && product.pricingTiers.length > 0
        ? product.pricingTiers.map((tier) => ({
            minQuantity: tier.minQuantity ?? 1,
            maxQuantity: tier.maxQuantity ?? '',
            unitPrice: Number(tier.unitPrice ?? 0),
          }))
        : [emptyPricingTier],
    );
    setEditingProductId(product.id);
    setShowForm(true);
    setImageFiles([]);
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(`Hapus produk "${product.name}" dari katalog?`);
    if (!confirmed) return;

    try {
      await api.delete(`/api/v1/products/${product.id}`);
      success('Produk dihapus', `${product.name} telah dinonaktifkan dari katalog.`);
      await fetchCatalog();
    } catch (err: any) {
      console.error(err);
      showError('Tidak dapat menghapus produk', err.response?.data?.message || 'Produk tidak dapat dihapus saat ini.');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const nextStatus = product.status === 'Active' ? 'Inactive' : 'Active';

    try {
      await api.patch(`/api/v1/products/${product.id}`, { status: nextStatus });
      success('Status produk diperbarui', `${product.name} sekarang ${nextStatus}.`);
      await fetchCatalog();
    } catch (err: any) {
      console.error(err);
      showError('Tidak dapat mengubah status', err.response?.data?.message || 'Status produk tidak dapat diperbarui.');
    }
  };

  const handleCategorySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = categoryForm.name.trim();
    if (!name) {
      showError('Validasi gagal', 'Nama kategori wajib diisi.');
      return;
    }

    try {
      if (editingCategoryId) {
        await api.patch(`/api/v1/products/categories/${editingCategoryId}`, {
          name,
          description: categoryForm.description.trim(),
        });
        success('Kategori diperbarui', `${name} berhasil diperbarui.`);
      } else {
        await api.post('/api/v1/products/categories', {
          name,
          description: categoryForm.description.trim(),
        });
        success('Kategori ditambahkan', `${name} berhasil ditambahkan.`);
      }

      setCategoryForm({ name: '', description: '' });
      setEditingCategoryId(null);
      await fetchCatalog();
    } catch (err: any) {
      console.error(err);
      showError('Tidak dapat menyimpan kategori', err.response?.data?.message || 'Kategori tidak dapat disimpan saat ini.');
    }
  };

  const handleEditCategory = (category: Category) => {
    setCategoryForm({ name: category.name, description: category.description || '' });
    setEditingCategoryId(category.id);
  };

  const handleDeleteCategory = async (category: Category) => {
    const confirmed = window.confirm(`Hapus kategori "${category.name}"?`);
    if (!confirmed) return;

    try {
      await api.delete(`/api/v1/products/categories/${category.id}`);
      success('Kategori dihapus', `${category.name} berhasil dihapus.`);
      if (editingCategoryId === category.id) {
        setCategoryForm({ name: '', description: '' });
        setEditingCategoryId(null);
      }
      await fetchCatalog();
    } catch (err: any) {
      console.error(err);
      showError('Tidak dapat menghapus kategori', err.response?.data?.message || 'Kategori masih digunakan produk atau tidak dapat dihapus.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-600">Catalog Management</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Products</h2>
          <p className="mt-1 text-sm text-slate-500">Kelola katalog produk, kategori, dan status publik untuk Owner dan Manager.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) {
              resetProductForm();
              return;
            }
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-primary-200 transition hover:bg-primary-700"
        >
          <Plus size={18} weight="bold" />
          {showForm ? 'Tutup Form' : 'Tambah Produk'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Total Produk</span>
            <Package size={18} className="text-primary-600" weight="fill" />
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900">{products.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Kategori</span>
            <Tag size={18} className="text-primary-600" weight="fill" />
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900">{categories.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Catalog Ready</span>
            <CheckCircle size={18} className="text-emerald-600" weight="fill" />
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900">{filteredProducts.length}</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          {showForm && (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm shadow-primary-200">
                   <Plus size={16} weight="bold" />
                 </span>
                 <h3 className="text-lg font-bold text-slate-900">{editingProductId ? 'Edit Produk' : 'Tambah Produk'}</h3>
               </div>
               <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Owner / Manager</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
               <label className="space-y-2 text-sm font-medium text-slate-700">
                 SKU
                 <input
                   value={form.sku}
                   onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))}
                   className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                   placeholder="MK-001"
                 />
               </label>

               <label className="space-y-2 text-sm font-medium text-slate-700">
                 Nama Produk
                 <input
                   value={form.name}
                   onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                   className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                   placeholder="Business Card Printing"
                 />
               </label>

               <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
                 Deskripsi
                 <textarea
                   value={form.description}
                   onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                   rows={3}
                   className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                   placeholder="Deskripsi singkat produk"
                 />
               </label>

               <label className="space-y-2 text-sm font-medium text-slate-700">
                 Kategori
                 <select
                   value={form.categoryId}
                   onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
                   className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                 >
                   <option value="">Pilih kategori</option>
                   {categories.map((category) => (
                     <option key={category.id} value={category.id}>
                       {category.name}
                     </option>
                   ))}
                 </select>
               </label>

               <label className="space-y-2 text-sm font-medium text-slate-700">
                 Status
                 <select
                   value={form.status}
                   onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                   className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                 >
                   <option value="Active">Active</option>
                   <option value="Inactive">Inactive</option>
                   <option value="Discontinued">Discontinued</option>
                 </select>
               </label>

               <label className="space-y-2 text-sm font-medium text-slate-700">
                 Harga Dasar
                 <div className="relative">
                   <CurrencyDollar size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" weight="regular" />
                   <input
                     type="number"
                     min="0"
                     step="1000"
                     value={form.basePrice}
                     onChange={(event) => setForm((current) => ({ ...current, basePrice: event.target.value }))}
                     className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                     placeholder="250000"
                   />
                 </div>
               </label>

               <label className="space-y-2 text-sm font-medium text-slate-700">
                 Satuan
                 <input
                   value={form.unitOfMeasure}
                   onChange={(event) => setForm((current) => ({ ...current, unitOfMeasure: event.target.value }))}
                   className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                   placeholder="pcs"
                 />
               </label>

               <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
                 Gambar Produk (multi upload)
                 <input
                   type="file"
                   accept="image/png,image/jpeg,image/webp"
                   multiple
                   onChange={handleImageChange}
                   className="block w-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white file:shadow-sm"
                 />
                 {imageFiles.length > 0 && (
                   <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                     {imageFiles.map((file, idx) => (
                       <span key={`${file.name}-${idx}`} className="rounded-full bg-slate-100 px-2.5 py-1">
                         {file.name}
                       </span>
                     ))}
                   </div>
                 )}
               </label>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
               <div className="mb-3 flex items-center justify-between gap-3">
                 <div>
                   <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-600">Pricing Tiers</h4>
                   <p className="mt-1 text-xs text-slate-500">Diskon sesuai kuantitas untuk pesanan massal.</p>
                 </div>
                 <button
                   type="button"
                   onClick={addPricingTier}
                   className="rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 transition hover:bg-primary-100"
                 >
                   + Tambah Tier
                 </button>
               </div>

               <div className="space-y-3">
                 {pricingTiers.map((tier, index) => (
                   <div key={`${index}-${tier.minQuantity}`} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                     <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                       Min qty
                       <input
                         type="number"
                         min="1"
                         value={tier.minQuantity}
                         onChange={(event) => handlePricingTierChange(index, 'minQuantity', event.target.value)}
                         className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                       />
                     </label>

                     <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                       Max qty
                       <input
                         type="number"
                         min="1"
                         placeholder="Opsional"
                         value={tier.maxQuantity}
                         onChange={(event) => handlePricingTierChange(index, 'maxQuantity', event.target.value)}
                         className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                       />
                     </label>

                     <label className="space-y-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                       Unit price
                       <input
                         type="number"
                         min="0"
                         step="1000"
                         value={tier.unitPrice}
                         onChange={(event) => handlePricingTierChange(index, 'unitPrice', event.target.value)}
                         className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                       />
                     </label>

                     <button
                       type="button"
                       onClick={() => removePricingTier(index)}
                       className="self-end rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                     >
                       Hapus
                     </button>
                   </div>
                 ))}
               </div>
              </div>

              <div className="mt-5 flex justify-end gap-3">
               <button
                 type="button"
                 onClick={resetProductForm}
                 className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
               >
                 Batal
               </button>
               <button
                 type="submit"
                 disabled={submitting}
                 className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
               >
                 {submitting ? 'Menyimpan...' : editingProductId ? 'Simpan Perubahan' : 'Simpan Produk'}
               </button>
              </div>
            </form>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Kategori</h3>
              <p className="text-xs text-slate-500">Atur kategori untuk katalog.</p>
            </div>
            <FolderPlus size={18} className="text-primary-600" weight="fill" />
          </div>

          <form onSubmit={handleCategorySubmit} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Nama Kategori
              <input
               value={categoryForm.name}
               onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
               className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
               placeholder="Packaging"
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Deskripsi
              <textarea
               rows={2}
               value={categoryForm.description}
               onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))}
               className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
               placeholder="Deskripsi singkat"
              />
            </label>

            <div className="flex gap-2">
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
               <Plus size={14} weight="bold" />
               {editingCategoryId ? 'Update' : 'Tambah'}
              </button>
              {editingCategoryId && (
               <button
                 type="button"
                 onClick={() => {
                   setCategoryForm({ name: '', description: '' });
                   setEditingCategoryId(null);
                 }}
                 className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
               >
                 <X size={14} />
                 Cancel
               </button>
              )}
            </div>
          </form>

          <div className="mt-4 space-y-3">
            {categories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Belum ada kategori.</div>
            ) : (
              categories.map((category) => (
               <div key={category.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                 <div className="flex items-start justify-between gap-3">
                   <div>
                     <p className="font-bold text-slate-800">{category.name}</p>
                     <p className="mt-1 text-xs text-slate-500">{category.description || 'Tidak ada deskripsi.'}</p>
                   </div>
                   <div className="flex items-center gap-2">
                     <button
                       type="button"
                       onClick={() => handleEditCategory(category)}
                       className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100"
                       aria-label={`Edit ${category.name}`}
                     >
                       <PencilSimple size={14} />
                     </button>
                     <button
                       type="button"
                       onClick={() => handleDeleteCategory(category)}
                       className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100"
                       aria-label={`Delete ${category.name}`}
                     >
                       <Trash size={14} />
                     </button>
                   </div>
                 </div>
               </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <MagnifyingGlass size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" weight="regular" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
              placeholder="Cari nama, SKU, atau kategori"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-52 items-center justify-center text-sm text-slate-500">Loading product catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex min-h-52 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">Tidak ada produk yang sesuai pencarian.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <article key={product.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
               {product.images?.[0]?.url ? (
                 <img src={product.images[0].url} alt={product.name} className="mb-4 h-40 w-full rounded-xl object-cover" />
               ) : (
                 <div className="mb-4 flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-slate-400">
                   <ImageIcon size={28} />
                 </div>
               )}

               <div className="flex items-start justify-between gap-3">
                 <div>
                   <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{product.sku}</p>
                   <h4 className="mt-2 text-lg font-bold text-slate-900">{product.name}</h4>
                 </div>
                 <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${product.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : product.status === 'Inactive' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                   {product.status || 'Active'}
                 </span>
               </div>

               <p className="mt-3 line-clamp-3 text-sm text-slate-600">{product.description || 'Tidak ada deskripsi untuk produk ini.'}</p>

               <div className="mt-4 space-y-2 text-sm text-slate-600">
                 <div className="flex items-center justify-between gap-2">
                   <span>Kategori</span>
                   <span className="font-semibold text-slate-900">{categories.find((category) => category.id === product.categoryId)?.name || product.category?.name || 'Uncategorized'}</span>
                 </div>
                 <div className="flex items-center justify-between gap-2">
                   <span>Harga</span>
                   <span className="font-semibold text-slate-900">{formatCurrency(product.basePrice ?? 0)}</span>
                 </div>
                 <div className="flex items-center justify-between gap-2">
                   <span>Unit</span>
                   <span className="font-semibold text-slate-900">{product.unitOfMeasure || 'pcs'}</span>
                 </div>
                 {product.pricingTiers && product.pricingTiers.length > 0 && (
                   <div className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                     <span className="font-bold">Tiered pricing:</span>{' '}
                     {product.pricingTiers.slice(0, 2).map((tier) => `${tier.minQuantity}${tier.maxQuantity ? `-${tier.maxQuantity}` : '+'} @ ${formatCurrency(tier.unitPrice)}`).join(' • ')}
                   </div>
                 )}
               </div>

               <div className="mt-4 flex flex-wrap gap-2">
                 <button type="button" onClick={() => handleEditProduct(product)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                   <PencilSimple size={14} />
                   Edit
                 </button>
                 <button type="button" onClick={() => handleToggleStatus(product)} className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">
                   <Power size={14} />
                   {product.status === 'Active' ? 'Inactive' : 'Active'}
                 </button>
                 <button type="button" onClick={() => handleDeleteProduct(product)} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">
                   <Trash size={14} />
                   Delete
                 </button>
               </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
