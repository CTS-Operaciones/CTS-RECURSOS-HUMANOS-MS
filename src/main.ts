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

  // const app = await NestFactory.create(AppModule);

  // app.use(morgan('dev'));

  // app.setGlobalPrefix('api');
  // app.enableCors(CORS_CONFIG);
  // app.enableVersioning();

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

  // const config = new DocumentBuilder()
  //   .setTitle('Recursos Humanos')
  //   .setDescription('The Recursos Humanos API - CTS')
  //   .setVersion('1.0')
  //   .addTag('Departments')
  //   .addTag('Positions')
  //   .addTag('Employees')
  //   .build();

  // const documentFactory = () => SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen();
  logger.log(
    `Recursos Humanos - Microservice running on port ${envs.PORT_APP}`,
  );
}
bootstrap();
