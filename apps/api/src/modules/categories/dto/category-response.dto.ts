import { ApiProperty } from '@nestjs/swagger';
import { CategoryGroup, TransactionType } from '@prisma/client';

export class CategoryResponse {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: TransactionType }) type!: TransactionType;
  @ApiProperty() color!: string;
  @ApiProperty() icon!: string;
  @ApiProperty({ enum: CategoryGroup, nullable: true })
  group!: CategoryGroup | null;
  @ApiProperty() createdAt!: string;
}
