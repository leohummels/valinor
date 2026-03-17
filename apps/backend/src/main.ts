import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:4200');
  app.enableCors({
    origin: [frontendUrl],
    credentials: true,
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  logger.log(`ðŸš€ Server running on http://localhost:${port}`);
  logger.log(`ðŸ“Š GraphQL Playground: http://localhost:${port}/graphql`);
}

bootstrap();
