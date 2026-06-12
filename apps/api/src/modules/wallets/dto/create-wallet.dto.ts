import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { WalletType } from '@prisma/client';

export class CreateWalletDto {
  @ApiProperty({ example: 'Cash', minLength: 1, maxLength: 60 })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name!: string;

  @ApiProperty({
    enum: WalletType,
    example: WalletType.cash,
    required: false,
    default: WalletType.cash,
  })
  @IsOptional()
  @IsEnum(WalletType)
  type?: WalletType;

  @ApiProperty({
    example: 0,
    description: 'Initial balance (boleh negatif, decimal 2 digit)',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(-1_000_000_000_000)
  @Max(1_000_000_000_000)
  balance?: number;
}
