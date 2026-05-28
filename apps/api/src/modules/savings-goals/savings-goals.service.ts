import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';
import {
  serializeSavingsGoal,
  SerializedSavingsGoal,
} from './savings-goals.serializer';

@Injectable()
export class SavingsGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(workspaceId: string): Promise<SerializedSavingsGoal[]> {
    const items = await this.prisma.savingsGoal.findMany({
      where: { workspaceId },
      orderBy: [{ targetDate: 'asc' }, { createdAt: 'asc' }],
    });
    return items.map(serializeSavingsGoal);
  }

  async findById(
    workspaceId: string,
    id: string,
  ): Promise<SerializedSavingsGoal> {
    const item = await this.prisma.savingsGoal.findFirst({
      where: { id, workspaceId },
    });
    if (!item) throw new NotFoundException('Target tabungan tidak ditemukan');
    return serializeSavingsGoal(item);
  }

  async create(
    workspaceId: string,
    dto: CreateSavingsGoalDto,
  ): Promise<SerializedSavingsGoal> {
    await this.assertLinkedWallet(workspaceId, dto.linkedWalletId);

    const created = await this.prisma.savingsGoal.create({
      data: {
        workspaceId,
        linkedWalletId: dto.linkedWalletId ?? null,
        name: dto.name,
        targetAmount: new Prisma.Decimal(dto.targetAmount),
        currentAmount: new Prisma.Decimal(dto.currentAmount ?? 0),
        targetDate: new Date(dto.targetDate),
        note: dto.note,
      },
    });
    return serializeSavingsGoal(created);
  }

  async update(
    workspaceId: string,
    id: string,
    dto: UpdateSavingsGoalDto,
  ): Promise<SerializedSavingsGoal> {
    await this.findById(workspaceId, id);
    await this.assertLinkedWallet(workspaceId, dto.linkedWalletId);

    const updated = await this.prisma.savingsGoal.update({
      where: { id },
      data: {
        ...(dto.linkedWalletId !== undefined
          ? { linkedWalletId: dto.linkedWalletId || null }
          : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.targetAmount !== undefined
          ? { targetAmount: new Prisma.Decimal(dto.targetAmount) }
          : {}),
        ...(dto.currentAmount !== undefined
          ? { currentAmount: new Prisma.Decimal(dto.currentAmount) }
          : {}),
        ...(dto.targetDate !== undefined
          ? { targetDate: new Date(dto.targetDate) }
          : {}),
        ...(dto.note !== undefined ? { note: dto.note } : {}),
      },
    });
    return serializeSavingsGoal(updated);
  }

  async remove(workspaceId: string, id: string): Promise<void> {
    await this.findById(workspaceId, id);
    await this.prisma.savingsGoal.delete({ where: { id } });
  }

  private async assertLinkedWallet(
    workspaceId: string,
    linkedWalletId?: string | null,
  ): Promise<void> {
    if (!linkedWalletId) return;
    const wallet = await this.prisma.wallet.findFirst({
      where: { id: linkedWalletId, workspaceId },
      select: { id: true },
    });
    if (!wallet) {
      throw new BadRequestException('Dompet terkait tidak ditemukan');
    }
  }
}