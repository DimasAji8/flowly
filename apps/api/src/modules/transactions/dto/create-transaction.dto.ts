import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, example: TransactionType.expense })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({
    example: 25000,
    description: 'Jumlah (positive number, max 2 decimal)',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(1_000_000_000_000)
  amount!: number;

  @ApiProperty({ example: 'cmpgcxxxxxxxxxxxxxxxxxxxx' })
  @IsString()
  categoryId!: string;

  @ApiProperty({ example: 'cmpgwxxxxxxxxxxxxxxxxxxxx' })
  @IsString()
  walletId!: string;

  @ApiProperty({ example: 'Lunch with team', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  note?: string;

  @ApiProperty({
    example: '2026-05-22',
    description: 'Tanggal transaksi (YYYY-MM-DD)',
  })
  @IsDateString()
  transactionDate!: string;
}
