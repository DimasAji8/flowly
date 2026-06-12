import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransferDto {
  @ApiProperty()
  @IsString()
  fromWalletId: string;

  @ApiProperty()
  @IsString()
  toWalletId: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: '2026-05-26' })
  @IsDateString()
  @IsNotEmpty()
  transferDate: string;
}
