import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const API_PREFIX = 'api/v1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const corsOrigin = configService.get<string>(
    'CORS_ORIGIN',
    'http://localhost:3000',
  );
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
  });

  // Swagger — hanya saat non-production
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Flowly API')
      .setDescription(
        'Mobile-first cashflow journal. Multi-tenant via workspace.\n\n' +
          '**Auth:** klik tombol "Authorize" → paste JWT (tanpa prefix `Bearer`).\n\n' +
          '**Workspace-scoped endpoint:** isi field `X-Workspace-Id` di Authorize dengan workspace id.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token dari /auth/login atau /auth/register',
        },
        'access-token',
      )
      .addApiKey(
        {
          type: 'apiKey',
          in: 'header',
          name: 'X-Workspace-Id',
          description: 'Workspace id untuk endpoint per-workspace',
        },
        'workspace-id',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${API_PREFIX}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 API running on http://localhost:${port}/${API_PREFIX}`);
  if (nodeEnv !== 'production') {
    // eslint-disable-next-line no-console
    console.log(`📚 Docs at  http://localhost:${port}/${API_PREFIX}/docs`);
  }
}
bootstrap();
