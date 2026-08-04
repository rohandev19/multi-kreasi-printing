import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { CacheService } from './cache/cache.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: { canConnect: vi.fn().mockResolvedValue(true) },
        },
        {
          provide: CacheService,
          useValue: { healthCheck: vi.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('healthCheck', () => {
    it('should return health status', async () => {
      const result = await appController.healthCheck();
      expect(result.status).toBe('healthy');
      expect(result.services.database).toBe('up');
      expect(result.services.redis).toBe('up');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('memory');
    });
  });
});

