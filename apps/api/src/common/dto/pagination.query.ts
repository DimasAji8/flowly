import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Query DTO generik untuk endpoint list yang di-paginate.
 * Pakai: `@Query() pagination: PaginationQueryDto` di controller.
 *
 * - `page`     : 1-indexed, default 1
 * - `pageSize` : default 50, min 1, max 200
 *
 * Response shape: `PaginatedResponse<T>` dari `common/types/pagination`.
 */
export class PaginationQueryDto {
  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 50, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  pageSize?: number = 50;
}
