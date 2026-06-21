import { ApiProperty } from '@nestjs/swagger';

export class SavingsGoalResponse {
  @ApiProperty({ example: 'cmpggoal00001s01abcdefgh', description: 'ID target' }) id!: string;
  @ApiProperty({ nullable: true, example: 'cmpgw000001s01abcdefgh', description: 'Wallet yang ditautkan (opsional)' }) linkedWalletId!: string | null;
  @ApiProperty({ example: 'Dana Darurat', description: 'Nama target' }) name!: string;
  @ApiProperty({ example: '12000000.00', description: 'Target nominal (string decimal)' }) targetAmount!: string;
  @ApiProperty({ example: '2500000.00', description: 'Sudah terkumpul (string decimal)' }) currentAmount!: string;
  @ApiProperty({ example: '2026-12-31T00:00:00.000Z', description: 'Target tanggal tercapai' }) targetDate!: string;
  @ApiProperty({ nullable: true, example: 'Untuk jaga-jaga 6 bulan', description: 'Catatan' }) note!: string | null;
  @ApiProperty({ example: false, description: 'Apakah sedang dijeda' }) isPaused!: boolean;
  @ApiProperty({ example: '2026-05-22T03:39:15.512Z', description: 'Waktu dibuat' }) createdAt!: Date;
  @ApiProperty({ example: '2026-06-21T03:39:15.512Z', description: 'Waktu diupdate' }) updatedAt!: Date;
}
