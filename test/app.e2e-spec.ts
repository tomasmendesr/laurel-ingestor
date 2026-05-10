import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import type { FastifyInstance } from 'fastify';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/configure-app';
import { INGEST_API_KEY_HEADER } from '../src/common/guards/ingest-api-key.guard';
import { REQUEST_ID_HEADER } from '../src/common/middlewares/request-id.middleware';

const E2E_API_KEY = 'e2e-test-key';

const activityA = {
  activityId: '550e8400-e29b-41d4-a716-446655440001',
  userId: 'e2e-user',
  task: 'E2E task A',
  duration: 60,
  startTime: '2026-05-10T10:00:00.000Z',
};

const activityB = {
  activityId: '550e8400-e29b-41d4-a716-446655440002',
  userId: 'e2e-user',
  task: 'E2E task B',
  duration: 120,
  startTime: '2026-05-10T11:00:00.000Z',
};

describe('App (e2e)', () => {
  let app: NestFastifyApplication;
  let server: FastifyInstance;

  beforeEach(async () => {
    delete process.env['INGEST_API_KEY'];

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    configureApp(app);
    await app.init();
    server = app.getHttpAdapter().getInstance();
  });

  it('/health (GET) y header x-request-id', async () => {
    const res = await server.inject({ method: 'GET', url: '/health' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as { status: string; timestamp: string };
    expect(body).toMatchObject({ status: 'ok' });
    expect(typeof body.timestamp).toBe('string');
    const rid = res.headers[REQUEST_ID_HEADER];
    expect(rid).toBeDefined();
    expect(String(rid)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('respeta x-request-id enviado por el cliente', async () => {
    const id = 'aaaaaaaa-bbbb-4ccc-bbbb-aaaaaaaaaaaa';
    const res = await server.inject({
      method: 'GET',
      url: '/health',
      headers: { [REQUEST_ID_HEADER]: id },
    });
    expect(res.headers[REQUEST_ID_HEADER]).toBe(id);
  });

  it('POST /activities sin x-api-key responde 401', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/activities',
      payload: { activities: [activityA] },
      headers: { 'content-type': 'application/json' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('POST /activities ingiere batch y GET /activities devuelve lo persistido', async () => {
    const authHeaders = {
      'content-type': 'application/json',
      [INGEST_API_KEY_HEADER]: E2E_API_KEY,
    };
    const ingestRes = await server.inject({
      method: 'POST',
      url: '/activities',
      payload: { activities: [activityA, activityB] },
      headers: authHeaders,
    });
    expect(ingestRes.statusCode).toBe(200);

    const body = JSON.parse(ingestRes.body) as {
      totalReceived: number;
      persistedIds: string[];
      skippedDuplicateIds: string[];
    };
    expect(body.totalReceived).toBe(2);
    expect(body.persistedIds).toEqual(
      expect.arrayContaining([activityA.activityId, activityB.activityId]),
    );
    expect(body.persistedIds).toHaveLength(2);
    expect(body.skippedDuplicateIds).toEqual([]);

    const listRes = await server.inject({
      method: 'GET',
      url: '/activities',
      headers: { [INGEST_API_KEY_HEADER]: E2E_API_KEY },
    });
    expect(listRes.statusCode).toBe(200);
    const list = JSON.parse(listRes.body) as { activityId: string }[];
    expect(list).toHaveLength(2);
    const ids = list.map((x) => x.activityId);
    expect(ids).toEqual(expect.arrayContaining([activityA.activityId, activityB.activityId]));
  });

  it('POST /activities idempotente: reenvío del mismo batch no vuelve a persistir', async () => {
    const authHeaders = {
      'content-type': 'application/json',
      [INGEST_API_KEY_HEADER]: E2E_API_KEY,
    };
    await server.inject({
      method: 'POST',
      url: '/activities',
      payload: { activities: [activityA] },
      headers: authHeaders,
    });

    const second = await server.inject({
      method: 'POST',
      url: '/activities',
      payload: { activities: [activityA] },
      headers: authHeaders,
    });
    expect(second.statusCode).toBe(200);

    const body = JSON.parse(second.body) as {
      totalReceived: number;
      persistedIds: string[];
      skippedDuplicateIds: string[];
    };
    expect(body.totalReceived).toBe(1);
    expect(body.persistedIds).toEqual([]);
    expect(body.skippedDuplicateIds).toEqual([activityA.activityId]);
  });

  afterEach(async () => {
    await app.close();
  });
});
