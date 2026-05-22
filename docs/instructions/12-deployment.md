# 12 — VPS Deployment

Deployment dilakukan di VPS (single server boleh, atau dipisah frontend/backend).

## Frontend (Next.js)

### Steps

1. Build production: `npm run build`
2. Jalankan dengan **PM2**: `pm2 start npm --name flowly-frontend -- start`
3. Reverse proxy via **Nginx** ke port Next.js (default 3000).

### Nginx Example (sketsa)

```nginx
server {
    listen 80;
    server_name app.flowly.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Backend (NestJS)

### Steps

1. Build production: `npm run build`
2. Jalankan dengan **PM2**: `pm2 start dist/main.js --name flowly-backend`
3. Reverse proxy via **Nginx** ke port NestJS (default 3001 atau sesuai env).

### Nginx Example (sketsa)

```nginx
server {
    listen 80;
    server_name api.flowly.example.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Database

- PostgreSQL di VPS (atau managed DB jika tersedia).
- Backup harian disarankan (cron + `pg_dump`).
- Akses database **tidak** boleh terbuka public — bind `127.0.0.1` atau gunakan firewall.

## SSL

- **Certbot** + **Let's Encrypt** untuk HTTPS.
- Auto-renew via cron (`certbot renew`).

## Environment Variables

Frontend (`.env.production`):

```txt
NEXT_PUBLIC_API_URL=https://api.flowly.example.com
```

Backend (`.env`):

```txt
DATABASE_URL=postgresql://user:pass@127.0.0.1:5432/flowly
JWT_SECRET=...
JWT_REFRESH_SECRET=...
PORT=3001
```

## Checklist Deploy

- [ ] Build frontend & backend tanpa error
- [ ] Migrasi Prisma sudah dijalankan (`prisma migrate deploy`)
- [ ] PM2 boot config disimpan (`pm2 save && pm2 startup`)
- [ ] Nginx config valid (`nginx -t`)
- [ ] SSL certificate aktif & auto-renew
- [ ] Firewall (ufw) hanya buka port 80, 443, 22
- [ ] Backup database terjadwal
