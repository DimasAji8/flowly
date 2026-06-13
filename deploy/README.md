# Deployment — Teman Kas

Artefak & runbook untuk men-deploy Teman Kas ke VPS tunggal.
Arsitektur target: **Nginx + systemd + PostgreSQL + GitHub Actions** (tanpa Docker/K8s/PM2).
Spesifikasi lengkap: `docs/deployment/90-deployment.md`.

```
deploy/
├── systemd/
│   ├── temankas-web.service   # service frontend (port 4000)
│   └── temankas-api.service   # service backend  (port 3333)
├── nginx/
│   ├── temankas.conf          # temankas.com + www  -> 4000
│   └── api.temankas.conf      # api.temankas.com     -> 3333
└── scripts/
    └── backup-db.sh           # backup harian/mingguan PostgreSQL
.github/workflows/deploy.yml   # CI/CD otomatis (self-hosted runner)
```

---

## Ringkasan pembagian kerja

| Bagian | Otomatis (GitHub Actions) | Manual (sekali setup) |
|--------|:--:|:--:|
| Build, lint, migrate, restart, healthcheck | ✅ | |
| Provisioning server (user, node, postgres, nginx) | | ✅ |
| DNS + SSL (Certbot) | | ✅ |
| Daftar self-hosted runner | | ✅ |
| Isi GitHub Secrets | | ✅ |

Setelah setup manual sekali selesai, deploy berikutnya cukup **push ke `main`**.

---

## 1. Persiapan DNS

Arahkan record berikut ke IP VPS:

```
temankas.com         A   <IP_VPS>
www.temankas.com     A   <IP_VPS>
api.temankas.com     A   <IP_VPS>
```

---

## 2. Provisioning VPS (sebagai root / sudo)

Diasumsikan Ubuntu/Debian.

```bash
# Update + tooling dasar
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git rsync nginx postgresql ufw

# Node.js 20 LTS (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Firewall: izinkan SSH + HTTP + HTTPS saja
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### User aplikasi (non-root, dedicated per app)

```bash
sudo useradd --system --create-home --shell /bin/bash temankas
sudo mkdir -p /srv/apps/temankas/current /srv/apps/temankas/build /srv/apps/temankas/backups
# devalexis (runner) pemilik folder → bisa rsync/build
# temankas (service) diberi akses baca via group atau ACL
sudo chown -R devalexis:devalexis /srv/apps/temankas
sudo chmod -R o+rX /srv/apps/temankas
```

> Tiap aplikasi punya user sendiri (mis. app lain pakai user lain). Ini sengaja —
> untuk isolasi. Lihat `docs/deployment/91-server-standards.md`.

---

## 3. Database PostgreSQL

```bash
sudo -u postgres psql <<'SQL'
CREATE DATABASE temankas_prod;
CREATE USER temankas_user WITH ENCRYPTED PASSWORD 'GANTI_PASSWORD_KUAT';
GRANT ALL PRIVILEGES ON DATABASE temankas_prod TO temankas_user;
-- Prisma butuh akses schema public:
\c temankas_prod
GRANT ALL ON SCHEMA public TO temankas_user;
SQL
```

`DATABASE_URL` produksi:
```
postgresql://temankas_user:GANTI_PASSWORD_KUAT@localhost:5432/temankas_prod?schema=public
```

---

## 4. systemd services

```bash
sudo cp /srv/apps/temankas/current/deploy/systemd/temankas-web.service /etc/systemd/system/
sudo cp /srv/apps/temankas/current/deploy/systemd/temankas-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable temankas-web temankas-api
# Start dilakukan otomatis oleh workflow; manual jika perlu:
# sudo systemctl start temankas-api temankas-web
```

> Catatan: workflow memanggil `sudo systemctl restart ...` tanpa password.
> Beri user runner izin sudo terbatas, contoh di `/etc/sudoers.d/temankas`:
> ```
> <user-runner> ALL=(root) NOPASSWD: /bin/systemctl restart temankas-web.service, /bin/systemctl restart temankas-api.service, /bin/systemctl restart temankas-web, /bin/systemctl restart temankas-api
> ```

---

## 5. Nginx + SSL

```bash
sudo cp /srv/apps/temankas/current/deploy/nginx/temankas.conf      /etc/nginx/sites-available/
sudo cp /srv/apps/temankas/current/deploy/nginx/api.temankas.conf  /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/temankas.conf     /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.temankas.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL (Certbot menambah blok 443 + auto-renew otomatis)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d temankas.com -d www.temankas.com
sudo certbot --nginx -d api.temankas.com
```

---

## 6. GitHub Actions self-hosted runner

Di GitHub: **Settings → Actions → Runners → New self-hosted runner**, ikuti
instruksinya di VPS. Saat konfigurasi, tambahkan **labels**:

```
self-hosted, linux, temankas-prod
```

Jalankan runner sebagai service:
```bash
sudo ./svc.sh install
sudo ./svc.sh start
```

---

## 7. GitHub Secrets

Di **Settings → Secrets and variables → Actions**, buat:

| Secret | Isi |
|--------|-----|
| `DATABASE_URL_PROD` | connection string PostgreSQL (lihat langkah 3) |
| `API_ENV_PROD` | isi `.env` API produksi (multi-line), mis. `DATABASE_URL=...`, `JWT_SECRET=...`, `JWT_REFRESH_SECRET=...`, `CORS_ORIGIN=https://temankas.com`, `JWT_EXPIRES_IN=15m`, `JWT_REFRESH_EXPIRES_IN=7d` |
| `WEB_ENV_PROD` | isi `.env` web produksi, mis. `NEXT_PUBLIC_API_URL=https://api.temankas.com/api/v1` |

> `NODE_ENV` & `PORT` sudah di-set otomatis oleh workflow, tidak perlu diulang.

---

## 8. Deploy pertama

```bash
git push origin main
```

Pantau di tab **Actions**. Deploy dianggap sukses hanya bila healthcheck
mengembalikan HTTP 200 untuk web (`:4000`) dan api (`:3333/api/v1`).

---

## Operasional

```bash
# Log
journalctl -u temankas-web -f
journalctl -u temankas-api -f

# Backup (jadwalkan via cron user temankas)
0  2 * * *  /srv/apps/temankas/current/deploy/scripts/backup-db.sh daily
30 2 * * 0  /srv/apps/temankas/current/deploy/scripts/backup-db.sh weekly
```

Restore backup (uji berkala!):
```bash
gunzip -c /srv/apps/temankas/backups/daily/temankas-daily-XXXX.sql.gz \
  | sudo -u postgres psql temankas_prod
```
