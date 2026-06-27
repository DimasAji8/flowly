import { ApiProperty } from '@nestjs/swagger';

export class AiInsightResponseDto {
  @ApiProperty({
    description: 'ID unik dari insight',
    example: 'insight-spending-coffee-increase',
  })
  id!: string;

  @ApiProperty({
    description: 'Tipe alert dari insight keuangan',
    enum: ['warning', 'success', 'info'],
    example: 'warning',
  })
  type!: 'warning' | 'success' | 'info';

  @ApiProperty({
    description: 'Judul rekomendasi singkat',
    example: 'Pengeluaran Kopi Meningkat',
  })
  title!: string;

  @ApiProperty({
    description: 'Deskripsi analisis finansial dan solusi praktis',
    example: 'Bulan ini pengeluaran jajan kopi kamu naik 40%. Menguranginya bisa membantu mempercepat target tabungan liburanmu.',
  })
  description!: string;

  @ApiProperty({
    description: 'Label tombol aksi (opsional, null jika tidak perlu)',
    example: 'Lihat Laporan',
    nullable: true,
  })
  actionLabel!: string | null;

  @ApiProperty({
    description: 'Link tujuan halaman internal aplikasi untuk tombol aksi',
    example: '/reports',
    nullable: true,
  })
  actionUrl!: string | null;
}
