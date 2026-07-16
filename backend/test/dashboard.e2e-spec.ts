import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import type { Server } from 'http';

interface LoginResponse {
  access_token: string;
}

interface Widget {
  id: string;
  type: string;
  value: string | number;
}

interface MetricsResponse {
  widgets: Widget[];
}

interface KpiData {
  value: number;
}

interface KpisResponse {
  totalRevenue: KpiData;
  customerAcquisitionCost: KpiData;
}

interface RevenueData {
  date: string;
  total: number;
}

describe('DashboardController (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Login to get token
    const server = app.getHttpServer() as Server;
    const loginRes = await request(server)
      .post('/v1/auth/login')
      .send({ email: 'owner@mkp.com', password: 'password' });

    jwtToken = (loginRes.body as LoginResponse).access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/v1/dashboard/metrics (GET) - returns 200 with widgets', () => {
    const server = app.getHttpServer() as Server;
    return request(server)
      .get('/v1/dashboard/metrics')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as MetricsResponse;
        expect(body.widgets).toBeDefined();
        expect(Array.isArray(body.widgets)).toBeTruthy();
      });
  });

  it('/v1/dashboard/kpis (GET) - returns 200 with CAC and trends', () => {
    const server = app.getHttpServer() as Server;
    return request(server)
      .get('/v1/dashboard/kpis')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as KpisResponse;
        expect(body.totalRevenue).toBeDefined();
        expect(body.totalRevenue.value).toBeDefined();
        expect(body.customerAcquisitionCost).toBeDefined();
      });
  });

  it('/v1/dashboard/charts/revenue (GET) - returns 200 with 30-day data', () => {
    const server = app.getHttpServer() as Server;
    return request(server)
      .get('/v1/dashboard/charts/revenue')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as RevenueData[];
        expect(Array.isArray(body)).toBeTruthy();
        if (body.length > 0) {
          expect(body[0].date).toBeDefined();
          expect(body[0].total).toBeDefined();
        }
      });
  });
});
