import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Matches, Min } from 'class-validator';

export class CreateBudgetDto {
  @ApiProperty({
    description: 'ID Kategori Pengeluaran',
    example: 'cmqn77d0l00021sirkz9oie1d',
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'Jumlah Anggaran Bulanan',
    example: 1500000,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Periode Anggaran dalam format YYYY-MM',
    example: '2026-07',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'Period harus memiliki format YYYY-MM',
  })
  period: string;
}
