import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import express, { Express, Request, Response } from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';

const server: Express = express();

export const createServer = async (expressInstance: Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
    {
      rawBody: true,
    },
  );

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
  return app;
};

let cachedServer = false;

export default async function handler(req: Request, res: Response) {
  try {
    if (!cachedServer) {
      await createServer(server);
      cachedServer = true;
    }
    server(req, res);
  } catch (error: any) {
    console.error('Serverless Function Error:', error);
    res.status(500).json({
      success: false,
      message: 'Serverless initialization error',
      error: error?.message || String(error),
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
  }
}
