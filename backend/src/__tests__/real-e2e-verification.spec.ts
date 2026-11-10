import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaService } from '../prisma/prisma.service';
import { GetDashboardMetricsUseCase } from '../dashboard/use-cases/get-dashboard-metrics.usecase';
import { GetOwnerMetricsUseCase } from '../dashboard/use-cases/get-owner-metrics.usecase';
import { GetManagerMetricsUseCase } from '../dashboard/use-cases/get-manager-metrics.usecase';
import { GetWarehouseStaffMetricsUseCase } from '../dashboard/use-cases/get-warehouse-staff-metrics.usecase';
import { CalculateKPIsUseCase } from '../dashboard/use-cases/calculate-kpis.usecase';
import { GetArAgingReportUseCase } from '../finance/use-cases/get-ar-aging-report.usecase';

describe('Real PostgreSQL E2E Experiment Verification', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. Real DB Connection & materials table column verification', async () => {
    const check = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'materials' AND column_name = 'min_stock_level'
      ) as exists;
    `;
    expect(check[0]?.exists).toBe(true);
  });

  it('2. Real check constraint: materials_stock_non_negative prevents negative stock', async () => {
    const testSku = `TEST-MAT-${Date.now()}`;
    const mat = await prisma.material.create({
      data: {
        sku: testSku,
        name: 'Test Raw Material for Constraint Verification',
        currentStock: 10,
        minStockLevel: 5,
        unitOfMeasure: 'ROLL',
        costPrice: 50000,
        status: 'Active',
      },
    });

    try {
      // Attempting to set stock to -5 must be rejected by PostgreSQL CHECK constraint!
      await expect(
        prisma.$executeRaw`UPDATE materials SET current_stock = -5 WHERE id = ${mat.id}::uuid`,
      ).rejects.toThrow();
    } finally {
      await prisma.material.delete({ where: { id: mat.id } });
    }
  });

  it('3. Real experiment: GetDashboardMetricsUseCase executes on real DB without silent errors', async () => {
    const useCase = new GetDashboardMetricsUseCase(prisma);
    const metrics = await useCase.execute();

    expect(metrics).toBeDefined();
    expect(typeof metrics.revenue.today).toBe('number');
    expect(typeof metrics.revenue.yesterday).toBe('number');
    expect(typeof metrics.ordersToday).toBe('number');
    expect(typeof metrics.pendingApprovals).toBe('number');
    expect(typeof metrics.lowStockAlerts).toBe('number');
  });

  it('4. Real experiment: GetOwnerMetricsUseCase executes on real DB and populates all widgets', async () => {
    const useCase = new GetOwnerMetricsUseCase(prisma);
    const result = await useCase.execute();

    expect(result.widgets).toBeDefined();
    expect(result.widgets.length).toBe(6);

    const widgetIds = result.widgets.map((w) => w.id);
    expect(widgetIds).toContain('owner-revenue');
    expect(widgetIds).toContain('owner-orders');
    expect(widgetIds).toContain('owner-pending-approvals');
    expect(widgetIds).toContain('owner-low-stock');
    expect(widgetIds).toContain('owner-active-jobs');
    expect(widgetIds).toContain('owner-customers');
  });

  it('5. Real experiment: GetManagerMetricsUseCase executes on real DB and queries active staff correctly', async () => {
    const useCase = new GetManagerMetricsUseCase(prisma);
    const result = await useCase.execute();

    expect(result.widgets).toBeDefined();
    expect(result.widgets.length).toBe(5);

    const staffWidget = result.widgets.find((w) => w.id === 'manager-team');
    expect(staffWidget).toBeDefined();
    expect(typeof staffWidget?.value).toBe('number');
  });

  it('6. Real experiment: GetWarehouseStaffMetricsUseCase executes on real DB using materials & stock_movements', async () => {
    const useCase = new GetWarehouseStaffMetricsUseCase(prisma);
    const result = await useCase.execute();

    expect(result.widgets).toBeDefined();
    expect(result.widgets.length).toBe(4);

    const invValueWidget = result.widgets.find(
      (w) => w.id === 'warehouse-inventory-value',
    );
    expect(invValueWidget).toBeDefined();
    expect(typeof invValueWidget?.value).toBe('number');
  });

  it('7. Real experiment: CalculateKPIsUseCase executes on real DB with Promise.all and material costs', async () => {
    const useCase = new CalculateKPIsUseCase(prisma);
    const kpis = await useCase.execute();

    expect(kpis.totalRevenue).toBeDefined();
    expect(typeof kpis.totalRevenue.value).toBe('number');
    expect(kpis.grossProfit).toBeDefined();
    expect(typeof kpis.grossProfit.value).toBe('number');
    expect(kpis.conversionRate).toBeDefined();
    expect(typeof kpis.conversionRate.value).toBe('number');
    expect(kpis.customerAcquisitionCost).toBeDefined();
    expect(typeof kpis.customerAcquisitionCost.value).toBe('number');
  });

  it('8. Real experiment: GetArAgingReportUseCase executes on real DB and produces valid aging buckets', async () => {
    const useCase = new GetArAgingReportUseCase(prisma);
    const report = await useCase.execute();

    expect(report.summary).toBeDefined();
    expect(typeof report.summary.totalReceivables).toBe('number');
    expect(typeof report.summary.totalCurrent).toBe('number');
    expect(typeof report.summary.totalOverdue).toBe('number');
    expect(Array.isArray(report.customers)).toBe(true);
  });
});
