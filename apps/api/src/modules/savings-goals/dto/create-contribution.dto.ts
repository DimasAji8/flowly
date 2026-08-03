import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';

export class CreateContributionDto {
  @ApiProperty({ example: 100000, description: 'Nominal setoran' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(1_000_000_000_000)
  amount!: number;

  @ApiProperty({
    example: 'clx...',
    description: 'ID Dompet asal setoran (opsional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  fromWalletId?: string;

  @ApiProperty({
    example: true,
    description: 'Apakah setoran ini dialokasikan dari pemasukan bulan ini?',
    required: false,
  })
  @IsOptional()
  isMonthlyAllocation?: boolean;
}
