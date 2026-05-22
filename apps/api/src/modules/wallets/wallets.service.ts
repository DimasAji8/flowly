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
    if (!wallet) throw new NotFoundException('Wallet not found');
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
      data: { name: dto.name },
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
          'Wallet still has transactions. Delete or move them first.',
        );
      }
      throw e;
    }
  }
}
