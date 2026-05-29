import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

const DEFAULT_CORS_ORIGINS = [
  'http://localhost',
  'http://localhost:80',
  'http://localhost:9000',
  'http://localhost:9001',
  'http://localhost:9002',
  'http://localhost:56080',
];

function parseCorsOrigins() {
  return (process.env.CORS_ORIGINS ?? DEFAULT_CORS_ORIGINS.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: parseCorsOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Authorization',
      'Content-Type',
      'X-API-Key',
      'X-Request-ID',
      'X-Correlation-ID',
    ],
  });
  Logger.log('Orchestrator started on port 56080', 'Bootstrap');
  await app.listen(56080, '0.0.0.0');
}
bootstrap();
