import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const config = new DocumentBuilder()
    .setTitle('Eureka-Learn API')
    .setDescription('Documentation API of Eureka-Learn')
    .setVersion('1.0')
    .build();

  const app = await NestFactory.create(AppModule);
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document);

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
