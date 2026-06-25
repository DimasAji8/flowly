import { ApiProperty } from '@nestjs/swagger';

export class WalletResponse {
  @ApiProperty({
    example: 'cmpgwxxxxxxxxxxxxxxxxxxxx',
    description: 'ID unik wallet',
  })
  id!: string;

  @ApiProperty({ example: 'Cash', description: 'Nama wallet' })
  name!: string;

  @ApiProperty({
    example: '500000.00',
    description: 'Saldo wallet (string decimal, presisi 2)',
  })
  balance!: string;

  @ApiProperty({
    example: '2026-05-22T03:39:15.512Z',
    description: 'Waktu dibuat',
  })
  createdAt!: string;
}
