import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('finance');
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap();
