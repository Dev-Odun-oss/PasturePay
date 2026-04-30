import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('CampaignController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it('POST /campaigns creates a campaign', () =>
    request(app.getHttpServer())
      .post('/campaigns')
      .send({
        creator: 'GABC123',
        goal: 10000,
        tokenAddress: 'USDC_CONTRACT',
        milestones: [
          { description: 'Prototype', targetPct: 50 },
          { description: 'Launch', targetPct: 50 },
        ],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.creator).toBe('GABC123');
        expect(res.body.milestones).toHaveLength(2);
      }));

  it('GET /campaigns returns list', () =>
    request(app.getHttpServer()).get('/campaigns').expect(200).expect((res) => {
      expect(Array.isArray(res.body)).toBe(true);
    }));
});
