import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, FileText, CheckCircle } from '@phosphor-icons/react';
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
    <div className="relative rounded-xl border bg-white p-6 shadow-sm" style={{ borderColor: 'var(--border-default)' }}>
      {/* Header Styled as Job Ticket Header */}
      <div className="border-b pb-4 mb-5" style={{ borderColor: 'var(--border-default)' }}>
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          <span className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--text-primary)' }}>
            <Calculator size={15} weight="bold" className="text-slate-900 inline" />
            JOB TICKET ESTIMATOR v2.4
          </span>
          <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
            {loading ? 'SYNCING...' : 'SPEC CALC'}
          </span>
        </div>
        <h3 className="mt-2 text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Kalkulasi Estimasi Biaya Cetak
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Perhitungan instan skala grosir B2B berbasis volume & tier harga pabrik.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Product selector */}
        <div>
          <label htmlFor="product-select" className="block text-xs font-mono uppercase font-bold tracking-wider text-slate-600 mb-1.5">
            01. Jenis Pekerjaan / Produk
          </label>
          <div className="relative">
            <select
              id="product-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded border px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-black"
              style={{
                backgroundColor: 'var(--color-neutral-50)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
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
            <label htmlFor="quantity-input" className="block text-xs font-mono uppercase font-bold tracking-wider text-slate-600">
              02. Jumlah Pesanan ({selectedProduct.unitOfMeasure || 'unit'})
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              Makin banyak, makin hemat
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
              className="w-full rounded border px-3 py-2 text-sm font-mono font-bold tracking-tight focus:outline-none focus:ring-1 focus:ring-black"
              style={{
                backgroundColor: 'var(--color-neutral-50)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Quick Quantity Buttons */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {quickQuantities.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuantity(q)}
                className={`rounded px-2.5 py-1 text-xs font-mono transition-all ${
                  quantity === q
                    ? 'bg-black text-white font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {q.toLocaleString('id-ID')}
              </button>
            ))}
          </div>
        </div>

        {/* Calculation Result Box - Styled as a Production Spec Box */}
        <div
          className="rounded border p-4 font-mono text-xs space-y-2 mt-4"
          style={{
            backgroundColor: 'var(--color-paper)',
            borderColor: 'var(--color-paper-edge)',
          }}
        >
          <div className="flex justify-between items-center text-slate-600 border-b border-dashed border-slate-300 pb-2">
            <span>Harga Satuan Efektif:</span>
            <span className="font-bold tabular-nums text-slate-900 text-sm">
              {estimate ? formatIDR(estimate.unitPrice) : '-'} / {selectedProduct.unitOfMeasure || 'unit'}
            </span>
          </div>

          {estimate?.appliedTier && (
            <div className="flex items-center justify-between text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
              <span className="flex items-center gap-1 font-sans font-semibold">
                <CheckCircle size={13} weight="bold" />
                Diskon Tier Aktif (min. {estimate.appliedTier.minQuantity} {selectedProduct.unitOfMeasure}):
              </span>
              <span className="font-bold tabular-nums">
                Hemat s.d {Math.round((1 - estimate.unitPrice / selectedProduct.basePrice) * 100)}%
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-600 pt-1">
            <span>Subtotal ({quantity.toLocaleString('id-ID')} unit):</span>
            <span className="font-bold tabular-nums text-slate-800">
              {estimate ? formatIDR(estimate.subtotal) : '-'}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-500">
            <span>PPN (11%):</span>
            <span className="tabular-nums">
              {estimate ? formatIDR(estimate.tax) : '-'}
            </span>
          </div>

          <div className="border-t border-slate-900 pt-2 flex justify-between items-baseline">
            <span className="font-sans font-extrabold text-sm text-slate-900 uppercase tracking-tight">
              Total Estimasi:
            </span>
            <span className="text-xl font-extrabold text-black tabular-nums">
              {estimate ? formatIDR(estimate.total) : '-'}
            </span>
          </div>

          <div className="text-[10px] text-slate-500 font-sans italic pt-1 border-t border-dashed border-slate-300">
            *Estimasi final termasuk biaya finishing & berat kirim akan dikonfirmasi pada tahap Quotation / Checkout.
          </div>
        </div>

        {/* Action CTAs */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <Link
            to={
              selectedProduct.id.startsWith('preset-')
                ? `/custom-order?product=${encodeURIComponent(selectedProduct.name)}&quantity=${quantity}&category=${encodeURIComponent(selectedProduct.categoryName || '')}`
                : `/products/${selectedProduct.id}?quantity=${quantity}`
            }
            className="flex items-center justify-center gap-1.5 rounded py-2.5 px-3 text-xs font-bold text-white transition-all hover:bg-neutral-800 shadow-sm"
            style={{ backgroundColor: '#000000' }}
          >
            <Calculator size={15} weight="bold" />
            <span>Pesan Sekarang</span>
          </Link>

          <Link
            to={`/custom-order?product=${encodeURIComponent(selectedProduct.name)}&quantity=${quantity}&category=${encodeURIComponent(selectedProduct.categoryName || '')}`}
            className="flex items-center justify-center gap-1.5 rounded border py-2.5 px-3 text-xs font-bold transition-all hover:bg-slate-50"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          >
            <FileText size={15} weight="bold" />
            <span>Minta Penawaran</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
