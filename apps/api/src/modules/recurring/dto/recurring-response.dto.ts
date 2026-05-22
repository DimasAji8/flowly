import { ApiProperty } from '@nestjs/swagger';
import { RecurringFrequency, TransactionType } from '@prisma/client';

export class RecurringResponse {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: TransactionType }) type!: TransactionType;
  @ApiProperty({ example: '50000' }) amount!: string;
  @ApiProperty() categoryId!: string;
  @ApiProperty() walletId!: string;
  @ApiProperty({ enum: RecurringFrequency }) frequency!: RecurringFrequency;
  @ApiProperty({ nullable: true, type: String }) note!: string | null;
  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' }) nextRunAt!: string;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() createdAt!: string;
}
