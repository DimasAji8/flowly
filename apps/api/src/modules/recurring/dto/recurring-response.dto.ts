import { ApiProperty } from '@nestjs/swagger';
import { RecurringFrequency, TransactionType } from '@prisma/client';

export class RecurringResponse {
  @ApiProperty({ example: 'cmprec000001s01abcdefgh', description: 'ID recurring' }) id!: string;
  @ApiProperty({ enum: TransactionType, description: 'income atau expense' }) type!: TransactionType;
  @ApiProperty({ example: '50000.00', description: 'Jumlah per siklus' }) amount!: string;
  @ApiProperty({ example: 'cmpgcat000001s01abcdefgh', description: 'ID kategori' }) categoryId!: string;
  @ApiProperty({ example: 'cmpgw000001s01abcdefgh', description: 'ID wallet' }) walletId!: string;
  @ApiProperty({ enum: RecurringFrequency, description: 'Frekuensi: daily/weekly/monthly/yearly' }) frequency!: RecurringFrequency;
  @ApiProperty({ nullable: true, type: String, example: 'Subscription Spotify', description: 'Catatan' }) note!: string | null;
  @ApiProperty({ example: '2026-06-01T00:00:00.000Z', description: 'Jadwal jalan berikutnya' }) nextRunAt!: string;
  @ApiProperty({ example: true, description: 'Aktif atau tidak' }) isActive!: boolean;
  @ApiProperty({ example: '2026-05-22T03:39:15.512Z', description: 'Waktu dibuat' }) createdAt!: string;
}
