import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GLOBAL_PREFIX } from 'utils/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix(GLOBAL_PREFIX);
  await app.listen(3000);
}

bootstrap();
