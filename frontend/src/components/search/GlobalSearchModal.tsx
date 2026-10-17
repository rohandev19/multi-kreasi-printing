import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlass,
  X,
  ShoppingCart,
  Users,
  Package,
  FileText,
  ClockCounterClockwise,
  ArrowRight,
  Spinner,
  CaretRight,
} from '@phosphor-icons/react';
import api from '../../api/axios';

export interface SearchItemResult {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  url: string;
  type: 'order' | 'customer' | 'product' | 'invoice' | 'quotation';
}

export interface GlobalSearchResponse {
  query: string;
  total: number;
  results: {
    orders: SearchItemResult[];
    customers: SearchItemResult[];
    products: SearchItemResult[];
    invoices: SearchItemResult[];
    quotations: SearchItemResult[];
  };
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = 'mkp_recent_searches';

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [data, setData] = useState<GlobalSearchResponse['results']>({
    orders: [],
    customers: [],
    products: [],
    invoices: [],
    quotations: [],
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches on open
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          setRecentSearches(JSON.parse(stored).slice(0, 5));
        }
      } catch {
        // ignore
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const saveRecentSearch = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 2) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setData({
        orders: [],
        customers: [],
        products: [],
        invoices: [],
        quotations: [],
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get<GlobalSearchResponse>('/api/v1/search', {
          params: { q: trimmed },
        });
        setData(res.data.results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Flattened results based on activeCategory
  const flattenedResults = useMemo(() => {
    let list: SearchItemResult[] = [];
    if (activeCategory === 'all' || activeCategory === 'orders') {
      list = [...list, ...data.orders];
    }
    if (activeCategory === 'all' || activeCategory === 'products') {
      list = [...list, ...data.products];
    }
    if (activeCategory === 'all' || activeCategory === 'customers') {
      list = [...list, ...data.customers];
    }
    if (activeCategory === 'all' || activeCategory === 'invoices') {
      list = [...list, ...data.invoices];
    }
    if (activeCategory === 'all' || activeCategory === 'quotations') {
      list = [...list, ...data.quotations];
    }
    return list;
  }, [data, activeCategory]);

  const handleSelect = (item: SearchItemResult) => {
    saveRecentSearch(query);
    onClose();
    navigate(item.url);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          flattenedResults.length === 0 ? 0 : (prev + 1) % flattenedResults.length,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          flattenedResults.length === 0
            ? 0
            : (prev - 1 + flattenedResults.length) % flattenedResults.length,
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flattenedResults[selectedIndex]) {
          handleSelect(flattenedResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flattenedResults, selectedIndex]);

  if (!isOpen) return null;

  const totalResults =
    data.orders.length +
    data.products.length +
    data.customers.length +
    data.invoices.length +
    data.quotations.length;

  const getIconForType = (type: SearchItemResult['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingCart size={18} weight="bold" className="text-blue-600" />;
      case 'customer':
        return <Users size={18} weight="bold" className="text-emerald-600" />;
      case 'product':
        return <Package size={18} weight="bold" className="text-amber-600" />;
      case 'invoice':
        return <FileText size={18} weight="bold" className="text-purple-600" />;
      case 'quotation':
        return <FileText size={18} weight="bold" className="text-cyan-600" />;
      default:
        return <MagnifyingGlass size={18} weight="bold" className="text-slate-500" />;
    }
  };

  const getLabelForType = (type: SearchItemResult['type']) => {
    switch (type) {
      case 'order':
        return 'Pesanan';
      case 'customer':
        return 'Pelanggan';
      case 'product':
        return 'Produk';
      case 'invoice':
        return 'Faktur';
      case 'quotation':
        return 'Penawaran';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/50 gap-3">
          {loading ? (
            <Spinner size={22} weight="bold" className="animate-spin text-primary-600 shrink-0" />
          ) : (
            <MagnifyingGlass size={22} weight="bold" className="text-slate-400 shrink-0" />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Cari pesanan, pelanggan, produk, faktur..."
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-base font-medium outline-hidden"
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              title="Hapus pencarian"
            >
              <X size={16} weight="bold" />
            </button>
          )}

          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Filter Categories Bar (if results exist) */}
        {totalResults > 0 && (
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 bg-white overflow-x-auto text-xs">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua ({totalResults})
            </button>
            {data.orders.length > 0 && (
              <button
                onClick={() => setActiveCategory('orders')}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                  activeCategory === 'orders'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Pesanan ({data.orders.length})
              </button>
            )}
            {data.products.length > 0 && (
              <button
                onClick={() => setActiveCategory('products')}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                  activeCategory === 'products'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Produk ({data.products.length})
              </button>
            )}
            {data.customers.length > 0 && (
              <button
                onClick={() => setActiveCategory('customers')}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                  activeCategory === 'customers'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Pelanggan ({data.customers.length})
              </button>
            )}
            {data.invoices.length > 0 && (
              <button
                onClick={() => setActiveCategory('invoices')}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                  activeCategory === 'invoices'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Faktur ({data.invoices.length})
              </button>
            )}
            {data.quotations.length > 0 && (
              <button
                onClick={() => setActiveCategory('quotations')}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                  activeCategory === 'quotations'
                    ? 'bg-cyan-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Penawaran ({data.quotations.length})
              </button>
            )}
          </div>
        )}

        {/* Results List / Empty States */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {query.trim().length >= 2 && flattenedResults.length === 0 && !loading && (
            <div className="text-center py-12 px-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
                <MagnifyingGlass size={24} weight="regular" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Tidak ada hasil ditemukan</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Coba gunakan kata kunci lain seperti nomor pesanan, SKU produk, nama pelanggan, atau nomor faktur.
              </p>
            </div>
          )}

          {query.trim().length < 2 && (
            <div className="py-4 px-3">
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-2 flex items-center gap-1.5">
                    <ClockCounterClockwise size={14} weight="bold" />
                    Pencarian Terakhir
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setQuery(term);
                          inputRef.current?.focus();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors text-left"
                      >
                        <span>{term}</span>
                        <ArrowRight size={14} weight="bold" className="text-slate-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-xs text-slate-500 space-y-2">
                <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary-500 inline-block"></span>
                  Tips Pencarian Cepat:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>• Masukkan <b>nomor pesanan</b> (misal: <code>ORD-2026...</code>)</div>
                  <div>• Masukkan <b>nama produk / SKU</b> (misal: <code>BOX-01</code>)</div>
                  <div>• Masukkan <b>nomor faktur</b> (misal: <code>INV-2026...</code>)</div>
                  <div>• Masukkan <b>nama perusahaan</b> pelanggan</div>
                </div>
              </div>
            </div>
          )}

          {flattenedResults.length > 0 && (
            <div className="space-y-1">
              {flattenedResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-white border border-slate-200/80 shadow-2xs shrink-0">
                        {getIconForType(item.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-200/70 text-slate-600">
                            {getLabelForType(item.type)}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-primary-50 text-primary-700 border border-primary-200/50">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <CaretRight
                      size={16}
                      weight="bold"
                      className={`shrink-0 ml-2 ${isSelected ? 'text-slate-800' : 'text-slate-300'}`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              Navigasi: <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] shadow-2xs font-sans">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] shadow-2xs font-sans">↓</kbd>
            </span>
            <span>
              Pilih: <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] shadow-2xs font-sans">↵</kbd>
            </span>
          </div>
          <span>
            {totalResults > 0 ? `${totalResults} hasil ditemukan` : 'Pencarian Global MKP'}
          </span>
        </div>
      </div>
    </div>
  );
};
