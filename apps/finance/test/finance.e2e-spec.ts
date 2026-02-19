import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { execSync } from 'child_process';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Finance E2E', () => {
  let app: INestApplication;
  let postgresContainer: StartedTestContainer;
  let prismaService: PrismaService;

  beforeAll(async () => {
    jest.setTimeout(60000);

    // Start Postgres
    postgresContainer = await new GenericContainer('postgres:15-alpine')
      .withExposedPorts(5432)
      .withEnvironment({
        POSTGRES_USER: 'user',
        POSTGRES_PASSWORD: 'password',
        POSTGRES_DB: 'testdb_finance',
      })
      .withWaitStrategy(
        Wait.forLogMessage('database system is ready to accept connections'),
      )
      .start();

    const pgPort = postgresContainer.getMappedPort(5432);
    const pgHost = postgresContainer.getHost();
    const databaseUrl = `postgresql://user:password@${pgHost}:${pgPort}/testdb_finance?schema=public`;
    process.env.DATABASE_URL = databaseUrl;

    // Run Migrations
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
  });

  const userId = 'u1'; // Simulate authenticated user ID passed in header

  let walletId: string;
  let categoryId: string;

  it('should create a wallet', async () => {
    const res = await request(app.getHttpServer())
      .post('/wallets')
      .set('x-user-id', userId)
      .send({
        name: 'Main Wallet',
        type: 'Conta Corrente',
        userId: userId, // Body validation might require it? or controller sets it?
        // Check CreateWalletDto
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.balance).toBe('0'); // Decimal string
    walletId = res.body.id;
  });

  it('should create a category', async () => {
    const res = await request(app.getHttpServer())
      .post('/categories')
      .set('x-user-id', userId)
      .send({
        name: 'Food',
        type: 'Despesa',
        userId: userId,
      })
      .expect(201);

    categoryId = res.body.id;
  });

  it('should create a transaction and update wallet balance', async () => {
    const res = await request(app.getHttpServer())
      .post('/transactions')
      .set('x-user-id', userId)
      .send({
        walletId,
        categoryId,
        amount: 100,
        date: new Date().toISOString(),
        type: 'Despesa',
        status: 'Pago',
        isPaid: true,
        description: 'Lunch',
      })
      .expect(201);

    expect(Number(res.body.amount)).toBe(100);
    expect(res.body.isPaid).toBe(true);

    // Verify wallet balance
    const walletRes = await request(app.getHttpServer())
      .get(`/wallets/${walletId}`)
      .set('x-user-id', userId)
      .expect(200);

    expect(Number(walletRes.body.balance)).toBe(-100); // Expense subtracts
  });
});
