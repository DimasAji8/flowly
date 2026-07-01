import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AdjustWalletDto {
  @ApiProperty({
    description: 'Saldo riil dompet yang baru',
    example: 50000,
  })
  @IsNumber()
  @IsNotEmpty()
  balance: number;
}
