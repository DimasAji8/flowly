import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';

@Injectable()
export class TransfersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(workspaceId: string, year?: number, month?: number) {
    const where: Prisma.TransferWhereInput = { workspaceId };
    if (year && month) {
      where.transferDate = {
        gte: new Date(Date.UTC(year, month - 1, 1)),
        lt: new Date(Date.UTC(year, month, 1)),
      };
    }
    const transfers = await this.prisma.transfer.findMany({
      where,
      orderBy: [{ transferDate: 'desc' }, { createdAt: 'desc' }],
      include: {
        fromWallet: { select: { id: true, name: true } },
        toWallet: { select: { id: true, name: true } },
      },
    });
    return transfers.map((t) => this.serialize(t));
  }

  async create(workspaceId: string, userId: string, dto: CreateTransferDto) {
    if (dto.fromWalletId === dto.toWalletId) {
      throw new BadRequestException('Wallet asal dan tujuan tidak boleh sama');
    }

    const [from, to] = await Promise.all([
      this.prisma.wallet.findFirst({
        where: { id: dto.fromWalletId, workspaceId },
        select: { id: true, name: true, balance: true },
      }),
      this.prisma.wallet.findFirst({
        where: { id: dto.toWalletId, workspaceId },
        select: { id: true, name: true },
      }),
    ]);
    if (!from) throw new BadRequestException('Wallet asal tidak ditemukan');
    if (!to) throw new BadRequestException('Wallet tujuan tidak ditemukan');

    const amount = new Prisma.Decimal(dto.amount);
    const fee = new Prisma.Decimal(dto.fee || 0);
    const totalDeduction = amount.add(fee);

    if (from.balance.lessThan(totalDeduction)) {
      throw new BadRequestException('Saldo tidak cukup (termasuk biaya admin)');
    }

    const transfer = await this.prisma.$transaction(async (tx) => {
      const created = await tx.transfer.create({
        data: {
          workspaceId,
          fromWalletId: dto.fromWalletId,
          toWalletId: dto.toWalletId,
          amount,
          fee,
          note: dto.note,
          transferDate: new Date(dto.transferDate),
        },
        include: {
          fromWallet: { select: { id: true, name: true } },
          toWallet: { select: { id: true, name: true } },
        },
      });

      // Update balances
      await tx.wallet.update({
        where: { id: dto.fromWalletId },
        data: { balance: { decrement: totalDeduction } },
      });
      await tx.wallet.update({
        where: { id: dto.toWalletId },
        data: { balance: { increment: amount } },
      });

      // Jika ada biaya admin, buat otomatis transaksi pengeluaran
      if (fee.greaterThan(0)) {
        let category = await tx.category.findFirst({
          where: {
            workspaceId,
            type: 'expense',
            OR: [
              { name: { contains: 'Admin', mode: 'insensitive' } },
              { name: { contains: 'Transfer', mode: 'insensitive' } },
              { name: 'Lainnya' },
            ],
          },
        });

        if (!category) {
          category = await tx.category.create({
            data: {
              workspaceId,
              name: 'Lainnya',
              type: 'expense',
              color: '#4B5563',
              icon: '📦',
              group: 'wants',
            },
          });
        }

        await tx.transaction.create({
          data: {
            workspaceId,
            walletId: dto.fromWalletId,
            categoryId: category.id,
            userId,
            type: 'expense',
            amount: fee,
            note: `Biaya transfer ke ${to.name}${dto.note ? ` (${dto.note})` : ''}`,
            transactionDate: new Date(dto.transferDate),
          },
        });
      }

      return created;
    });

    return this.serialize(transfer);
  }

  async remove(workspaceId: string, id: string) {
    const transfer = await this.prisma.transfer.findFirst({
      where: { id, workspaceId },
      include: {
        toWallet: { select: { name: true } },
      },
    });
    if (!transfer) throw new NotFoundException('Transfer tidak ditemukan');

    await this.prisma.$transaction(async (tx) => {
      const totalRefund = transfer.amount.add(transfer.fee);

      // Kembalikan saldo
      await tx.wallet.update({
        where: { id: transfer.fromWalletId },
        data: { balance: { increment: totalRefund } },
      });
      await tx.wallet.update({
        where: { id: transfer.toWalletId },
        data: { balance: { decrement: transfer.amount } },
      });

      // Hapus transaksi otomatis biaya admin jika ada
      if (transfer.fee.greaterThan(0)) {
        const toWalletName = transfer.toWallet.name;
        const adminTx = await tx.transaction.findFirst({
          where: {
            workspaceId,
            walletId: transfer.fromWalletId,
            amount: transfer.fee,
            type: 'expense',
            transactionDate: transfer.transferDate,
            note: {
              startsWith: `Biaya transfer ke ${toWalletName}`,
            },
          },
        });
        if (adminTx) {
          await tx.transaction.delete({ where: { id: adminTx.id } });
        }
      }

      await tx.transfer.delete({ where: { id } });
    });
  }

  private serialize(t: {
    id: string;
    workspaceId: string;
    fromWalletId: string;
    toWalletId: string;
    amount: Prisma.Decimal;
    fee: Prisma.Decimal;
    note: string | null;
    transferDate: Date;
    createdAt: Date;
    fromWallet: { id: string; name: string };
    toWallet: { id: string; name: string };
  }) {
    return {
      id: t.id,
      workspaceId: t.workspaceId,
      fromWalletId: t.fromWalletId,
      toWalletId: t.toWalletId,
      fromWalletName: t.fromWallet.name,
      toWalletName: t.toWallet.name,
      amount: t.amount.toString(),
      fee: t.fee.toString(),
      note: t.note,
      transferDate: t.transferDate.toISOString().slice(0, 10),
      createdAt: t.createdAt.toISOString(),
    };
  }
}
