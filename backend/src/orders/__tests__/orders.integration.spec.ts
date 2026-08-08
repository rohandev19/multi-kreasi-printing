import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../orders.controller';
import { CreateOrderUseCase } from '../use-cases/create-order.usecase';
import { UpdateOrderStatusUseCase } from '../use-cases/update-order-status.usecase';
import { SubmitOrderUseCase } from '../use-cases/submit-order.usecase';
import { ApproveOrderUseCase } from '../use-cases/approve-order.usecase';
import { CancelOrderUseCase } from '../use-cases/cancel-order.usecase';
import { SearchOrdersUseCase } from '../use-cases/search-orders.usecase';
import { GetOrderDetailsUseCase } from '../use-cases/get-order-details.usecase';
import { PrismaService } from '../../prisma/prisma.service';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { VerifiedGuard } from '../../auth/guards/verified.guard';

describe('OrdersController Integration', () => {
  let controller: OrdersController;
  let createOrderUseCase: CreateOrderUseCase;
  let getOrderDetailsUseCase: GetOrderDetailsUseCase;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: CreateOrderUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: UpdateOrderStatusUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: SubmitOrderUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: ApproveOrderUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: CancelOrderUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: SearchOrdersUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: GetOrderDetailsUseCase,
          useValue: { execute: vi.fn() },
        },
        {
          provide: PrismaService,
          useValue: {
            order: {
              findMany: vi.fn(),
              findUnique: vi.fn(),
              count: vi.fn(),
            },
            designFile: {
              findMany: vi.fn(),
            },
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(VerifiedGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    createOrderUseCase = module.get<CreateOrderUseCase>(CreateOrderUseCase);
    getOrderDetailsUseCase = module.get<GetOrderDetailsUseCase>(
      GetOrderDetailsUseCase,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create an order by calling createOrderUseCase', async () => {
      const mockDto = {
        customerId: 'customer-1',
        items: [{ productId: 'prod-1', quantity: 100 }],
        priority: 'Normal',
      } as any;

      const mockReq = {
        user: { sub: 'user-1', role: 'Customer', email: 'test@example.com' },
      } as any;

      const expectedResponse = { id: 'order-1', orderNumber: 'ORD-2026-0001' };

      (createOrderUseCase.execute as Mock).mockResolvedValue(expectedResponse);

      const result = await controller.create(mockDto, mockReq);

      expect(createOrderUseCase.execute).toHaveBeenCalledWith(
        mockDto,
        'user-1',
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('list', () => {
    it('should return only customer orders for Customer role', async () => {
      const mockReq = {
        user: { sub: 'user-1', role: 'Customer', email: 'test@example.com' },
        query: {},
      } as any;

      const mockOrders = [{ id: 'order-1' }];
      (prisma.order.findMany as Mock).mockResolvedValue(mockOrders);
      (prisma.order.count as Mock).mockResolvedValue(1);

      const result = await controller.list(mockReq);

      expect(prisma.order.count).toHaveBeenCalledWith({
        where: { customer: { email: 'test@example.com' } },
      });
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: { customer: { email: 'test@example.com' } },
        include: { customer: { select: { companyName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 50,
      });
      expect(result).toEqual({
        data: mockOrders,
        meta: {
          total: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      });
    });

    it('should return all orders for Owner role without role query param', async () => {
      const mockReq = {
        user: { sub: 'user-1', role: 'Owner', email: 'owner@example.com' },
        query: {},
      } as any;

      const mockOrders = [{ id: 'order-1' }];
      (prisma.order.findMany as Mock).mockResolvedValue(mockOrders);
      (prisma.order.count as Mock).mockResolvedValue(1);

      const result = await controller.list(mockReq);

      expect(prisma.order.count).toHaveBeenCalledWith({
        where: {},
      });
      expect(prisma.order.findMany).toHaveBeenCalledWith({
        where: {},
        include: { customer: { select: { companyName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 50,
      });
      expect(result).toEqual({
        data: mockOrders,
        meta: {
          total: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      });
    });
  });

  describe('getDetails', () => {
    it('should call getOrderDetailsUseCase with order id and user', async () => {
      const mockReq = {
        user: { sub: 'user-1', role: 'Customer', email: 'test@example.com' },
      } as any;

      const expectedDetails = { id: 'order-1', items: [] };
      (getOrderDetailsUseCase.execute as Mock).mockResolvedValue(
        expectedDetails,
      );

      const result = await controller.getDetails('order-1', mockReq);

      expect(getOrderDetailsUseCase.execute).toHaveBeenCalledWith(
        'order-1',
        mockReq.user,
      );
      expect(result).toEqual(expectedDetails);
    });
  });

  describe('getOrderDesignFiles', () => {
    it('should return empty array if customer accesses another customer order', async () => {
      const mockReq = {
        user: { sub: 'user-1', role: 'Customer', email: 'test@example.com' },
      } as any;

      (prisma.order.findUnique as Mock).mockResolvedValue({
        id: 'order-2',
        customer: { email: 'another@example.com' },
      });

      const result = await controller.getOrderDesignFiles('order-2', mockReq);

      expect(result).toEqual([]);
      expect(prisma.designFile.findMany).not.toHaveBeenCalled();
    });

    it('should return design files for authorized user', async () => {
      const mockReq = {
        user: { sub: 'user-1', role: 'Customer', email: 'test@example.com' },
      } as any;

      (prisma.order.findUnique as Mock).mockResolvedValue({
        id: 'order-1',
        customer: { email: 'test@example.com' },
      });

      const mockFiles = [{ id: 'file-1' }];
      (prisma.designFile.findMany as Mock).mockResolvedValue(mockFiles);

      const result = await controller.getOrderDesignFiles('order-1', mockReq);

      expect(prisma.designFile.findMany).toHaveBeenCalledWith({
        where: { orderId: 'order-1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockFiles);
    });
  });
});
