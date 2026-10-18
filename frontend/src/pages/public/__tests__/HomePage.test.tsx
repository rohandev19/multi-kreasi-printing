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
      await screen.findByText(/Solusi Percetakan Komersial & Pengadaan B2B/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/PT MULTI KREASI PRINTING/i)).toBeInTheDocument();
  });

  it('renders order tracking input and submit button', async () => {
    render(<HomePage />);
    expect(
      await screen.findByPlaceholderText(/Lacak Pesanan/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Cek Status')).toBeInTheDocument();
  });

  it('renders Job Ticket Estimator with calculation box', async () => {
    render(<HomePage />);
    expect(await screen.findByText(/JOB TICKET ESTIMATOR/i)).toBeInTheDocument();
    expect(screen.getByText(/Kalkulasi Estimasi Biaya Cetak/i)).toBeInTheDocument();
    expect(screen.getByText(/01. Jenis Pekerjaan \/ Produk/i)).toBeInTheDocument();
    expect(screen.getByText(/02. Jumlah Pesanan/i)).toBeInTheDocument();
  });

  it('renders production specifications table', async () => {
    render(<HomePage />);
    expect(
      await screen.findByText(/Matriks Spesifikasi & Lini Produk Utama/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Brosur & Flyer Lipat')).toBeInTheDocument();
    expect(screen.getByText('Custom Box Kemasan & Hardbox')).toBeInTheDocument();
  });

  it('renders B2B partnership callout section', async () => {
    render(<HomePage />);
    expect(
      await screen.findByText(/Punya Kebutuhan Cetak Rutin atau Anggaran Kantor Tahunan/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Buka Akun Perusahaan')).toBeInTheDocument();
  });
});
