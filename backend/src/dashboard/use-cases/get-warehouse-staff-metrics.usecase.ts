import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardMetricsResponse } from '../dto/dashboard-metrics-response.dto';

@Injectable()
export class GetWarehouseStaffMetricsUseCase {
  private readonly logger = new Logger(GetWarehouseStaffMetricsUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<DashboardMetricsResponse> {
    this.logger.log('Fetching Warehouse Staff Metrics...');

    try {
      const [
        lowStockAlertsRaw,
        incomingMaterials,
        outgoingShipments,
        inventoryValueRaw,
      ] = await Promise.all([
        this.prisma.$queryRaw<{ count: bigint }[]>`
          SELECT COUNT(*) as count
          FROM materials
          WHERE current_stock <= min_stock_level
            AND status = 'Active'
        `.catch(() => [{ count: 0n }]),
        this.prisma.stockMovement
          .count({
            where: {
              type: { in: ['IN', 'RESTOCK', 'Purchase'] },
            },
          })
          .catch(() => 0),
        this.prisma.shipment
          .count({
            where: { status: 'In_Transit' },
          })
          .catch(() => 0),
        this.prisma.$queryRaw<{ total: number | null }[]>`
          SELECT SUM(current_stock * cost_price) as total
          FROM materials
          WHERE status = 'Active'
        `.catch(() => [{ total: 0 }]),
      ]);

      const lowStockAlerts = Number(lowStockAlertsRaw[0]?.count || 0);
      const totalInventoryValue = Number(inventoryValueRaw[0]?.total || 0);

      return {
        widgets: [
          {
            id: 'warehouse-low-stock',
            title: 'Low Stock Items',
            type: 'stat',
            value: lowStockAlerts,
            icon: 'alert',
            color: 'red',
          },
          {
            id: 'warehouse-incoming',
            title: 'Incoming Materials',
            type: 'stat',
            value: incomingMaterials,
            icon: 'inbox',
            color: 'blue',
          },
          {
            id: 'warehouse-outgoing',
            title: 'Outgoing Shipments',
            type: 'stat',
            value: outgoingShipments,
            icon: 'truck',
            color: 'emerald',
          },
          {
            id: 'warehouse-inventory-value',
            title: 'Inventory Value',
            type: 'stat',
            value: totalInventoryValue, // Ideally formatted on frontend
            icon: 'revenue',
            color: 'purple',
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error fetching warehouse staff metrics', error);
      return { widgets: [] };
    }
  }
}
