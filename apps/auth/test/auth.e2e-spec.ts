import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { execSync } from 'child_process';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let postgresContainer: StartedTestContainer;
  let redisContainer: StartedTestContainer;
  let prismaService: PrismaService;

  beforeAll(async () => {
    jest.setTimeout(60000); // Increase test timeout

    // Start Postgres
    postgresContainer = await new GenericContainer('postgres:15-alpine')
      .withExposedPorts(5432)
      .withEnvironment({
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'password',
        POSTGRES_DB: 'testdb',
      })
      .withWaitStrategy(
        Wait.forLogMessage('database system is ready to accept connections'),
      )
      .start();

    const pgPort = postgresContainer.getMappedPort(5432);
    const pgHost = postgresContainer.getHost();
    const databaseUrl = `postgresql://user:password@${pgHost}:${pgPort}/testdb?schema=public`;
    process.env.DATABASE_URL = databaseUrl;

    // Start Redis
    redisContainer = await new GenericContainer('redis:7-alpine')
      .withExposedPorts(6379)
      .withWaitStrategy(Wait.forLogMessage('Ready to accept connections'))
      .start();

    const redisPort = redisContainer.getMappedPort(6379);
    const redisHost = redisContainer.getHost();
    process.env.REDIS_HOST = redisHost;
    process.env.REDIS_PORT = redisPort.toString();

    // Run Migrations
    // Use prisma migrate deploy
    // Ensure prisma is available or use npx
    try {
      execSync('npx prisma migrate deploy', {
        env: process.env,
        stdio: 'inherit',
      });
    } catch (e) {
      console.error('Migration failed:', e);
      throw e;
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    prismaService = app.get<PrismaService>(PrismaService);
  }, 60000);

  afterAll(async () => {
    if (app) await app.close();
    if (postgresContainer) await postgresContainer.stop();
    if (redisContainer) await redisContainer.stop();
  });

  it('/auth/register (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e@example.com',
        password: 'password123',
        name: 'E2E User',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('e2e@example.com');
  });

  it('/auth/login (POST)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e@example.com',
        password: 'password123',
      })
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');

    // Save refresh token for next test?
    // Tests might run in parallel or sequence? Jest runs describe blocks sequentially.
    // I will save it in a variable if needed, but for now just verification.
  });

  it('/auth/refresh (POST)', async () => {
    // Login to get token first
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e@example.com',
        password: 'password123',
      })
      .expect(200);

    const refreshToken = loginRes.body.refreshToken;

    const refreshRes = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(refreshRes.body).toHaveProperty('accessToken');
    expect(refreshRes.body).toHaveProperty('refreshToken');
    expect(refreshRes.body.refreshToken).not.toBe(refreshToken);
  });
});
