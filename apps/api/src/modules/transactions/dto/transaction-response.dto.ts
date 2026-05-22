import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

class CategoryRef {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ example: '#15803D' }) color!: string;
}

class WalletRef {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
}

export class TransactionResponse {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: TransactionType }) type!: TransactionType;
  @ApiProperty({ example: '25000' }) amount!: string;
  @ApiProperty() categoryId!: string;
  @ApiProperty() walletId!: string;
  @ApiProperty() userId!: string;
  @ApiProperty({ nullable: true, type: String }) note!: string | null;
  @ApiProperty({ example: '2026-05-22' }) transactionDate!: string;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
  @ApiProperty({ type: CategoryRef }) category!: CategoryRef;
  @ApiProperty({ type: WalletRef }) wallet!: WalletRef;
}

class PaginationMeta {
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 20 }) limit!: number;
  @ApiProperty({ example: 5 }) total!: number;
}

export class TransactionListResponse {
  @ApiProperty({ type: TransactionResponse, isArray: true })
  data!: TransactionResponse[];

  @ApiProperty({ type: PaginationMeta })
  meta!: PaginationMeta;
}

export class MonthlySummaryResponse {
  @ApiProperty({ example: { year: 2026, month: 5 } })
  period!: { year: number; month: number };

  @ApiProperty({ example: '5000000' })
  income!: string;

  @ApiProperty({ example: '1234500' })
  expense!: string;

  @ApiProperty({ example: '3765500' })
  net!: string;
}
