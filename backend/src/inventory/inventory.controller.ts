import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Request } from 'express';

@Controller('api/v1/inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  
  private fallbackMaterials = [
    { id: '1', name: 'A4 Paper 80gsm', sku: 'PPR-A4-80', quantity: 5000, unit: 'sheets', minStock: 1000, category: 'Paper', status: 'In_Stock' },
    { id: '2', name: 'Vinyl Banner Material', sku: 'VNL-BNR-01', quantity: 250, unit: 'm²', minStock: 500, category: 'Vinyl', status: 'Low_Stock' },
    { id: '3', name: 'Inkjet Ink Cyan', sku: 'INK-CYN-01', quantity: 0, unit: 'liters', minStock: 5, category: 'Ink', status: 'Out_of_Stock' },
    { id: '4', name: 'Laminating Film', sku: 'LAM-FLM-01', quantity: 1200, unit: 'm²', minStock: 300, category: 'Laminate', status: 'In_Stock' },
    { id: '5', name: 'Cardstock 300gsm', sku: 'CRD-300', quantity: 800, unit: 'sheets', minStock: 1000, category: 'Paper', status: 'Low_Stock' },
  ];

  @Get()
  @Roles('Owner', 'Manager', 'Warehouse_Staff')
  getInventory(@Req() req: Request) {
    const user = (req as any).user;
    
    // For Warehouse_Staff: return stock management fields only
    // For Owner/Manager: return all fields including supplier info
    if (user.role === 'Warehouse_Staff') {
      return this.fallbackMaterials.map(m => ({
        id: m.id,
        name: m.name,
        sku: m.sku,
        quantity: m.quantity,
        unit: m.unit,
        minStock: m.minStock,
        status: m.status,
      }));
    }
    
    // Return all (mocking supplier info since it doesn't exist in dummy data yet)
    return this.fallbackMaterials.map(m => ({
      ...m,
      supplierInfo: 'Mock Supplier Inc',
    }));
  }
}
