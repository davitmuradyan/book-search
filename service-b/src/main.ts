import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main');

  // Create hybrid application (HTTP + Microservice)
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('Search Logs Service')
    .setDescription('Service for managing search operation logs')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Connect to RabbitMQ as microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI],
      queue: 'books_events_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  // Start microservice
  await app.startAllMicroservices();

  // Start HTTP server
  await app.listen(3200);
  logger.log('Service B is running on port 3200');
}
bootstrap();
