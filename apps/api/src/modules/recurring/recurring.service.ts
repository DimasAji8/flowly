import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { UpdateRecurringDto } from './dto/update-recurring.dto';
import {
  serializeRecurring,
  SerializedRecurring,
} from './recurring.serializer';
import { computeNextRunAt } from './recurring.utils';

@Injectable()
export class RecurringService {
  private readonly logger = new Logger(RecurringService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(
    workspaceId: string,
    query: import('./dto/list-recurring.query').ListRecurringQuery = {},
  ): Promise<SerializedRecurring[]> {
    const where: Prisma.RecurringTransactionWhereInput = { workspaceId };
    if (query.type !== undefined) where.type = query.type;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const items = await this.prisma.recurringTransaction.findMany({
      where,
      orderBy: { nextRunAt: 'asc' },
    });
    return items.map(serializeRecurring);
  }

  async findById(workspaceId: string, id: string) {
    const r = await this.prisma.recurringTransaction.findFirst({
      where: { id, workspaceId },
    });
    if (!r) throw new NotFoundException('Recurring tidak ditemukan');
    return serializeRecurring(r);
  }

  async create(workspaceId: string, dto: CreateRecurringDto) {
    await this.assertRefs(workspaceId, dto);

    const created = await this.prisma.recurringTransaction.create({
      data: {
        workspaceId,
        type: dto.type,
        amount: new Prisma.Decimal(dto.amount),
        categoryId: dto.categoryId,
        walletId: dto.walletId,
        frequency: dto.frequency,
        note: dto.note,
        nextRunAt: new Date(dto.nextRunAt),
        isActive: dto.isActive ?? true,
      },
    });

    // Jalankan check job segera agar jika tanggal mulai adalah hari ini / masa lalu,
    // transaksi langsung terbentuk dan tanggal berikutnya bergeser maju.
    try {
      await this.runDueJobs();
    } catch (e) {
      this.logger.error(
        `Gagal menjalankan due jobs saat pembuatan recurring: ${(e as Error).message}`,
      );
    }

    // Ambil data terbaru dari DB setelah proses due jobs di atas
    const latest = await this.prisma.recurringTransaction.findUnique({
      where: { id: created.id },
    });

    return serializeRecurring(latest || created);
  }

  async update(workspaceId: string, id: string, dto: UpdateRecurringDto) {
    const existing = await this.prisma.recurringTransaction.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) throw new NotFoundException('Recurring tidak ditemukan');

    if (dto.categoryId || dto.walletId || dto.type) {
      await this.assertRefs(workspaceId, {
        categoryId: dto.categoryId ?? existing.categoryId,
        walletId: dto.walletId ?? existing.walletId,
        type: dto.type ?? existing.type,
      });
    }

    const updated = await this.prisma.recurringTransaction.update({
      where: { id },
      data: {
        ...(dto.type !== undefined ? { type: dto.type } : {}),
        ...(dto.amount !== undefined
          ? { amount: new Prisma.Decimal(dto.amount) }
          : {}),
        ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
        ...(dto.walletId !== undefined ? { walletId: dto.walletId } : {}),
        ...(dto.frequency !== undefined ? { frequency: dto.frequency } : {}),
        ...(dto.note !== undefined ? { note: dto.note } : {}),
        ...(dto.nextRunAt !== undefined
          ? { nextRunAt: new Date(dto.nextRunAt) }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });

    // Jalankan check job segera agar jika ada perubahan tanggal/status aktif yang due langsung dieksekusi
    try {
      await this.runDueJobs();
    } catch (e) {
      this.logger.error(
        `Gagal menjalankan due jobs setelah update recurring: ${(e as Error).message}`,
      );
    }

    // Ambil data terbaru dari DB setelah proses due jobs di atas
    const latest = await this.prisma.recurringTransaction.findUnique({
      where: { id: updated.id },
    });

    return serializeRecurring(latest || updated);
  }

  async remove(workspaceId: string, id: string): Promise<void> {
    const existing = await this.prisma.recurringTransaction.findFirst({
      where: { id, workspaceId },
    });
    if (!existing) throw new NotFoundException('Recurring tidak ditemukan');
    await this.prisma.recurringTransaction.delete({ where: { id } });
  }

  // =========================================================
  // Job runner — dipanggil oleh scheduler / manual trigger
  // =========================================================

  /**
   * Proses semua recurring yang sudah due (nextRunAt <= now & isActive).
   * Idempotent: kalau gagal di tengah, retry next-run akan tetap aman karena
   * pengecekan due berbasis timestamp.
   */
  async runDueJobs(now: Date = new Date()): Promise<{
    processed: number;
    generated: number;
  }> {
    const due = await this.prisma.recurringTransaction.findMany({
      where: {
        isActive: true,
        nextRunAt: { lte: now },
      },
    });

    let generated = 0;
    for (const r of due) {
      try {
        await this.processOne(r, now);
        generated++;
      } catch (e) {
        this.logger.error(
          `Failed to process recurring ${r.id}: ${(e as Error).message}`,
          e instanceof Error ? e.stack : undefined,
        );
      }
    }

    if (due.length > 0) {
      this.logger.log(
        `Recurring job: ${generated}/${due.length} processed at ${now.toISOString()}`,
      );
    }

    return { processed: due.length, generated };
  }

  /**
   * Proses 1 recurring → buat transaction + update nextRunAt + update wallet
   * dalam 1 transaksi DB atomik.
   *
   * Kalau ada catch-up (mis. server mati 3 hari, recurring daily tertinggal 3
   * eksekusi), kita hanya generate 1 untuk hari ini & advance nextRunAt sampai
   * lewat now. Ini menghindari double-charging massal.
   */
  private async processOne(
    r: Awaited<
      ReturnType<typeof this.prisma.recurringTransaction.findFirst>
    > & {},
    now: Date,
  ) {
    await this.prisma.$transaction(async (tx) => {
      // Buat 1 transaction baru ber-tanggal nextRunAt (tanggal yang dijadwalkan).
      await tx.transaction.create({
        data: {
          workspaceId: r.workspaceId,
          // userId: pakai owner workspace (lihat catatan)
          userId: await this.resolveOwnerUserId(tx, r.workspaceId),
          type: r.type,
          amount: r.amount,
          categoryId: r.categoryId,
          walletId: r.walletId,
          note: r.note,
          transactionDate: r.nextRunAt,
        },
      });

      // Update wallet balance
      const sign = r.type === TransactionType.income ? 1 : -1;
      const delta = r.amount.mul(sign);
      await tx.wallet.update({
        where: { id: r.walletId },
        data: { balance: { increment: delta } },
      });

      // Advance nextRunAt sampai > now
      let next = computeNextRunAt(r.nextRunAt, r.frequency);
      while (next <= now) {
        next = computeNextRunAt(next, r.frequency);
      }
      await tx.recurringTransaction.update({
        where: { id: r.id },
        data: { nextRunAt: next },
      });
    });
  }

  private async resolveOwnerUserId(
    tx: Prisma.TransactionClient,
    workspaceId: string,
  ): Promise<string> {
    const ws = await tx.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });
    if (!ws) throw new Error('Workspace not found for recurring job');
    return ws.ownerId;
  }

  // =========================================================
  // helpers
  // =========================================================

  private async assertRefs(
    workspaceId: string,
    payload: { categoryId: string; walletId: string; type: TransactionType },
  ) {
    const [category, wallet] = await Promise.all([
      this.prisma.category.findFirst({
        where: { id: payload.categoryId, workspaceId },
        select: { id: true, type: true },
      }),
      this.prisma.wallet.findFirst({
        where: { id: payload.walletId, workspaceId },
        select: { id: true },
      }),
    ]);
    if (!category) {
      throw new BadRequestException('Kategori tidak ditemukan');
    }
    if (!wallet) {
      throw new BadRequestException('Dompet tidak ditemukan');
    }
    if (category.type !== payload.type) {
      throw new BadRequestException(
        'Jenis kategori tidak sesuai dengan jenis recurring',
      );
    }
  }
}
