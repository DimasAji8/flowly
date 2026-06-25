import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ParseTransactionDto {
  @ApiProperty({
    description: 'Kalimat teks natural transaksi untuk di-parse',
    example: 'tadi makan bakso 25rb bayar tunai',
  })
  @IsString()
  @IsNotEmpty()
  text!: string;
}
