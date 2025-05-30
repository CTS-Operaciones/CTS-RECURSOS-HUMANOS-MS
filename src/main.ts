import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { envs } from './common';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Recursos Humanos - Main');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: { servers: envs.NATS_SERVERS },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen();
  logger.log(
    `Recursos Humanos - Microservice running on port ${envs.PORT_APP}`,
  );
}
bootstrap();
