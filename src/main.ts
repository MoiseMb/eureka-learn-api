import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Eureka-Learn API')
    .setDescription('Documentation API of Eureka-Learn')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('https://eureka-learn-api.vercel.app', 'Production')
    .addServer('http://localhost:3002', 'Local environment')
    .build();

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
