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

  // Swagger — aktif di semua environment (diproteksi Basic Auth via Nginx)
  const config = new DocumentBuilder()
    .setTitle('Teman Kas API — B2B Documentation')
    .setDescription(
      'Mobile-first cashflow journal. Multi-tenant via workspace.\n\n' +
        '**Cara akses API:**\n\n' +
        '**1. B2B (API Key) — untuk integrasi mobile/partner**\n' +
        'Jika kamu adalah developer eksternal, cukup kirim header:\n' +
        '> `X-API-Key: <api_key>`\n' +
        'Tidak perlu JWT / Workspace-ID. API Key akan otomatis di-rate limit.\n\n' +
        '**2. Standard (JWT) — untuk pengguna biasa**\n' +
        'Klik tombol "Authorize" di bawah → paste JWT (tanpa prefix `Bearer`).\n' +
        'Kirim header `X-Workspace-Id` dengan workspace id kamu.\n\n' +
        '---\n' +
        '_Dokumentasi ini untuk mitra pengembang. Akses diproteksi._',
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
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description:
          'API Key B2B — untuk akses tanpa JWT/Workspace-ID.\n' +
          'Cukup kirim header ini saja, tidak perlu Authorize JWT.',
      },
      'b2b-api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${API_PREFIX}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);

  console.log(`🚀 API running on http://localhost:${port}/${API_PREFIX}`);
  console.log(`📚 Docs at  http://localhost:${port}/${API_PREFIX}/docs`);
}
void bootstrap();
