import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  console.log('Orchestrator started on port 56080');
  await app.listen(56080, '0.0.0.0');
}
bootstrap();
