import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for Stripe webhook signature verification
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Security headers
  app.use(helmet());

  // CORS
  const corsOriginEnv = process.env.CORS_ORIGIN;
  const allowedOrigins = corsOriginEnv
    ? corsOriginEnv.includes(',')
      ? corsOriginEnv.split(',').map((o) => o.trim())
      : corsOriginEnv === '*'
      ? true
      : corsOriginEnv
    : true;

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const appName = process.env.APP_NAME || 'Martial Arts Academy API';

  // Swagger / OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(
      'API para gerenciamento de academia de artes marciais — Jiu Jitsu e Muay Thai. ' +
      'Gerencia matrículas, planos, pagamentos via Stripe e autenticação JWT.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticação e registro')
    .addTag('Users', 'Gerenciamento de usuários')
    .addTag('Plans', 'Planos de treino')
    .addTag('Enrollments', 'Matrículas')
    .addTag('Payments', 'Pagamentos via Stripe')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🥊 ${appName} running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
