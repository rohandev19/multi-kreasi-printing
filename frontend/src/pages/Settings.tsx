import { useState, useEffect } from 'react';
import { FloppyDisk, BuildingOffice, CreditCard, Bell, Palette, LinkSimple, Plus, Trash, ChatCircle, Envelope, Gear } from '@phosphor-icons/react';
import { useToast } from '../contexts/ToastContext';
import api from '../api/axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const bankSchema = z.object({
  name: z.string().min(1, 'Nama bank wajib diisi'),
  accountName: z.string().min(1, 'Nama pemilik rekening wajib diisi'),
  accountNo: z.string().min(1, 'Nomor rekening wajib diisi'),
  branch: z.string().min(1, 'Kantor cabang wajib diisi'),
});

type BankFormValues = z.infer<typeof bankSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Umum');
  const [isDirty, setIsDirty] = useState(false);
  const { success } = useToast();

  const defaultSettings = {
    general: {
      appName: 'Multi Kreasi Printing',
      timezone: 'Asia/Jakarta',
      language: 'Bahasa Indonesia',
      currency: 'IDR',
      dateFormat: 'DD/MM/YYYY',
      taxRate: 11,
      autoApproveLimit: 2000000,
      orderPrefix: 'ORD',
      invoicePrefix: 'INV'
    },
    business: {
      companyName: 'PT Multi Kreasi Printing',
      npwp: '12.345.678.9-012.000',
      address: 'Jl. Percetakan Negara No. 123',
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
      postalCode: '10560',
      phone: '+62 21 1234 5678',
      email: 'info@multikreasiprinting.com',
      website: 'www.multikreasiprinting.com',
    },
    payment: {
      deadlineHours: 24,
      allowPartial: true,
      minPartialPercent: 50,
      methods: {
        bankTransfer: true,
        cash: true,
        creditCard: false,
        giro: true
      },
      banks: [
        { id: 1, name: 'Bank Central Asia (BCA)', accountName: 'PT Multi Kreasi Printing', accountNo: '123 456 7890', branch: 'Sudirman' },
        { id: 2, name: 'Bank Mandiri', accountName: 'PT Multi Kreasi Printing', accountNo: '098 765 4321', branch: 'Thamrin' }
      ]
    },
    notifications: {
      email: {
        newOrder: true,
        orderApproved: true,
        paymentReceived: true,
        productionStarted: true,
        orderReady: true,
        lowStock: true,
        overdueInvoice: true
      }
    },
    branding: {
      primaryColor: '#4f46e5',
      invoiceHeader: 'Terima kasih atas kepercayaan Anda pada PT Multi Kreasi Printing.',
      invoiceFooter: 'Pembayaran yang sudah dilakukan tidak dapat dikembalikan. Syarat dan ketentuan berlaku.'
    },
    integrations: {
      whatsapp: { enabled: false, apiKey: '' },
      emailProvider: 'SMTP'
    }
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [dirtyState, setDirtyState] = useState(defaultSettings);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema)
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/api/v1/settings/app_settings');
      if (res.data && res.data.value) {
        setSettings(res.data.value);
        setDirtyState(res.data.value);
      }
    } catch (err: any) {
      console.error(err);
      // Fallback to default if not found
    }
  };

  useEffect(() => {
    // Check if dirtyState differs from settings to enable/disable Save button
    const isDifferent = JSON.stringify(settings) !== JSON.stringify(dirtyState);
    setIsDirty(isDifferent);
  }, [dirtyState, settings]);

  const handleSave = async () => {
    try {
      await api.put('/api/v1/settings/app_settings', {
        value: dirtyState,
        description: 'Global application settings'
      });
      setSettings(dirtyState);
      setIsDirty(false);
      success('Pengaturan disimpan', 'Konfigurasi Anda telah berhasil diperbarui.');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleGeneralChange = (field: string, value: string | boolean | number) => {
    setDirtyState(prev => ({
      ...prev,
      general: { ...prev.general, [field]: value }
    }));
  };

  const handleBusinessChange = (field: string, value: string | boolean | number) => {
    setDirtyState(prev => ({
      ...prev,
      business: { ...prev.business, [field]: value }
    }));
  };

  const handlePaymentChange = (field: string, value: string | boolean | number) => {
    setDirtyState(prev => ({
      ...prev,
      payment: { ...prev.payment, [field]: value }
    }));
  };

  const handlePaymentMethodChange = (field: string, value: string | boolean | number) => {
    setDirtyState(prev => ({
      ...prev,
      payment: { ...prev.payment, methods: { ...prev.payment.methods, [field]: value } }
    }));
  };

  const handleNotificationChange = (field: string, value: string | boolean | number) => {
    setDirtyState(prev => ({
      ...prev,
      notifications: { ...prev.notifications, email: { ...prev.notifications.email, [field]: value } }
    }));
  };

  const handleBrandingChange = (field: string, value: string | boolean | number) => {
    setDirtyState(prev => ({
      ...prev,
      branding: { ...prev.branding, [field]: value }
    }));
  };

  const handleIntegrationChange = (field: string, value: any) => {
    setDirtyState(prev => ({
      ...prev,
      integrations: { ...prev.integrations, [field]: value }
    }));
  };

  const tabs = [
    { id: 'Umum', icon: Gear },
    { id: 'Informasi Bisnis', icon: BuildingOffice },
    { id: 'Pembayaran', icon: CreditCard },
    { id: 'Notifikasi', icon: Bell },
    { id: 'Branding', icon: Palette },
    { id: 'Integrasi', icon: LinkSimple },
  ];

  const handleAddBank = (data: BankFormValues) => {
    const newBank = { ...data, id: Date.now() };
    setDirtyState(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        banks: [...prev.payment.banks, newBank]
      }
    }));
    setIsBankModalOpen(false);
    reset();
  };

  const handleDeleteBank = (bankId: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus rekening bank ini?')) return;
    setDirtyState(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        banks: prev.payment.banks.filter((b: any) => b.id !== bankId)
      }
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Toggle Switch Component
  const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean, onChange: (val: boolean) => void, label?: string }) => (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${checked ? 'bg-primary-600' : 'bg-slate-200'}`}
        role="switch"
        aria-checked={checked}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pengaturan</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola konfigurasi dan preferensi aplikasi Anda</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl shadow-sm hover:bg-slate-800 focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FloppyDisk size={18} weight="regular" />
          Simpan Semua Perubahan
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <div className="w-full lg:w-64 shrink-0 overflow-x-auto lg:overflow-visible">
          <nav className="flex lg:flex-col gap-2 min-w-max lg:min-w-0 pb-2 lg:pb-0">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              // Check if this tab has dirty state (simplified check)
              const hasChanges = isDirty; // In a real app, track per-tab changes

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap lg:whitespace-normal text-left relative ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700 font-semibold' 
                      : 'text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
                  {tab.id}
                  {hasChanges && isActive && (
                    <span className="absolute right-3 w-2 h-2 rounded-full bg-amber-400"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* TAB CONTENT */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
            
            {/* GENERAL SETTINGS */}
            {activeTab === 'Umum' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Pengaturan Umum</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama Aplikasi</label>
                    <input 
                      type="text" 
                      value={dirtyState.general.appName} 
                      onChange={(e) => handleGeneralChange('appName', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Zona Waktu</label>
                    <select 
                      value={dirtyState.general.timezone}
                      onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm"
                    >
                      <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                      <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                      <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bahasa Utama</label>
                    <select 
                      value={dirtyState.general.language}
                      onChange={(e) => handleGeneralChange('language', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm"
                    >
                      <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Mata Uang</label>
                    <input 
                      type="text" 
                      value={dirtyState.general.currency} 
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Format Tanggal</label>
                    <select 
                      value={dirtyState.general.dateFormat}
                      onChange={(e) => handleGeneralChange('dateFormat', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tarif Pajak (PPN %)</label>
                    <input 
                      type="number" 
                      value={dirtyState.general.taxRate} 
                      onChange={(e) => handleGeneralChange('taxRate', parseFloat(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Persetujuan Otomatis Pesanan di Bawah (IDR)</label>
                    <input 
                      type="number" 
                      value={dirtyState.general.autoApproveLimit} 
                      onChange={(e) => handleGeneralChange('autoApproveLimit', parseInt(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm font-mono"
                    />
                    <p className="mt-1 text-xs text-slate-500">Pesanan di bawah nominal ini akan disetujui otomatis tanpa peninjauan manual. Saat ini: {formatCurrency(dirtyState.general.autoApproveLimit)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Awalan Nomor Pesanan</label>
                    <input 
                      type="text" 
                      value={dirtyState.general.orderPrefix} 
                      onChange={(e) => handleGeneralChange('orderPrefix', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Awalan Nomor Faktur</label>
                    <input 
                      type="text" 
                      value={dirtyState.general.invoicePrefix} 
                      onChange={(e) => handleGeneralChange('invoicePrefix', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* BUSINESS INFORMATION */}
            {activeTab === 'Informasi Bisnis' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Informasi Bisnis & Perusahaan</h2>
                
                <div className="flex gap-6 items-start mb-6">
                  <div className="w-32 h-32 shrink-0 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden relative group cursor-pointer hover:border-primary-400">
                    <span className="text-2xl font-black text-primary-600">MK</span>
                    <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold">Ganti Logo</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-700 mb-1">Logo Perusahaan</h3>
                    <p className="text-xs text-slate-500 mb-3">Format diterima: PNG, SVG, JPG (Maks 2MB)</p>
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg shadow-sm hover:bg-slate-50">
                      Unggah Berkas
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama Legal Perusahaan</label>
                    <input 
                      type="text" 
                      value={dirtyState.business.companyName} 
                      onChange={(e) => handleBusinessChange('companyName', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">NPWP (Nomor Pokok Wajib Pajak)</label>
                    <input 
                      type="text" 
                      value={dirtyState.business.npwp} 
                      onChange={(e) => handleBusinessChange('npwp', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Alamat Lengkap</label>
                    <textarea 
                      value={dirtyState.business.address} 
                      onChange={(e) => handleBusinessChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm resize-none"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kota / Kabupaten</label>
                    <input 
                      type="text" 
                      value={dirtyState.business.city} 
                      onChange={(e) => handleBusinessChange('city', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Provinsi</label>
                    <input 
                      type="text" 
                      value={dirtyState.business.province} 
                      onChange={(e) => handleBusinessChange('province', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kode Pos</label>
                    <input 
                      type="text" 
                      value={dirtyState.business.postalCode} 
                      onChange={(e) => handleBusinessChange('postalCode', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Telepon</label>
                    <input 
                      type="tel" 
                      value={dirtyState.business.phone} 
                      onChange={(e) => handleBusinessChange('phone', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Alamat Email</label>
                    <input 
                      type="email" 
                      value={dirtyState.business.email} 
                      onChange={(e) => handleBusinessChange('email', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Situs Web</label>
                    <input 
                      type="url" 
                      value={dirtyState.business.website} 
                      onChange={(e) => handleBusinessChange('website', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PAYMENT SETTINGS */}
            {activeTab === 'Pembayaran' && (
              <div className="space-y-8 animate-fade-in">
                
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Rekening Bank</h2>
                  <div className="space-y-4">
                    {dirtyState.payment.banks.map(bank => (
                      <div key={bank.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-center bg-slate-50">
                        <div>
                          <p className="font-bold text-slate-900">{bank.name}</p>
                          <p className="text-sm text-slate-600">{bank.accountNo} a/n {bank.accountName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Cabang: {bank.branch}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-slate-400 hover:text-slate-900 bg-white rounded-lg border border-slate-200 shadow-sm text-xs font-semibold">
                            Ubah
                          </button>
                          <button onClick={() => handleDeleteBank(bank.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white rounded-lg border border-slate-200 shadow-sm">
                            <Trash size={16} weight="regular" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setIsBankModalOpen(true)} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors flex justify-center items-center gap-2">
                      <Plus size={18} weight="regular" />
                      Tambah Rekening Bank
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Ketentuan Pembayaran</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Batas Waktu Pembayaran (jam)</label>
                      <input 
                        type="number" 
                        value={dirtyState.payment.deadlineHours} 
                        onChange={(e) => handlePaymentChange('deadlineHours', parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm"
                      />
                    </div>
                    <div className="flex items-center">
                      <ToggleSwitch 
                        checked={dirtyState.payment.allowPartial} 
                        onChange={(val) => handlePaymentChange('allowPartial', val)} 
                        label="Izinkan Pembayaran Bertahap (Uang Muka / DP)"
                      />
                    </div>
                    {dirtyState.payment.allowPartial && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Uang Muka Minimum (%)</label>
                        <input 
                          type="number" 
                          value={dirtyState.payment.minPartialPercent} 
                          onChange={(e) => handlePaymentChange('minPartialPercent', parseInt(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Metode Pembayaran</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                      <span className="font-medium text-slate-700">Transfer Bank</span>
                      <ToggleSwitch checked={dirtyState.payment.methods.bankTransfer} onChange={(val) => handlePaymentMethodChange('bankTransfer', val)} />
                    </div>
                    <div className="border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                      <span className="font-medium text-slate-700">Tunai</span>
                      <ToggleSwitch checked={dirtyState.payment.methods.cash} onChange={(val) => handlePaymentMethodChange('cash', val)} />
                    </div>
                    <div className="border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                      <span className="font-medium text-slate-700">Kartu Kredit</span>
                      <ToggleSwitch checked={dirtyState.payment.methods.creditCard} onChange={(val) => handlePaymentMethodChange('creditCard', val)} />
                    </div>
                    <div className="border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                      <span className="font-medium text-slate-700">Giro / Cek</span>
                      <ToggleSwitch checked={dirtyState.payment.methods.giro} onChange={(val) => handlePaymentMethodChange('giro', val)} />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* NOTIFICATION SETTINGS */}
            {activeTab === 'Notifikasi' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4 flex justify-between items-center">
                  Notifikasi Email
                  <span className="text-sm font-normal text-slate-500 flex items-center gap-1 opacity-70">
                    Kustomisasi Templat <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">Segera Hadir</span>
                  </span>
                </h2>
                
                <div className="space-y-4 max-w-2xl">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <div>
                      <p className="font-bold text-slate-700">Pesanan baru diterima</p>
                      <p className="text-xs text-slate-500">Dikirim ke Pemilik, Manajer</p>
                    </div>
                    <ToggleSwitch checked={dirtyState.notifications.email.newOrder} onChange={(val) => handleNotificationChange('newOrder', val)} />
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <div>
                      <p className="font-bold text-slate-700">Pesanan disetujui</p>
                      <p className="text-xs text-slate-500">Dikirim ke Pelanggan</p>
                    </div>
                    <ToggleSwitch checked={dirtyState.notifications.email.orderApproved} onChange={(val) => handleNotificationChange('orderApproved', val)} />
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <div>
                      <p className="font-bold text-slate-700">Pembayaran diterima</p>
                      <p className="text-xs text-slate-500">Dikirim ke Keuangan, Pelanggan</p>
                    </div>
                    <ToggleSwitch checked={dirtyState.notifications.email.paymentReceived} onChange={(val) => handleNotificationChange('paymentReceived', val)} />
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <div>
                      <p className="font-bold text-slate-700">Produksi dimulai</p>
                      <p className="text-xs text-slate-500">Dikirim ke Pelanggan</p>
                    </div>
                    <ToggleSwitch checked={dirtyState.notifications.email.productionStarted} onChange={(val) => handleNotificationChange('productionStarted', val)} />
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <div>
                      <p className="font-bold text-slate-700">Pesanan siap dikirim / diambil</p>
                      <p className="text-xs text-slate-500">Dikirim ke Pelanggan, Gudang</p>
                    </div>
                    <ToggleSwitch checked={dirtyState.notifications.email.orderReady} onChange={(val) => handleNotificationChange('orderReady', val)} />
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <div>
                      <p className="font-bold text-slate-700">Peringatan stok menipis</p>
                      <p className="text-xs text-slate-500">Dikirim ke Pemilik, Manajer, Gudang</p>
                    </div>
                    <ToggleSwitch checked={dirtyState.notifications.email.lowStock} onChange={(val) => handleNotificationChange('lowStock', val)} />
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-bold text-slate-700">Pengingat faktur jatuh tempo</p>
                      <p className="text-xs text-slate-500">Dikirim ke Keuangan</p>
                    </div>
                    <ToggleSwitch checked={dirtyState.notifications.email.overdueInvoice} onChange={(val) => handleNotificationChange('overdueInvoice', val)} />
                  </div>
                </div>
              </div>
            )}

            {/* BRANDING */}
            {activeTab === 'Branding' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Identitas & Tampilan Brand</h2>
                
                <div className="grid grid-cols-1 gap-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Warna Utama (Hex)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={dirtyState.branding.primaryColor}
                        onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                        className="h-10 w-10 rounded cursor-pointer border-0 p-0"
                      />
                      <input 
                        type="text" 
                        value={dirtyState.branding.primaryColor}
                        onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                        className="px-4 py-2 rounded-lg border border-slate-200 font-mono text-sm w-32 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Catatan Header Standar Faktur / Penawaran</label>
                    <textarea 
                      value={dirtyState.branding.invoiceHeader}
                      onChange={(e) => handleBrandingChange('invoiceHeader', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Catatan Footer Standar Faktur / Penawaran (Syarat & Ketentuan)</label>
                    <textarea 
                      value={dirtyState.branding.invoiceFooter}
                      onChange={(e) => handleBrandingChange('invoiceFooter', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <button className="px-4 py-2 bg-slate-100 text-slate-800 font-bold rounded-lg hover:bg-slate-200 transition-colors text-sm">
                      Pratinjau Contoh Faktur
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* INTEGRATIONS */}
            {activeTab === 'Integrasi' && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Integrasi</h2>
                
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                        <ChatCircle className="w-6 h-6 text-emerald-600" weight="regular" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">WhatsApp Business API</h3>
                          {dirtyState.integrations.whatsapp.enabled ? (
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Terhubung</span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Nonaktif</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">Kirim pembaruan pesanan dan faktur melalui WhatsApp</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      {dirtyState.integrations.whatsapp.enabled ? (
                        <button className="text-sm font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50">
                          Konfigurasi
                        </button>
                      ) : null}
                      <ToggleSwitch 
                        checked={dirtyState.integrations.whatsapp.enabled} 
                        onChange={(val) => handleIntegrationChange('whatsapp', { ...dirtyState.integrations.whatsapp, enabled: val })} 
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        <Envelope className="w-6 h-6 text-slate-700" weight="regular" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">Penyedia Layanan Email</h3>
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">Terhubung</span>
                        </div>
                        <p className="text-sm text-slate-500">Saat ini menggunakan: {dirtyState.integrations.emailProvider}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <select 
                        value={dirtyState.integrations.emailProvider}
                        onChange={(e) => handleIntegrationChange('emailProvider', e.target.value)}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 font-medium text-sm"
                      >
                        <option value="SMTP">SMTP</option>
                        <option value="SendGrid">SendGrid</option>
                        <option value="Mailgun">Mailgun</option>
                      </select>
                      <button className="text-sm font-bold text-slate-700 hover:text-slate-900 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50">
                        Konfigurasi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* ADD BANK MODAL */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">Tambah Rekening Bank</h2>
              <button onClick={() => setIsBankModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <Trash size={20} className="hidden" weight="regular" />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit(handleAddBank)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Bank</label>
                  <input
                    {...register('name')}
                    placeholder="contoh: Bank Central Asia (BCA)"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Rekening</label>
                  <input
                    {...register('accountNo')}
                    placeholder="contoh: 1234567890"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm font-mono"
                  />
                  {errors.accountNo && <p className="mt-1 text-sm text-red-600">{errors.accountNo.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pemilik Rekening</label>
                  <input
                    {...register('accountName')}
                    placeholder="contoh: PT Multi Kreasi Printing"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm"
                  />
                  {errors.accountName && <p className="mt-1 text-sm text-red-600">{errors.accountName.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kantor Cabang</label>
                  <input
                    {...register('branch')}
                    placeholder="contoh: Sudirman"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-sm"
                  />
                  {errors.branch && <p className="mt-1 text-sm text-red-600">{errors.branch.message}</p>}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBankModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-black text-white text-sm font-bold rounded-lg shadow-sm hover:bg-slate-800 transition-colors"
                >
                  Simpan Rekening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
