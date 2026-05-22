import { ApiProperty } from '@nestjs/swagger';
import { RecurringFrequency, TransactionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRecurringDto {
  @ApiProperty({ enum: TransactionType, example: TransactionType.expense })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({ example: 50000 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(1_000_000_000_000)
  amount!: number;

  @ApiProperty()
  @IsString()
  categoryId!: string;

  @ApiProperty()
  @IsString()
  walletId!: string;

  @ApiProperty({ enum: RecurringFrequency })
  @IsEnum(RecurringFrequency)
  frequency!: RecurringFrequency;

  @ApiProperty({
    example: '2026-06-01',
    description: 'Tanggal pertama jadwal jalan (YYYY-MM-DD)',
  })
  @IsDateString()
  nextRunAt!: string;

  @ApiProperty({ example: 'Subscription Spotify', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  note?: string;

  @ApiProperty({ default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
