/**
 * Data Export Engine (Requirement 31 & Requirement 32)
 * Supports clean CSV generation compatible with Microsoft Excel (UTF-8 BOM),
 * formatted business data (Currency IDR, Dates, Statuses), and entity-specific exporters.
 */

export interface ExportColumn<T = any> {
  header: string;
  accessor: keyof T | ((row: T) => any);
}

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn('No data available to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((h) => {
        let cell = row[h];
        if (cell === null || cell === undefined) cell = '';
        return `"${cell.toString().replace(/"/g, '""')}"`;
      })
      .join(','),
  );

  // Prepend UTF-8 BOM (\uFEFF) so Excel opens UTF-8 Indonesian text & symbols without mojibake
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportEntityData = <T = any>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
) => {
  if (!data || data.length === 0) return;

  const formattedData = data.map((row) => {
    const obj: Record<string, any> = {};
    for (const col of columns) {
      if (typeof col.accessor === 'function') {
        obj[col.header] = col.accessor(row);
      } else {
        obj[col.header] = row[col.accessor] ?? '';
      }
    }
    return obj;
  });

  exportToCSV(formattedData, filename);
};

// Specialized Exporters for Enterprise Digital Platform
export const exportInvoicesData = (invoices: any[], filenamePrefix = 'faktur_penjualan') => {
  const columns: ExportColumn[] = [
    { header: 'No. Faktur', accessor: (row) => row.invoiceNumber || row.id },
    { header: 'Pelanggan', accessor: (row) => row.customer?.companyName || row.customer?.name || '-' },
    { header: 'No. Pesanan', accessor: (row) => row.order?.orderNumber || '-' },
    {
      header: 'Total Nilai (IDR)',
      accessor: (row) => Number(row.amount || row.totalAmount || 0).toLocaleString('id-ID'),
    },
    { header: 'Status Pembayaran', accessor: (row) => row.status },
    {
      header: 'Jatuh Tempo',
      accessor: (row) => (row.dueDate ? new Date(row.dueDate).toLocaleDateString('id-ID') : '-'),
    },
    {
      header: 'Tanggal Terbit',
      accessor: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString('id-ID') : '-'),
    },
  ];

  const dateStr = new Date().toISOString().split('T')[0];
  exportEntityData(invoices, columns, `${filenamePrefix}_${dateStr}`);
};

export const exportWarehouseInventory = (materials: any[], filenamePrefix = 'stok_gudang') => {
  const columns: ExportColumn[] = [
    { header: 'Kode Bahan', accessor: (row) => row.sku || row.code || '-' },
    { header: 'Nama Material', accessor: 'name' },
    { header: 'Kategori', accessor: (row) => row.category?.name || row.category || '-' },
    { header: 'Stok Saat Ini', accessor: 'quantity' },
    { header: 'Batas Minimum', accessor: 'minQuantity' },
    { header: 'Satuan', accessor: 'unit' },
    {
      header: 'Harga Satuan (IDR)',
      accessor: (row) => Number(row.unitCost || 0).toLocaleString('id-ID'),
    },
    {
      header: 'Total Nilai Aset (IDR)',
      accessor: (row) => (Number(row.quantity || 0) * Number(row.unitCost || 0)).toLocaleString('id-ID'),
    },
  ];

  const dateStr = new Date().toISOString().split('T')[0];
  exportEntityData(materials, columns, `${filenamePrefix}_${dateStr}`);
};

export const exportCustomersData = (customers: any[], filenamePrefix = 'data_pelanggan') => {
  const columns: ExportColumn[] = [
    { header: 'Nama Perusahaan / Klien', accessor: (row) => row.companyName || row.name },
    { header: 'Email Kontak', accessor: (row) => row.email || '-' },
    { header: 'Nomor Telepon', accessor: (row) => row.phone || '-' },
    { header: 'NPWP', accessor: (row) => row.npwp || '-' },
    { header: 'Loyalty Tier', accessor: (row) => row.loyaltyTier || 'Bronze' },
    {
      header: 'Batas Kredit (IDR)',
      accessor: (row) => Number(row.creditLimit || 0).toLocaleString('id-ID'),
    },
    { header: 'Termin (Hari)', accessor: (row) => row.paymentTermDays || 0 },
    { header: 'Status Kredit', accessor: (row) => row.creditStatus || 'ACTIVE' },
  ];

  const dateStr = new Date().toISOString().split('T')[0];
  exportEntityData(customers, columns, `${filenamePrefix}_${dateStr}`);
};
