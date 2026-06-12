import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { WalletType } from '@prisma/client';

export class UpdateWalletDto {
  @ApiProperty({ example: 'Cash Wallet', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name?: string;

  @ApiProperty({ enum: WalletType, required: false })
  @IsOptional()
  @IsEnum(WalletType)
  type?: WalletType;
}
