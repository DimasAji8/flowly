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
  @ApiProperty({
    example: 'cmpgfrom1234567890abcdef',
    description: 'ID wallet asal (sumber dana)',
  })
  @IsString()
  fromWalletId: string;

  @ApiProperty({
    example: 'cmpgto1234567890abcdef',
    description: 'ID wallet tujuan',
  })
  @IsString()
  toWalletId: string;

  @ApiProperty({
    example: 500000,
    description: 'Jumlah transfer (positive number, decimal 2 digit)',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({
    example: 'Transfer ke tabungan',
    description: 'Catatan tambahan',
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: '2026-05-26' })
  @IsDateString()
  @IsNotEmpty()
  transferDate: string;
}
