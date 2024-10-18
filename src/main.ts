import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GLOBAL_PREFIX } from 'utils/constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix(GLOBAL_PREFIX);
  //Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('GoWagr Simple Money Transfer System')
    .setDescription('This is a simple money transfer system')
    .setVersion('1.0.0')
    .addServer('http://localhost:3000', 'Local')
    .addServer('staging', 'Staging')
    .addServer('production', 'Production')
    .addTag('Transfer System')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory);

  await app.listen(process.env.Port ?? 3000);
}

bootstrap();
