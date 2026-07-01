import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min, Max } from 'class-validator';

export class CreateContributionDto {
  @ApiProperty({ example: 100000, description: 'Nominal setoran' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(1_000_000_000_000)
  amount!: number;
}
