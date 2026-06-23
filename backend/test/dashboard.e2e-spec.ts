import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

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
    const loginRes = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'owner@mkp.com', password: 'password' });

    jwtToken = loginRes.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/v1/dashboard/metrics (GET) - returns 200 with widgets', () => {
    return request(app.getHttpServer())
      .get('/v1/dashboard/metrics')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.widgets).toBeDefined();
        expect(Array.isArray(res.body.widgets)).toBeTruthy();
      });
  });

  it('/v1/dashboard/kpis (GET) - returns 200 with CAC and trends', () => {
    return request(app.getHttpServer())
      .get('/v1/dashboard/kpis')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.totalRevenue).toBeDefined();
        expect(res.body.totalRevenue.value).toBeDefined();
        expect(res.body.customerAcquisitionCost).toBeDefined();
      });
  });

  it('/v1/dashboard/charts/revenue (GET) - returns 200 with 30-day data', () => {
    return request(app.getHttpServer())
      .get('/v1/dashboard/charts/revenue')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
        if (res.body.length > 0) {
          expect(res.body[0].date).toBeDefined();
          expect(res.body[0].total).toBeDefined();
        }
      });
  });
});
