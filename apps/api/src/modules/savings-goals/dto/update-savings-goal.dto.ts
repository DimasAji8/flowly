import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateSavingsGoalDto {
  @ApiProperty({ example: 'Dana darurat keluarga', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name?: string;

  @ApiProperty({ example: 15000000, required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(1_000_000_000_000)
  targetAmount?: number;

  @ApiProperty({ example: 5000000, required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1_000_000_000_000)
  currentAmount?: number;

  @ApiProperty({ example: '2026-12-31', required: false })
  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @ApiProperty({ example: 'cmpgwallet123', required: false, nullable: true })
  @IsOptional()
  @IsString()
  linkedWalletId?: string;

  @ApiProperty({ example: 'Revisi target', required: false, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  note?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isPaused?: boolean;
}