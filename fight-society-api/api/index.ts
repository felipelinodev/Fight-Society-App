import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express, Request, Response } from 'express';
import { AppModule } from '../src/app.module';

let cachedHandler: ((req: Request, res: Response) => void) | null = null;

async function bootstrap(): Promise<(req: Request, res: Response) => void> {
  const expressApp: Express = express();
  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter, {
    rawBody: true,
  });

  app.setGlobalPrefix('api');

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

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

  const config = new DocumentBuilder()
    .setTitle(appName)
    .setDescription(
      'API para gerenciamento de academia de artes marciais — Jiu Jitsu e Muay Thai.',
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

  await app.init();
  return expressApp;
}

export default async function handler(req: Request, res: Response) {
  try {
    if (!cachedHandler) {
      cachedHandler = await bootstrap();
    }
    return cachedHandler(req, res);
  } catch (error: any) {
    console.error('Serverless Initialization Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Serverless initialization error',
      error: error?.message || String(error),
    });
  }
}
