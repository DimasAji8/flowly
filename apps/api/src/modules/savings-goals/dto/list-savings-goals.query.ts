import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ListSavingsGoalsQuery {
  @ApiProperty({ required: false, description: 'Filter goal yang dijeda' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true')
  @IsBoolean()
  isPaused?: boolean;

  @ApiProperty({
    required: false,
    description:
      'Filter goal yang sudah tercapai (currentAmount >= targetAmount)',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === 'true')
  @IsBoolean()
  isCompleted?: boolean;
}
