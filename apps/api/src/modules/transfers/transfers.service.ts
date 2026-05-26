import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    return transfers.map(this.serialize);
  }

  async create(workspaceId: string, dto: CreateTransferDto) {
    if (dto.fromWalletId === dto.toWalletId) {
      throw new BadRequestException('Wallet asal dan tujuan tidak boleh sama');
    }

    const [from, to] = await Promise.all([
      this.prisma.wallet.findFirst({ where: { id: dto.fromWalletId, workspaceId }, select: { id: true, name: true, balance: true } }),
      this.prisma.wallet.findFirst({ where: { id: dto.toWalletId, workspaceId }, select: { id: true, name: true } }),
    ]);
    if (!from) throw new BadRequestException('Wallet asal tidak ditemukan');
    if (!to) throw new BadRequestException('Wallet tujuan tidak ditemukan');

    const amount = new Prisma.Decimal(dto.amount);

    if (from.balance.lessThan(amount)) {
      throw new BadRequestException('Saldo tidak cukup');
    }

    const transfer = await this.prisma.$transaction(async (tx) => {
      const created = await tx.transfer.create({
        data: {
          workspaceId,
          fromWalletId: dto.fromWalletId,
          toWalletId: dto.toWalletId,
          amount,
          note: dto.note,
          transferDate: new Date(dto.transferDate),
        },
        include: {
          fromWallet: { select: { id: true, name: true } },
          toWallet: { select: { id: true, name: true } },
        },
      });
      await tx.wallet.update({ where: { id: dto.fromWalletId }, data: { balance: { decrement: amount } } });
      await tx.wallet.update({ where: { id: dto.toWalletId }, data: { balance: { increment: amount } } });
      return created;
    });

    return this.serialize(transfer);
  }

  async remove(workspaceId: string, id: string) {
    const transfer = await this.prisma.transfer.findFirst({ where: { id, workspaceId } });
    if (!transfer) throw new NotFoundException('Transfer tidak ditemukan');

    await this.prisma.$transaction(async (tx) => {
      await tx.wallet.update({ where: { id: transfer.fromWalletId }, data: { balance: { increment: transfer.amount } } });
      await tx.wallet.update({ where: { id: transfer.toWalletId }, data: { balance: { decrement: transfer.amount } } });
      await tx.transfer.delete({ where: { id } });
    });
  }

  private serialize(t: {
    id: string; workspaceId: string; fromWalletId: string; toWalletId: string;
    amount: Prisma.Decimal; note: string | null; transferDate: Date; createdAt: Date;
    fromWallet: { id: string; name: string }; toWallet: { id: string; name: string };
  }) {
    return {
      id: t.id,
      workspaceId: t.workspaceId,
      fromWalletId: t.fromWalletId,
      toWalletId: t.toWalletId,
      fromWalletName: t.fromWallet.name,
      toWalletName: t.toWallet.name,
      amount: t.amount.toString(),
      note: t.note,
      transferDate: t.transferDate.toISOString().slice(0, 10),
      createdAt: t.createdAt.toISOString(),
    };
  }
}
