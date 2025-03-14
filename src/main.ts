import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
  await app.listen(3000);
}
bootstrap();
