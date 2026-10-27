import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, FileText, Check } from '@phosphor-icons/react';
import api from '../../api/axios';
import { estimatePrice } from '../../utils/priceEstimate';
import type { PriceTier } from '../../utils/priceEstimate';

interface ProductOption {
  id: string;
  name: string;
  categoryName?: string;
  basePrice: number;
  unitOfMeasure?: string;
  pricingTiers?: PriceTier[];
}

// Fallback presets if API is loading or offline
const fallbackPresets: ProductOption[] = [
  {
    id: 'preset-brosur',
    name: 'Brosur & Flyer A4 / A5',
    categoryName: 'Materi Pemasaran',
    basePrice: 1200,
    unitOfMeasure: 'lembar',
    pricingTiers: [
      { minQuantity: 500, pricePerUnit: 950 },
      { minQuantity: 1000, pricePerUnit: 750 },
      { minQuantity: 2500, pricePerUnit: 580 },
      { minQuantity: 5000, pricePerUnit: 480 },
    ],
  },
  {
    id: 'preset-kartu-nama',
    name: 'Kartu Nama Korporat (Art Carton 260g)',
    categoryName: 'Identitas Perusahaan',
    basePrice: 45000,
    unitOfMeasure: 'box (100 pcs)',
    pricingTiers: [
      { minQuantity: 5, pricePerUnit: 38000 },
      { minQuantity: 10, pricePerUnit: 32000 },
      { minQuantity: 25, pricePerUnit: 26000 },
      { minQuantity: 50, pricePerUnit: 22000 },
    ],
  },
  {
    id: 'preset-banner',
    name: 'Spanduk / Banner Flexi Korea (High-Res)',
    categoryName: 'Format Besar',
    basePrice: 28000,
    unitOfMeasure: 'm²',
    pricingTiers: [
      { minQuantity: 10, pricePerUnit: 24000 },
      { minQuantity: 30, pricePerUnit: 20000 },
      { minQuantity: 100, pricePerUnit: 17500 },
    ],
  },
  {
    id: 'preset-kemasan',
    name: 'Box Kemasan / Packaging Custom',
    categoryName: 'Packaging & Hardbox',
    basePrice: 4500,
    unitOfMeasure: 'pcs',
    pricingTiers: [
      { minQuantity: 500, pricePerUnit: 3800 },
      { minQuantity: 1000, pricePerUnit: 3100 },
      { minQuantity: 3000, pricePerUnit: 2500 },
    ],
  },
];

export const JobTicketEstimator: React.FC = () => {
  const [products, setProducts] = useState<ProductOption[]>(fallbackPresets);
  const [selectedProductId, setSelectedProductId] = useState<string>(fallbackPresets[0].id);
  const [quantity, setQuantity] = useState<number>(1000);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/v1/public/products?limit=10');
        const data = res.data?.data;
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped: ProductOption[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            categoryName: item.categoryName,
            basePrice: Number(item.basePrice) || 1000,
            unitOfMeasure: item.unitOfMeasure || 'unit',
            pricingTiers: item.pricingTiers || [],
          }));
          setProducts(mapped);
          setSelectedProductId(mapped[0].id);
        }
      } catch {
        // Silently use fallback presets for offline/test environments
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const estimate = estimatePrice(
    selectedProduct.basePrice,
    selectedProduct.pricingTiers || [],
    quantity
  );

  const formatIDR = (val: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

  // Suggested quantities based on active product's tiers
  const quickQuantities = [
    selectedProduct.pricingTiers?.[0]?.minQuantity || 100,
    selectedProduct.pricingTiers?.[1]?.minQuantity || 500,
    selectedProduct.pricingTiers?.[2]?.minQuantity || 1000,
    selectedProduct.pricingTiers?.[3]?.minQuantity || 2500,
  ].filter((v, idx, arr) => v > 0 && arr.indexOf(v) === idx);

  return (
    <div className="relative rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
      {/* Header Styled as Job Ticket Header */}
      <div className="border-b border-slate-200 pb-4 mb-5">
        <h3 className="text-xl font-bold tracking-tight text-slate-900">
          Kalkulasi Estimasi Biaya Cetak
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Perhitungan instan skala grosir B2B berbasis volume dan tier harga pabrik resmi.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Product selector */}
        <div>
          <label htmlFor="product-select" className="block text-xs font-semibold text-slate-800 mb-1.5">
            Jenis Pekerjaan / Produk Cetak
          </label>
          <div className="relative">
            <select
              id="product-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 bg-slate-50/60 px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 disabled:opacity-60"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.categoryName ? `[${p.categoryName}]` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quantity Input + Presets */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="quantity-input" className="block text-xs font-semibold text-slate-800">
              Jumlah Pesanan ({selectedProduct.unitOfMeasure || 'unit'})
            </label>
            <span className="text-[11px] font-medium text-slate-500">
              Makin banyak, biaya per unit makin efisien
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="quantity-input"
              type="number"
              min="1"
              step="10"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full rounded-lg border border-slate-300 bg-slate-50/60 px-3.5 py-2 text-sm font-mono font-bold tracking-tight text-slate-900 tabular-nums transition-colors focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Quick Quantity Buttons */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {quickQuantities.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuantity(q)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium tabular-nums transition-[background-color,color,transform] duration-150 active:scale-[0.98] ${
                  quantity === q
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {q.toLocaleString('id-ID')}
              </button>
            ))}
          </div>
        </div>

        {/* Calculation Result Box - Styled with Surface Tone Shift & Nested Radius */}
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4 text-xs space-y-2.5 mt-4">
          <div className="flex justify-between items-center text-slate-600 border-b border-dashed border-slate-200 pb-2.5">
            <span className="font-medium">Harga Satuan Efektif:</span>
            <span className="font-bold tabular-nums text-slate-900 text-sm">
              {estimate ? formatIDR(estimate.unitPrice) : '-'} / {selectedProduct.unitOfMeasure || 'unit'}
            </span>
          </div>

          {estimate?.appliedTier && (
            <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-50/90 border border-emerald-200/70 px-2.5 py-1.5 rounded-lg">
              <span className="flex items-center gap-1.5 font-semibold">
                <Check size={14} weight="bold" className="text-rose-500" />
                Diskon Tier Aktif (min. {estimate.appliedTier.minQuantity} {selectedProduct.unitOfMeasure}):
              </span>
              <span className="font-bold tabular-nums">
                Hemat s.d {Math.round((1 - estimate.unitPrice / selectedProduct.basePrice) * 100)}%
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-600 pt-0.5">
            <span>Subtotal ({quantity.toLocaleString('id-ID')} unit):</span>
            <span className="font-bold tabular-nums text-slate-800">
              {estimate ? formatIDR(estimate.subtotal) : '-'}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-500">
            <span>PPN (11%):</span>
            <span className="tabular-nums font-medium text-slate-700">
              {estimate ? formatIDR(estimate.tax) : '-'}
            </span>
          </div>

          <div className="border-t border-slate-900 pt-2.5 flex justify-between items-baseline">
            <span className="font-bold text-sm text-slate-900 tracking-tight">
              Total Estimasi:
            </span>
            <span className="text-xl font-extrabold text-slate-950 tabular-nums">
              {estimate ? formatIDR(estimate.total) : '-'}
            </span>
          </div>

          <div className="text-[10px] text-slate-500 italic pt-1.5 border-t border-dashed border-slate-200 leading-normal">
            *Estimasi final termasuk opsi finishing khusus dan ongkos kirim akan diverifikasi pada tahap Quotation resmi.
          </div>
        </div>

        {/* Action CTAs */}
        <div className="pt-2 grid grid-cols-2 gap-2.5">
          <Link
            to={
              selectedProduct.id.startsWith('preset-')
                ? `/custom-order?product=${encodeURIComponent(selectedProduct.name)}&quantity=${quantity}&category=${encodeURIComponent(selectedProduct.categoryName || '')}`
                : `/products/${selectedProduct.id}?quantity=${quantity}`
            }
            className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2.5 px-3 text-xs font-bold text-white shadow-xs transition-[background-color,transform] duration-150 hover:bg-slate-800 active:scale-[0.98]"
          >
            <Calculator size={15} weight="bold" />
            <span>Pesan Sekarang</span>
          </Link>

          <Link
            to={`/custom-order?product=${encodeURIComponent(selectedProduct.name)}&quantity=${quantity}&category=${encodeURIComponent(selectedProduct.categoryName || '')}`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-xs font-bold text-slate-800 shadow-xs transition-[background-color,border-color,transform] duration-150 hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98]"
          >
            <FileText size={15} weight="bold" />
            <span>Minta Penawaran</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
