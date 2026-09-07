import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  CheckCircle,
  Eye,
  FolderPlus,
  Image as ImageIcon,
  MagnifyingGlass,
  Package,
  PencilSimple,
  Plus,
  Power,
  Star,
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
  images?: Array<{ id?: string; url: string; isPrimary?: boolean; createdAt?: string }>;
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

const MAX_IMAGES_PER_PRODUCT = 5;

const PRODUCT_STATUS_LABEL: Record<string, string> = {
  Active: 'Aktif',
  Inactive: 'Nonaktif',
  Discontinued: 'Dihentikan',
};

type SortKey = 'newest' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

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

const toRupiahInput = (num: number | string): string => {
  const n = typeof num === 'string' ? num.replace(/\D/g, '') : String(Math.max(0, Math.floor(Number(num || 0))));
  if (!n || n === '0') return '';
  return Number(n).toLocaleString('id-ID');
};

const fromRupiahInput = (val: string): number => {
  const clean = (val || '').replace(/\D/g, '');
  return clean ? Number(clean) : 0;
};

export default function Products() {
  const { success, error: showError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [pricingTiers, setPricingTiers] = useState<PricingTierFormState[]>([emptyPricingTier]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [primaryNewFileIndex, setPrimaryNewFileIndex] = useState<number>(0);
  const [existingImages, setExistingImages] = useState<Product['images']>([]);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  const resetProductForm = useCallback(() => {
    imagePreviews.forEach((preview) => {
      URL.revokeObjectURL(preview);
    });
    setForm(emptyForm);
    setPricingTiers([emptyPricingTier]);
    setImageFiles([]);
    setImagePreviews([]);
    setPrimaryNewFileIndex(0);
    setExistingImages([]);
    setEditingProductId(null);
    setShowForm(false);
  }, [imagePreviews]);

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

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [imagePreviews]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = products;

    if (query) {
      result = result.filter((product) => {
        const categoryName = categories.find((category) => category.id === product.categoryId)?.name || product.category?.name || '';
        return (
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          categoryName.toLowerCase().includes(query)
        );
      });
    }

    if (categoryFilter !== 'all') {
      result = result.filter((product) => product.categoryId === categoryFilter);
    }

    if (statusFilter === 'all') {
      result = result.filter((product) => product.status !== 'Discontinued');
    } else {
      result = result.filter((product) => (product.status || 'Active') === statusFilter);
    }

    const sorted = [...result];
    switch (sortBy) {
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'id-ID'));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name, 'id-ID'));
        break;
      case 'price-asc':
        sorted.sort((a, b) => Number(a.basePrice ?? 0) - Number(b.basePrice ?? 0));
        break;
      case 'price-desc':
        sorted.sort((a, b) => Number(b.basePrice ?? 0) - Number(a.basePrice ?? 0));
        break;
      case 'newest':
      default:
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
        );
    }
    return sorted;
  }, [categories, categoryFilter, products, search, sortBy, statusFilter]);

  const remainingImageSlots = useMemo(
    () => Math.max(0, MAX_IMAGES_PER_PRODUCT - (existingImages?.length ?? 0) - imageFiles.length),
    [existingImages, imageFiles],
  );

  const handlePricingTierChange = (index: number, field: keyof PricingTierFormState, value: string) => {
    setPricingTiers((current) =>
      current.map((tier, tierIndex) => {
        if (tierIndex !== index) return tier;

        if (field === 'minQuantity' || field === 'maxQuantity') {
          return { ...tier, [field]: value === '' ? '' : Number(value) };
        }

        if (field === 'unitPrice') {
          return { ...tier, unitPrice: toRupiahInput(value) };
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
    const files = Array.from(event.target.files ?? []);
    const allowed = files.slice(0, remainingImageSlots);

    // Don't revoke existing previews here, just create new ones
    const previews = allowed.map((file) => URL.createObjectURL(file));
    
    setImageFiles((current) => [...current, ...allowed]);
    setImagePreviews((current) => [...current, ...previews]);
    
    // Maintain primary file index or default to 0 if it's the first time
    if (primaryNewFileIndex >= imageFiles.length + allowed.length && allowed.length > 0) {
      setPrimaryNewFileIndex(0);
    }
    event.target.value = '';
  };

  const removeNewFile = (index: number) => {
    setImagePreviews((current) => {
      const next = current.filter((_, i) => i !== index);
      const removed = current[index];
      if (removed) URL.revokeObjectURL(removed);
      return next;
    });
    setImageFiles((current) => current.filter((_, i) => i !== index));
    setPrimaryNewFileIndex((current) => {
      if (current === index) return 0;
      return current > index ? current - 1 : current;
    });
  };

  const setPrimaryNewFile = (index: number) => {
    setPrimaryNewFileIndex(index);
  };

  const deleteExistingImage = async (imageId: string) => {
    if (!editingProductId) return;
    const confirmed = window.confirm('Hapus gambar produk ini?');
    if (!confirmed) return;
    try {
      await api.delete(`/api/v1/products/${editingProductId}/images/${imageId}`);
      setExistingImages((current) => (current ?? []).filter((img) => img.id !== imageId));
      success('Gambar dihapus', 'Gambar produk berhasil dihapus.');
    } catch (err: any) {
      showError('Gagal hapus gambar', err.response?.data?.message || 'Tidak dapat menghapus gambar.');
    }
  };

  const setPrimaryExistingImage = async (imageId: string) => {
    if (!editingProductId) return;
    try {
      await api.patch(`/api/v1/products/${editingProductId}/images/${imageId}/set-primary`);
      setExistingImages((current) =>
        (current ?? []).map((img) => ({ ...img, isPrimary: img.id === imageId })),
      );
      success('Gambar utama diubah', 'Gambar utama produk berhasil diperbarui.');
    } catch (err: any) {
      showError('Gagal atur gambar utama', err.response?.data?.message || 'Tidak dapat mengubah gambar utama.');
    }
  };

  const loadProductDetail = useCallback(
    async (productId: string) => {
      try {
        setDetailLoading(true);
        const response = await api.get(`/api/v1/products/${productId}`);
        const payload = response.data?.data ?? response.data;
        return payload as Product & { images?: Product['images']; pricingTiers?: Product['pricingTiers'] };
      } catch (err: any) {
        showError(
          'Gagal memuat detail produk',
          err.response?.data?.message || 'Detail produk tidak dapat dimuat.',
        );
        return null;
      } finally {
        setDetailLoading(false);
      }
    },
    [showError],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const basePriceNum = fromRupiahInput(form.basePrice);
    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      categoryId: form.categoryId,
      basePrice: basePriceNum,
      unitOfMeasure: form.unitOfMeasure.trim() || 'pcs',
      status: form.status,
    };

    if (!payload.sku || !payload.name || !payload.categoryId || !Number.isFinite(payload.basePrice) || payload.basePrice < 0) {
      showError('Validasi gagal', 'Lengkapi field produk wajib (SKU, Nama, Kategori, Harga) sebelum menyimpan.');
      return;
    }

    const normalizedTiers = pricingTiers
      .filter((tier) => Number(tier.minQuantity) > 0 && fromRupiahInput(String(tier.unitPrice)) >= 0 && tier.unitPrice !== '')
      .map((tier) => ({
        minQuantity: Number(tier.minQuantity),
        maxQuantity: tier.maxQuantity === '' ? undefined : Number(tier.maxQuantity),
        unitPrice: fromRupiahInput(String(tier.unitPrice)),
      }))
      .filter((tier) => Number.isFinite(tier.minQuantity) && Number.isFinite(tier.unitPrice) && tier.unitPrice >= 0);

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

  const handleEditProduct = async (product: Product) => {
    const detail = await loadProductDetail(product.id);
    const source = detail ?? product;

    setForm({
      sku: source.sku || '',
      name: source.name || '',
      description: source.description || '',
      categoryId: source.categoryId || '',
      basePrice: toRupiahInput(source.basePrice ?? ''),
      unitOfMeasure: source.unitOfMeasure || 'pcs',
      status: source.status || 'Active',
    });
    setPricingTiers(
      source.pricingTiers && source.pricingTiers.length > 0
        ? source.pricingTiers.map((tier) => ({
            minQuantity: tier.minQuantity ?? 1,
            maxQuantity: tier.maxQuantity ?? '',
            unitPrice: toRupiahInput(tier.unitPrice ?? 0),
          }))
        : [emptyPricingTier],
    );
    setExistingImages(source.images ?? []);
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setImageFiles([]);
    setImagePreviews([]);
    setPrimaryNewFileIndex(0);
    setEditingProductId(product.id);
    setShowForm(true);
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
          style={!showForm ? { backgroundColor: '#0284c7', color: '#ffffff' } : undefined}
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
                   <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-extrabold tracking-tight text-primary-700">
                     Rp
                   </span>
                   <input
                     type="text"
                     inputMode="numeric"
                     value={form.basePrice}
                     onChange={(event) =>
                       setForm((current) => ({ ...current, basePrice: toRupiahInput(event.target.value) }))
                     }
                     className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                     placeholder="250.000"
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

               <div className="space-y-3 md:col-span-2">
                 <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium text-slate-700">
                   <div className="flex items-center gap-2">
                     <ImageIcon size={18} className="text-primary-600" weight="fill" />
                     <span>Gambar Produk</span>
                   </div>
                   <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                       (existingImages?.length ?? 0) + imageFiles.length >= MAX_IMAGES_PER_PRODUCT
                         ? 'bg-rose-50 text-rose-700'
                         : 'bg-primary-50 text-primary-700'
                     }`}>
                     {(existingImages?.length ?? 0) + imageFiles.length} / {MAX_IMAGES_PER_PRODUCT}
                   </span>
                 </div>

                 {(existingImages && existingImages.length > 0) && (
                   <div className="space-y-2">
                     <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Gambar Tersimpan</p>
                     <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                       {existingImages.map((img) => (
                         <div key={img.id ?? img.url} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                           <div className="aspect-square overflow-hidden bg-slate-100">
                             <img src={img.url} alt={form.name || 'produk'} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                           </div>
                           {img.isPrimary && (
                             <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white shadow-sm">
                               <Star size={10} weight="fill" />
                               Utama
                             </span>
                           )}
                           <div className="absolute inset-x-0 bottom-0 translate-y-full flex-col gap-1 bg-slate-900/75 p-1.5 text-[10px] text-white transition-transform duration-150 group-hover:translate-y-0 flex">
                             {!img.isPrimary && img.id && (
                               <button
                                 type="button"
                                 onClick={() => setPrimaryExistingImage(img.id!)}
                                 className="w-full truncate rounded-md bg-white/10 px-1.5 py-1 text-left hover:bg-white/20"
                               >
                                 <Star size={10} className="mr-1 inline" weight="bold" />
                                 Jadikan Utama
                               </button>
                             )}
                             {img.id && (
                               <button
                                 type="button"
                                 onClick={() => deleteExistingImage(img.id!)}
                                 className="w-full truncate rounded-md bg-rose-500/80 px-1.5 py-1 text-left hover:bg-rose-500"
                               >
                                 <Trash size={10} className="mr-1 inline" weight="bold" />
                                 Hapus
                               </button>
                             )}
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {imagePreviews.length > 0 && (
                   <div className="space-y-2">
                     <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Akan Diunggah</p>
                     <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                       {imagePreviews.map((preview, index) => (
                         <div key={`${preview}-${index}`} className="relative overflow-hidden rounded-xl border border-dashed border-primary-300 bg-primary-50/50 shadow-sm">
                           <div className="aspect-square overflow-hidden bg-white">
                             <img src={preview} alt={imageFiles[index]?.name || `preview-${index}`} className="h-full w-full object-cover" />
                           </div>
                           <button
                             type="button"
                             onClick={() => setPrimaryNewFile(index)}
                             title={primaryNewFileIndex === index ? 'Gambar utama' : 'Jadikan utama'}
                             className={`absolute left-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full transition ${
                               primaryNewFileIndex === index
                                 ? 'bg-amber-500 text-white shadow'
                                 : 'bg-white/90 text-slate-400 hover:text-amber-500'
                             }`}
                           >
                             <Star size={12} weight="fill" />
                           </button>
                           <button
                             type="button"
                             onClick={() => removeNewFile(index)}
                             className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow transition hover:bg-rose-600"
                             aria-label="Hapus file"
                           >
                             <X size={12} weight="bold" />
                           </button>
                           <div className="truncate bg-slate-900/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                             {imageFiles[index]?.name}
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 <input
                   type="file"
                   accept="image/png,image/jpeg,image/webp"
                   multiple
                   onChange={handleImageChange}
                   disabled={remainingImageSlots === 0 || detailLoading}
                   className="block w-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition file:mr-3 file:rounded-lg file:border-0 file:bg-primary-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white file:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                 />
                 <p className="text-xs text-slate-500">
                   JPG / PNG / WebP • maks. 5MB per gambar • sisa slot:{' '}
                   <span className="font-bold text-primary-700">{remainingImageSlots}</span>
                 </p>
                 {detailLoading && <p className="text-xs text-slate-500">Memuat detail gambar produk...</p>}
               </div>
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
                   className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 transition hover:bg-primary-100"
                 >
                   <Plus size={12} weight="bold" />
                   Tambah Tier
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
                       Harga Satuan (IDR)
                       <div className="relative">
                         <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-extrabold tracking-tight text-primary-700">
                           Rp
                         </span>
                         <input
                           type="text"
                           inputMode="numeric"
                           value={tier.unitPrice}
                           onChange={(event) => handlePricingTierChange(index, 'unitPrice', event.target.value)}
                           className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-2.5 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                           placeholder="200.000"
                         />
                       </div>
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

              <div className="sticky bottom-0 z-10 -mx-5 -mb-5 mt-8 border-t border-slate-200 bg-white/95 px-5 py-4 shadow-[0_-10px_30px_-10px_rgba(2,132,199,0.15)] backdrop-blur supports-[backdrop-filter]:bg-white/80">
               <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                 <div className="flex-1">
                   <p className="text-xs text-slate-500">
                     <span className="font-semibold text-slate-700">Tip:</span> Harga sudah otomatis dalam format Rupiah (IDR). Tekan Simpan untuk menyimpan ke katalog.
                   </p>
                 </div>
                 <div className="flex justify-end gap-3">
                   <button
                     type="button"
                     onClick={resetProductForm}
                     className="inline-flex min-w-[100px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow"
                   >
                     Batal
                   </button>
                   <button
                     type="submit"
                     disabled={submitting}
                     className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-sky-700 px-6 py-3 text-sm font-extrabold tracking-tight text-white shadow-lg shadow-sky-700/20 transition hover:-translate-y-0.5 hover:bg-sky-800 hover:shadow-xl hover:shadow-sky-800/30 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-70 disabled:shadow-none"
                     style={{ backgroundColor: '#0369a1' }}
                   >
                     {submitting ? (
                       <>
                         <svg className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" viewBox="0 0 24 24" />
                         Menyimpan...
                       </>
                     ) : editingProductId ? (
                       'Simpan Perubahan'
                     ) : (
                       'Simpan Produk'
                     )}
                   </button>
                 </div>
               </div>
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
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center lg:flex-1 lg:gap-2">
            <div className="relative w-full md:max-w-sm">
              <MagnifyingGlass size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" weight="regular" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
                placeholder="Cari nama, SKU, atau kategori"
              />
            </div>

            <div className="grid flex-1 grid-cols-2 gap-2 md:grid-cols-3">
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100"
              >
                <option value="all">Semua (Kecuali Dihentikan)</option>
                <option value="Active">Aktif</option>
                <option value="Inactive">Nonaktif</option>
                <option value="Discontinued">Dihentikan</option>
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortKey)}
                className="col-span-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100 md:col-span-1"
              >
                <option value="newest">Terbaru</option>
                <option value="name-asc">Nama (A → Z)</option>
                <option value="name-desc">Nama (Z → A)</option>
                <option value="price-asc">Harga (termurah)</option>
                <option value="price-desc">Harga (termahal)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 font-semibold text-primary-700">
              <Package size={12} />
              {filteredProducts.length} ditampilkan
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
              Total {products.length} produk
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-52 items-center justify-center text-sm text-slate-500">Loading product catalog...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
              <Package size={24} weight="thin" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-700">Tidak ada produk ditemukan</p>
              <p className="mt-1 text-xs text-slate-500">Coba ubah filter kata kunci, kategori, atau status produk.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const categoryName =
                categories.find((category) => category.id === product.categoryId)?.name ||
                product.category?.name ||
                'Uncategorized';
              const imageUrl = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url;
              const statusKey = (product.status || 'Active') as keyof typeof PRODUCT_STATUS_LABEL;
              const displayStatus = PRODUCT_STATUS_LABEL[statusKey] ?? statusKey;
              const statusClass =
                product.status === 'Active'
                  ? 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200'
                  : product.status === 'Inactive'
                  ? 'bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200'
                  : 'bg-slate-200 text-slate-700 ring-1 ring-inset ring-slate-300';
              const lowestTier =
                product.pricingTiers && product.pricingTiers.length > 0
                  ? Math.min(...product.pricingTiers.map((t) => Number(t.unitPrice)))
                  : null;

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400">
                        <ImageIcon size={36} weight="thin" />
                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">Belum ada gambar</p>
                      </div>
                    )}

                    <span className="absolute left-3 top-3 inline-flex items-center rounded-md bg-slate-900/75 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                      {product.sku}
                    </span>
                    <span className={`absolute right-3 top-3 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${statusClass}`}>
                      {displayStatus}
                    </span>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/75 via-slate-900/40 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/products/${product.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow transition hover:bg-white"
                        >
                          <Eye size={12} weight="bold" />
                          Lihat Katalog
                        </a>
                        <button
                          type="button"
                          onClick={() => handleEditProduct(product)}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white shadow transition"
                          style={{ backgroundColor: '#0284c7' }}
                        >
                          <PencilSimple size={12} weight="bold" />
                          Edit Cepat
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-600">{categoryName}</p>
                      <h4 className="line-clamp-1 text-base font-extrabold tracking-tight text-slate-900">{product.name}</h4>
                    </div>
                    <p className="line-clamp-2 min-h-[2.5rem] text-sm text-slate-600">
                      {product.description || 'Belum ada deskripsi untuk produk ini.'}
                    </p>

                    <div className="flex items-baseline justify-between gap-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Harga dasar</span>
                        <span className="text-lg font-extrabold text-slate-900">{formatCurrency(product.basePrice ?? 0)}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Per</span>
                        <span className="text-sm font-bold text-slate-700">{product.unitOfMeasure || 'pcs'}</span>
                      </div>
                    </div>

                    {product.pricingTiers && product.pricingTiers.length > 0 && (
                      <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-3">
                        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-700">
                          <Tag size={11} weight="bold" />
                          {product.pricingTiers.length} tier harga grosir
                        </div>
                        <p className="text-xs text-amber-800">
                          <span className="font-semibold">Starts from:</span>{' '}
                          <span className="font-extrabold">{formatCurrency(lowestTier ?? product.basePrice ?? 0)}</span>
                          {' • '}
                          {product.pricingTiers
                            .slice(0, 2)
                            .map((tier) => `${tier.minQuantity}${tier.maxQuantity ? `-${tier.maxQuantity}` : '+'}`)
                            .join(' • ')}
                          {product.pricingTiers.length > 2 ? ` • +${product.pricingTiers.length - 2} lagi` : ''}
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleEditProduct(product)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <PencilSimple size={13} />
                        Edit
                      </button>
                      <a
                        href={`/products/${product.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 transition hover:bg-primary-100"
                      >
                        <Eye size={13} />
                        Katalog
                      </a>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(product)}
                        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                          product.status === 'Active'
                            ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <Power size={13} />
                        {product.status === 'Active' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        <Trash size={13} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
