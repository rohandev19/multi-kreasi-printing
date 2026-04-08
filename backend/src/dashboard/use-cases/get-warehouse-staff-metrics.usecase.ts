import { Injectable, Logger } from '@nestjs/common';
import { createPrismaClient } from '../../prisma/prisma-client.helper';
import { DashboardMetricsResponse } from '../dto/dashboard-metrics-response.dto';

@Injectable()
export class GetWarehouseStaffMetricsUseCase {
  private readonly logger = new Logger(GetWarehouseStaffMetricsUseCase.name);
  private prisma = createPrismaClient();

  async execute(): Promise<DashboardMetricsResponse> {
    this.logger.log('Fetching Warehouse Staff Metrics...');

    try {
      // Since raw_materials, purchase_orders, and shipments are not yet in the schema,
      // we gracefully return 0 or placeholder values.

      // 1. Low Stock Items (current_stock <= minimum_stock)
      let lowStockAlerts = 0;
      try {
        const lowStockAlertsRaw = await this.prisma.$queryRaw<
          { count: bigint }[]
        >`
          SELECT COUNT(*) as count 
          FROM raw_materials 
          WHERE current_stock <= minimum_stock
        `;
        lowStockAlerts = Number(lowStockAlertsRaw[0]?.count || 0);
      } catch (error) {
        lowStockAlerts = 0; // Graceful degradation
      }

      // 2. Incoming Materials (pending purchase orders)
      let incomingMaterials = 0;
      try {
        const incomingMaterialsRaw = await this.prisma.$queryRaw<
          { count: bigint }[]
        >`
          SELECT COUNT(*) as count 
          FROM purchase_orders 
          WHERE status = 'Pending'
        `;
        incomingMaterials = Number(incomingMaterialsRaw[0]?.count || 0);
      } catch (error) {
        incomingMaterials = 0;
      }

      // 3. Outgoing Shipments (shipments in transit)
      let outgoingShipments = 0;
      try {
        const outgoingShipmentsRaw = await this.prisma.$queryRaw<
          { count: bigint }[]
        >`
          SELECT COUNT(*) as count 
          FROM shipments 
          WHERE status = 'In_Transit'
        `;
        outgoingShipments = Number(outgoingShipmentsRaw[0]?.count || 0);
      } catch (error) {
        outgoingShipments = 0;
      }

      // 4. Total Inventory Value
      let totalInventoryValue = 0;
      try {
        const inventoryValueRaw = await this.prisma.$queryRaw<
          { total: number }[]
        >`
          SELECT SUM(current_stock * unit_cost) as total 
          FROM raw_materials
        `;
        totalInventoryValue = Number(inventoryValueRaw[0]?.total || 0);
      } catch (error) {
        totalInventoryValue = 0;
      }

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
