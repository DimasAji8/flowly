import { ApiProperty } from '@nestjs/swagger';
import { CategoryGroup } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Food & Drink', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name?: string;

  @ApiProperty({ example: '#B91C1C', required: false })
  @IsOptional()
  @IsString()
  @Matches(HEX_COLOR_REGEX, {
    message: 'color must be a hex string like #B91C1C',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  color?: string;

  @ApiProperty({ example: '🍔', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(8)
  icon?: string;

  @ApiProperty({ enum: CategoryGroup, required: false })
  @IsOptional()
  @IsEnum(CategoryGroup)
  group?: CategoryGroup;
}
