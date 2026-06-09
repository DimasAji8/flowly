import { ApiProperty } from '@nestjs/swagger';
import { CategoryGroup, TransactionType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

export class CreateCategoryDto {
  @ApiProperty({ example: 'Food', minLength: 1, maxLength: 60 })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  name!: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.expense })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiProperty({ example: '#15803D', required: false })
  @IsOptional()
  @IsString()
  @Matches(HEX_COLOR_REGEX, { message: 'color must be a hex string like #15803D' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  color?: string;

  @ApiProperty({ example: '🍔', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  icon?: string;

  @ApiProperty({ enum: CategoryGroup, required: false, description: 'null for income categories' })
  @IsOptional()
  @IsEnum(CategoryGroup)
  group?: CategoryGroup;
}
