import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'node_modules/swagger-ui-dist'), {
    prefix: '/api-doc',
  });

  const config = new DocumentBuilder()
    .setTitle('Eureka-Learn API')
    .setDescription('Documentation API of Eureka-Learn')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document, {
    customSiteTitle: 'Eureka-Learn API Documentation',
    customfavIcon: '/api-doc/favicon-32x32.png',
    customJs: [
      '/api-doc/swagger-ui-bundle.js',
      '/api-doc/swagger-ui-standalone-preset.js',
    ],
    customCssUrl: '/api-doc/swagger-ui.css',
  });

  const corsOptions: CorsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    preflightContinue: false,
    allowedHeaders: [
      'Content-type',
      'Access-Control-Request-Headers',
      'range',
      'Content-Range',
      'Authorization',
    ],
    exposedHeaders: ['Content-Range', 'Authorization'],
  };

  app.enableCors(corsOptions);
  await app.listen(3002);
}
bootstrap();
