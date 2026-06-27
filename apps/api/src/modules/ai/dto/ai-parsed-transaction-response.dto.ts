import { ApiProperty } from '@nestjs/swagger';

export class AiParsedTransactionResponseDto {
  @ApiProperty({
    description: 'Tipe transaksi yang dideteksi oleh AI',
    enum: ['income', 'expense'],
    example: 'expense',
  })
  type!: 'income' | 'expense';

  @ApiProperty({
    description: 'Jumlah nominal transaksi',
    example: 25000,
  })
  amount!: number;

  @ApiProperty({
    description: 'ID Kategori yang disarankan oleh AI berdasarkan database kategori workspace',
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  categoryId!: string | null;

  @ApiProperty({
    description: 'ID Dompet yang disarankan oleh AI berdasarkan database dompet workspace',
    example: '123e4567-e89b-12d3-a456-426614174001',
    nullable: true,
  })
  walletId!: string | null;

  @ApiProperty({
    description: 'Catatan ringkasan detail transaksi atau daftar item dari struk belanja',
    example: 'Belanja Di Indomaret:\n- Kopi Kapal Api\n- Roti Sobek',
  })
  note!: string;

  @ApiProperty({
    description: 'Tanggal transaksi dalam format YYYY-MM-DD',
    example: '2026-06-27',
  })
  transactionDate!: string;
}
