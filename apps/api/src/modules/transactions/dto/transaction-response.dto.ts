import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

class CategoryRef {
  @ApiProperty({ example: 'cmpgcat000001s01abcdefgh', description: 'ID kategori' }) id!: string;
  @ApiProperty({ example: 'Makanan', description: 'Nama kategori' }) name!: string;
  @ApiProperty({ example: '#15803D', description: 'Warna kategori (hex)' }) color!: string;
}

class WalletRef {
  @ApiProperty({ example: 'cmpgw000001s01abcdefgh', description: 'ID wallet' }) id!: string;
  @ApiProperty({ example: 'Cash', description: 'Nama wallet' }) name!: string;
}

export class TransactionResponse {
  @ApiProperty({ example: 'cmptrx000001s01abcdefgh', description: 'ID transaksi' }) id!: string;
  @ApiProperty({ enum: TransactionType, description: 'income atau expense' }) type!: TransactionType;
  @ApiProperty({ example: '25000.00', description: 'Jumlah (string decimal)' }) amount!: string;
  @ApiProperty({ example: 'cmpgcat000001s01abcdefgh', description: 'ID kategori' }) categoryId!: string;
  @ApiProperty({ example: 'cmpgw000001s01abcdefgh', description: 'ID wallet' }) walletId!: string;
  @ApiProperty({ example: 'cmpus000001s01abcdefgh', description: 'ID user pembuat' }) userId!: string;
  @ApiProperty({ nullable: true, type: String, example: 'Lunch with team', description: 'Catatan tambahan' }) note!: string | null;
  @ApiProperty({ example: '2026-05-22', description: 'Tanggal transaksi (YYYY-MM-DD)' }) transactionDate!: string;
  @ApiProperty({ example: '2026-05-22T03:39:15.512Z', description: 'Waktu dibuat' }) createdAt!: string;
  @ApiProperty({ example: '2026-05-22T03:39:15.512Z', description: 'Waktu diupdate' }) updatedAt!: string;
  @ApiProperty({ type: CategoryRef, description: 'Data kategori' }) category!: CategoryRef;
  @ApiProperty({ type: WalletRef, description: 'Data wallet' }) wallet!: WalletRef;
}

class PaginationMeta {
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 20 }) limit!: number;
  @ApiProperty({ example: 5 }) total!: number;
}

export class TransactionListResponse {
  @ApiProperty({ type: TransactionResponse, isArray: true })
  data!: TransactionResponse[];

  @ApiProperty({ type: PaginationMeta })
  meta!: PaginationMeta;
}

export class MonthlySummaryResponse {
  @ApiProperty({ example: { year: 2026, month: 5 } })
  period!: { year: number; month: number };

  @ApiProperty({ example: '5000000' })
  income!: string;

  @ApiProperty({ example: '1234500' })
  expense!: string;

  @ApiProperty({ example: '3765500' })
  net!: string;
}
