import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../utils/test-utils';
import { ProofReviewModal, type ProofItem } from '../ProofReviewModal';
import api from '../../../api/axios';

vi.mock('../../../api/axios', () => ({
  default: {
    patch: vi.fn(),
  },
}));

describe('ProofReviewModal Component', () => {
  const pendingProof: ProofItem = {
    id: 'proof-123',
    orderId: 'order-456',
    version: 1,
    fileUrl: 'https://storage.mkprinting.co.id/proofs/proof_v1.pdf',
    fileName: 'katalog_b2b_v1.pdf',
    notes: 'Bleed 3mm disesuaikan, warna FOGRA39',
    status: 'Pending_Approval',
    createdAt: new Date().toISOString(),
    createdBy: {
      fullName: 'Prepress Lead',
    },
  };

  const approvedProof: ProofItem = {
    ...pendingProof,
    id: 'proof-789',
    version: 2,
    status: 'Approved',
    approvedAt: '2026-10-12T10:00:00Z',
    approvalNotes: 'Sudah diperiksa, siap naik cetak',
    signerIp: '180.252.11.22',
    approvedBy: {
      fullName: 'John Corporate',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders proof information and prepress calibration details correctly', () => {
    render(
      <ProofReviewModal
        isOpen={true}
        onClose={vi.fn()}
        proof={pendingProof}
        orderNumber="ORD-2026-001"
      />
    );

    expect(screen.getByText(/Bukti Cetak Digital \(Proof v1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/ORD-2026-001/i)).toBeInTheDocument();
    expect(screen.getByText(/Bleed 3mm disesuaikan, warna FOGRA39/i)).toBeInTheDocument();
    expect(screen.getByText(/Prepress Calibration/i)).toBeInTheDocument();
    expect(screen.getByText(/Menunggu ACC Pelanggan/i)).toBeInTheDocument();
  });

  it('disables approval button until legal disclaimer checkbox is checked', async () => {
    render(
      <ProofReviewModal
        isOpen={true}
        onClose={vi.fn()}
        proof={pendingProof}
        orderNumber="ORD-2026-001"
      />
    );

    const approveBtn = screen.getByRole('button', { name: /Setujui Bukti Cetak/i });
    expect(approveBtn).toBeDisabled();

    const disclaimerCheckbox = screen.getByRole('checkbox');
    expect(disclaimerCheckbox).not.toBeChecked();

    fireEvent.click(disclaimerCheckbox);
    expect(disclaimerCheckbox).toBeChecked();
    expect(approveBtn).not.toBeDisabled();
  });

  it('submits approval with disclaimer and calls onSuccess', async () => {
    (api.patch as any).mockResolvedValueOnce({ data: { success: true } });
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <ProofReviewModal
        isOpen={true}
        onClose={handleClose}
        proof={pendingProof}
        orderNumber="ORD-2026-001"
        onSuccess={handleSuccess}
      />
    );

    const disclaimerCheckbox = screen.getByRole('checkbox');
    fireEvent.click(disclaimerCheckbox);

    const approveBtn = screen.getByRole('button', { name: /Setujui Bukti Cetak/i });
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        '/api/v1/proofs/proof-123/approve',
        expect.objectContaining({
          agreedToDisclaimer: true,
        })
      );
      expect(handleSuccess).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  it('allows requesting revisions when switching to revision tab', async () => {
    (api.patch as any).mockResolvedValueOnce({ data: { success: true } });
    const handleSuccess = vi.fn();

    render(
      <ProofReviewModal
        isOpen={true}
        onClose={vi.fn()}
        proof={pendingProof}
        orderNumber="ORD-2026-001"
        onSuccess={handleSuccess}
      />
    );

    const revisionTabBtn = screen.getByRole('button', { name: /Minta Revisi Desain/i });
    fireEvent.click(revisionTabBtn);

    const textarea = screen.getByPlaceholderText(/Tuliskan secara spesifik bagian yang perlu diperbaiki/i);
    expect(textarea).toBeInTheDocument();

    const submitRevisionBtn = screen.getByRole('button', { name: /Kirim Catatan Revisi/i });
    expect(submitRevisionBtn).toBeDisabled();

    fireEvent.change(textarea, { target: { value: 'Font pada alamat mohon diperbesar ke 10pt' } });
    expect(submitRevisionBtn).not.toBeDisabled();

    fireEvent.click(submitRevisionBtn);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        '/api/v1/proofs/proof-123/reject',
        {
          rejectionReason: 'Font pada alamat mohon diperbesar ke 10pt',
        }
      );
      expect(handleSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('renders official ACC Cetak stamp and audit metadata when already approved', () => {
    render(
      <ProofReviewModal
        isOpen={true}
        onClose={vi.fn()}
        proof={approvedProof}
        orderNumber="ORD-2026-001"
      />
    );

    expect(screen.getByText('ACC CETAK')).toBeInTheDocument();
    expect(screen.getByText(/SIAP PRODUKSI • SIGNED OFF/i)).toBeInTheDocument();
    expect(screen.getByText(/Verifikasi Persetujuan Digital/i)).toBeInTheDocument();
    expect(screen.getByText(/180.252.11.22/i)).toBeInTheDocument();
    expect(screen.getByText(/John Corporate/i)).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
