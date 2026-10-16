import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../utils/test-utils';
import { DispatchShipmentModal } from '../DispatchShipmentModal';
import api from '../../../api/axios';

vi.mock('../../../api/axios', () => ({
  default: {
    patch: vi.fn(),
  },
}));

describe('DispatchShipmentModal Component', () => {
  const mockShipment = {
    id: 'shipment-101',
    shipmentNumber: 'SJ-2026-0001',
    orderId: 'order-202',
    order: {
      orderNumber: 'ORD-2026-001',
      customer: {
        companyName: 'PT Maju Bersama',
        name: 'Bpk. Budi',
      },
    },
    recipientName: 'Bpk. Budi',
    recipientPhone: '08123456789',
    deliveryAddress: 'Jl. Sudirman Kav. 21, Jakarta Selatan',
    carrier: 'Armada Internal MKP',
    driverName: 'Pak Joko',
    driverPhone: '0811223344',
    vehicleNumber: 'B 1234 MKP',
    status: 'Preparing',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders shipment info and carrier presets correctly for dispatching', () => {
    render(
      <DispatchShipmentModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        shipment={mockShipment}
        isUpdateOnly={false}
      />,
    );

    expect(screen.getByText(/Berangkatkan Pengiriman - SJ-2026-0001/i)).toBeInTheDocument();
    expect(screen.getByText(/ORD-2026-001/i)).toBeInTheDocument();
    expect(screen.getByText(/Jl. Sudirman Kav. 21, Jakarta Selatan/i)).toBeInTheDocument();
    expect(screen.getByText('Armada Internal MKP')).toBeInTheDocument();
    expect(screen.getByText('JNE Express')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Berangkatkan Pengiriman/i })).toBeInTheDocument();
  });

  it('switches to 3PL tracking input when clicking JNE Express', () => {
    render(
      <DispatchShipmentModal
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        shipment={mockShipment}
        isUpdateOnly={false}
      />,
    );

    const jneButton = screen.getByText('JNE Express');
    fireEvent.click(jneButton);

    expect(screen.getByText(/Detail Resi & Tracking Kurir Pihak Ketiga/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Contoh: JNE0192830192/i)).toBeInTheDocument();
  });

  it('submits dispatch to In_Transit with updated carrier details', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();
    (api.patch as any).mockResolvedValueOnce({ data: { success: true } });

    render(
      <DispatchShipmentModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        shipment={mockShipment}
        isUpdateOnly={false}
      />,
    );

    const submitButton = screen.getByRole('button', { name: /Berangkatkan Pengiriman/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        '/api/v1/shipments/shipment-101/status',
        expect.objectContaining({
          status: 'In_Transit',
          carrier: 'Armada Internal MKP',
          driverName: 'Pak Joko',
        }),
      );
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('calls tracking update endpoint when isUpdateOnly is true', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();
    (api.patch as any).mockResolvedValueOnce({ data: { success: true } });

    render(
      <DispatchShipmentModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
        shipment={mockShipment}
        isUpdateOnly={true}
      />,
    );

    expect(
      screen.getByText(/Perbarui Informasi Resi & Kurir - SJ-2026-0001/i),
    ).toBeInTheDocument();

    const saveButton = screen.getByRole('button', {
      name: /Simpan Perubahan Informasi Kurir\/Resi/i,
    });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        '/api/v1/shipments/shipment-101/tracking',
        expect.objectContaining({
          carrier: 'Armada Internal MKP',
        }),
      );
      expect(handleSuccess).toHaveBeenCalled();
    });
  });
});
