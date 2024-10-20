import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  GLOBAL_PREFIX,
  SWAGGER_DESCRIPTION,
  SWAGGER_DOC_ENDPOINT,
  SWAGGER_LOCAL_URL,
  SWAGGER_PRODUCTION_URL,
  SWAGGER_SERVERS,
  SWAGGER_STAGING_URL,
  SWAGGER_TAG,
  SWAGGER_TITLE,
  SWAGGER_VERSION,
} from 'src/utils/constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BackendValidationPipe } from './utils/pipes/backendValidation.pipes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  app.setGlobalPrefix(GLOBAL_PREFIX);

  //Set up Swagger
  const config = new DocumentBuilder()
    .setTitle(SWAGGER_TITLE)
    .setDescription(SWAGGER_DESCRIPTION)
    .setVersion(SWAGGER_VERSION)
    .addServer(SWAGGER_LOCAL_URL, SWAGGER_SERVERS.LOCAL)
    .addServer(SWAGGER_STAGING_URL, SWAGGER_SERVERS.STAGING)
    .addServer(SWAGGER_PRODUCTION_URL, SWAGGER_SERVERS.PRODUCTION)
    .addTag(SWAGGER_TAG)
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_DOC_ENDPOINT, app, documentFactory);

  await app.listen(process.env.Port ?? 3000);
}

bootstrap();
