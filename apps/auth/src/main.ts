import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  // log port when finish bootstrap
  const port = process.env.PORT ?? 56081;
  await app.listen(port, '0.0.0.0');
  console.log(`Auth service is running on port ${port}`);
}
bootstrap();
