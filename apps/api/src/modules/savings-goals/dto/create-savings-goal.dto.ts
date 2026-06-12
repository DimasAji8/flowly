import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSavingsGoalDto {
  @ApiProperty({ example: 'Dana darurat', minLength: 1, maxLength: 60 })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name!: string;

  @ApiProperty({ example: 12000000, description: 'Target nominal tabungan' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(1_000_000_000_000)
  targetAmount!: number;

  @ApiProperty({ example: 2500000, required: false, default: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1_000_000_000_000)
  currentAmount?: number;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  targetDate!: string;

  @ApiProperty({ example: 'cmpgwallet123', required: false })
  @IsOptional()
  @IsString()
  linkedWalletId?: string;

  @ApiProperty({
    example: 'Untuk jaga-jaga 6 bulan biaya hidup',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  note?: string;
}
