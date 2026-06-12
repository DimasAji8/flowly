#!/usr/bin/env bash
#
# Backup database Teman Kas (PostgreSQL).
# Policy (docs/deployment): 7 backup harian + 4 backup mingguan.
#
# Pemakaian:
#   ./backup-db.sh            # backup harian (default)
#   ./backup-db.sh weekly     # backup mingguan
#
# Jadwalkan via cron user "temankas", contoh:
#   # harian 02:00
#   0 2 * * *  /srv/apps/temankas/current/deploy/scripts/backup-db.sh daily
#   # mingguan Minggu 02:30
#   30 2 * * 0 /srv/apps/temankas/current/deploy/scripts/backup-db.sh weekly
#
# Catatan: backup harus juga disalin ke mesin lokal developer secara berkala
# (rsync/scp). Backup yang tidak pernah diuji-restore bukan backup.

set -euo pipefail

# --- Konfigurasi ---
DB_NAME="${TEMANKAS_DB_NAME:-temankas_prod}"
DB_USER="${TEMANKAS_DB_USER:-temankas_user}"
BACKUP_ROOT="${TEMANKAS_BACKUP_DIR:-/srv/apps/temankas/backups}"

KIND="${1:-daily}"   # daily | weekly

case "$KIND" in
  daily)
    DEST_DIR="$BACKUP_ROOT/daily"
    KEEP=7
    ;;
  weekly)
    DEST_DIR="$BACKUP_ROOT/weekly"
    KEEP=4
    ;;
  *)
    echo "Pemakaian: $0 [daily|weekly]" >&2
    exit 1
    ;;
esac

mkdir -p "$DEST_DIR"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUTFILE="$DEST_DIR/temankas-${KIND}-${TIMESTAMP}.sql.gz"

echo "[backup-db] Membuat backup $KIND: $OUTFILE"

# pg_dump; DATABASE_URL bisa juga dipakai bila di-set di env.
# Di sini pakai socket lokal sebagai user postgres-app dedicated.
pg_dump --no-owner --no-privileges "$DB_NAME" | gzip > "$OUTFILE"

echo "[backup-db] Selesai. Ukuran: $(du -h "$OUTFILE" | cut -f1)"

# --- Rotasi: simpan N terbaru, hapus sisanya ---
echo "[backup-db] Rotasi: menyimpan $KEEP file terbaru di $DEST_DIR"
ls -1t "$DEST_DIR"/temankas-${KIND}-*.sql.gz 2>/dev/null \
  | tail -n +"$((KEEP + 1))" \
  | xargs -r rm -v

echo "[backup-db] Done."
