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

  // ──────────────────────────────────────────────
  // Swagger — B2B (untuk mitra developer mobile)
  // ──────────────────────────────────────────────
  const b2bConfig = new DocumentBuilder()
    .setTitle('Teman Kas API — B2B Documentation')
    .setDescription(
      'Mobile-first cashflow journal.\n\n' +
        '**Cara akses:**\n' +
        'Cukup kirim header di setiap request:\n' +
        '> `X-API-Key: <api_key>`\n\n' +
        'Tidak perlu JWT / Workspace-ID.\n\n' +
        '---\n' +
        '_Dokumentasi ini khusus untuk mitra pengembang._',
    )
    .setVersion('1.0')
    .setContact('Teman Kas', 'https://temankas.com', 'api@temankas.com')
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description:
          'API Key B2B — satu-satunya yang dibutuhkan.\n' +
          'Cukup kirim header ini, authorize saja.',
      },
      'b2b-api-key',
    )
    .addSecurityRequirements('b2b-api-key')
    .build();

  const b2bDocument = SwaggerModule.createDocument(app, b2bConfig);

  // Hapus security per-endpoint (dari decorator controller) dan ganti pake b2b-api-key
  for (const path of Object.keys(b2bDocument.paths)) {
    const methods = b2bDocument.paths[path] as Record<string, unknown>;
    for (const method of Object.keys(methods)) {
      (methods[method] as Record<string, unknown>).security = [{ 'b2b-api-key': [] }];
    }
  }

  SwaggerModule.setup(`${API_PREFIX}/docs`, app, b2bDocument, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ──────────────────────────────────────────────
  // Swagger — Internal (untuk developer tim sendiri)
  // ──────────────────────────────────────────────
  const internalConfig = new DocumentBuilder()
    .setTitle('Teman Kas API — Internal Documentation')
    .setDescription(
      '**Untuk developer internal tim Teman Kas.**\n\n' +
        '**Auth:** klik "Authorize" → paste JWT (tanpa prefix `Bearer`).\n' +
        '**Workspace-scoped endpoint:** isi `X-Workspace-Id`.\n\n' +
        '---\n' +
        '_Akses dibatasi untuk internal._',
    )
    .setVersion('1.0')
    .setContact('Teman Kas', 'https://temankas.com', 'api@temankas.com')
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

  const internalDocument = SwaggerModule.createDocument(app, internalConfig);
  SwaggerModule.setup(`${API_PREFIX}/docs/internal`, app, internalDocument, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port);

  console.log(`🚀 API running on http://localhost:${port}/${API_PREFIX}`);
  console.log(`📚 Docs at  http://localhost:${port}/${API_PREFIX}/docs`);
}
void bootstrap();
