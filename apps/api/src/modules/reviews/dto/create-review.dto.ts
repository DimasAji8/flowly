import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Nama pengguna', example: 'Budi Santoso' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ description: 'Rating 1–5', example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ description: 'Isi review', example: 'Aplikasi ini sangat membantu…' })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  content!: string;
}
