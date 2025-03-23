import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Eureka Learn API')
    .setDescription('The Eureka Learn API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, document, {
    customSiteTitle: 'Eureka Learn API Documentation',
    customCssUrl: '/swagger-ui.css',
    customJs: [
      '/swagger-ui-bundle.js',
      '/swagger-ui-standalone-preset.js'
    ]
  });

  await app.listen(process.env.PORT || 3002);
}
bootstrap();
