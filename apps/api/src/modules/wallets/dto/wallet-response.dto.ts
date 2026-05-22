import { ApiProperty } from '@nestjs/swagger';

export class WalletResponse {
  @ApiProperty({ example: 'cmpgwxxxxxxxxxxxxxxxxxxxx' })
  id!: string;

  @ApiProperty({ example: 'Cash' })
  name!: string;

  @ApiProperty({
    example: '0.00',
    description: 'Saldo wallet sebagai string decimal (presisi 2)',
  })
  balance!: string;

  @ApiProperty({ example: '2026-05-22T03:39:15.512Z' })
  createdAt!: string;
}
