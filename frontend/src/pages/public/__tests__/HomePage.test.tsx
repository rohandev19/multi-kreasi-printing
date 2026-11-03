import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../utils/test-utils';
import { HomePage } from '../HomePage';

// Mock axios call in JobTicketEstimator
vi.mock('../../../api/axios', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        data: [
          {
            id: 'prod-1',
            name: 'Brosur A4 Test',
            basePrice: 1000,
            unitOfMeasure: 'lembar',
            pricingTiers: [{ minQuantity: 500, pricePerUnit: 800 }],
          },
        ],
      },
    }),
  },
}));

describe('HomePage Component', () => {
  it('renders B2B industrial masthead headline and identity', async () => {
    render(<HomePage />);
    expect(
      await screen.findByText(/Pusat Kendali Pengadaan/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Percetakan Bisnis/i)).toBeInTheDocument();
  });

  it('renders order tracking input and submit button', async () => {
    render(<HomePage />);
    expect(
      await screen.findByPlaceholderText(/Lacak No\. Pesanan/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Cek Pesanan')).toBeInTheDocument();
  });

  it('renders Job Ticket Estimator with calculation box', async () => {
    render(<HomePage />);
    const headings = await screen.findAllByText(/Kalkulasi Estimasi Biaya Cetak/i);
    expect(headings[0]).toBeInTheDocument();
    expect(screen.getByText(/Jenis Pekerjaan \/ Produk Cetak/i)).toBeInTheDocument();
    expect(screen.getByText(/Jumlah Pesanan/i)).toBeInTheDocument();
  });

  it('renders production specifications table', async () => {
    render(<HomePage />);
    expect(
      await screen.findByText(/Matriks Spesifikasi & Lini Produk Utama/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Brosur & Flyer Lipat')).toBeInTheDocument();
    expect(screen.getByText('Custom Box Kemasan & Hardbox')).toBeInTheDocument();
  });

  it('renders commercial production and workshop section', async () => {
    render(<HomePage />);
    expect(
      await screen.findByText(/Kapasitas Produksi Skala Komersial/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Informasi Cetak Partai Besar')).toBeInTheDocument();
  });
});
