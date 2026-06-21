import { ApiProperty } from '@nestjs/swagger';
import { CategoryGroup, TransactionType } from '@prisma/client';

export class CategoryResponse {
  @ApiProperty({ example: 'cmpgcat000001s01abcdefgh', description: 'ID kategori' }) id!: string;
  @ApiProperty({ example: 'Makanan', description: 'Nama kategori' }) name!: string;
  @ApiProperty({ enum: TransactionType, description: 'income atau expense' }) type!: TransactionType;
  @ApiProperty({ example: '#15803D', description: 'Warna (hex)' }) color!: string;
  @ApiProperty({ example: '🍔', description: 'Icon/emoji kategori' }) icon!: string;
  @ApiProperty({ enum: CategoryGroup, nullable: true, description: 'Kelompok (null untuk income)' })
  group!: CategoryGroup | null;
  @ApiProperty({ example: '2026-05-22T03:39:15.512Z', description: 'Waktu dibuat' }) createdAt!: string;
}
