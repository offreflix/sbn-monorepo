import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  // app.setGlobalPrefix('finance'); // Removed to match orchestrator proxy logic (strips /api/finance)
  await app.listen(process.env.PORT ?? 56082, '0.0.0.0');
}
bootstrap();
