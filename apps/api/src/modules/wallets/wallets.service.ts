import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { serializeWallet, SerializedWallet } from './wallets.serializer';

@Injectable()
export class WalletsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(workspaceId: string): Promise<SerializedWallet[]> {
    const wallets = await this.prisma.wallet.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });
    return wallets.map(serializeWallet);
  }

  async findById(workspaceId: string, id: string): Promise<SerializedWallet> {
    const wallet = await this.prisma.wallet.findFirst({
      where: { id, workspaceId },
    });
    if (!wallet) throw new NotFoundException('Dompet tidak ditemukan');
    return serializeWallet(wallet);
  }

  async create(
    workspaceId: string,
    dto: CreateWalletDto,
  ): Promise<SerializedWallet> {
    const wallet = await this.prisma.wallet.create({
      data: {
        workspaceId,
        name: dto.name,
        type: dto.type,
        balance: new Prisma.Decimal(dto.balance ?? 0),
      },
    });
    return serializeWallet(wallet);
  }

  async update(
    workspaceId: string,
    id: string,
    dto: UpdateWalletDto,
  ): Promise<SerializedWallet> {
    // Pastikan wallet ada di workspace ini
    await this.findById(workspaceId, id);

    const updated = await this.prisma.wallet.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
      },
    });
    return serializeWallet(updated);
  }

  async remove(workspaceId: string, id: string): Promise<void> {
    await this.findById(workspaceId, id);
    try {
      await this.prisma.wallet.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2003'
      ) {
        // Foreign key constraint: ada transaction/recurring yang masih refer wallet ini
        throw new ConflictException(
          'Dompet masih memiliki transaksi. Hapus atau pindahkan transaksi terlebih dahulu.',
        );
      }
      throw e;
    }
  }

  async adjustBalance(
    workspaceId: string,
    id: string,
    userId: string,
    dto: { balance: number },
  ): Promise<SerializedWallet> {
    // 1. Ambil data wallet saat ini
    const wallet = await this.prisma.wallet.findFirst({
      where: { id, workspaceId },
    });
    if (!wallet) throw new NotFoundException('Dompet tidak ditemukan');

    const oldBalance = wallet.balance;
    const newBalance = new Prisma.Decimal(dto.balance);
    const diff = newBalance.minus(oldBalance);

    // Jika tidak ada perubahan, langsung kembalikan dompet
    if (diff.isZero()) {
      return serializeWallet(wallet);
    }

    const isIncome = diff.greaterThan(0);
    const type = isIncome ? 'income' : 'expense';

    // 2. Cari atau buat kategori sistem untuk penyesuaian/koreksi saldo
    let category = await this.prisma.category.findFirst({
      where: { workspaceId, name: 'Koreksi Saldo', type },
    });

    if (!category) {
      category = await this.prisma.category.create({
        data: {
          workspaceId,
          name: 'Koreksi Saldo',
          type,
          color: '#6E6E73',
          icon: '⚖️',
          group: type === 'expense' ? 'wants' : null,
        },
      });
    } else if (category.icon === '⚙️') {
      category = await this.prisma.category.update({
        where: { id: category.id },
        data: { icon: '⚖️' },
      });
    }

    // 3. Buat transaksi koreksi & update saldo wallet dalam transaksi database atomik
    const updatedWallet = await this.prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          workspaceId,
          walletId: id,
          categoryId: category.id,
          userId,
          type,
          amount: diff.abs(),
          note: `Koreksi Saldo: ${wallet.name}`,
          transactionDate: new Date(),
        },
      });

      return tx.wallet.update({
        where: { id },
        data: { balance: newBalance },
      });
    });

    return serializeWallet(updatedWallet);
  }
}
