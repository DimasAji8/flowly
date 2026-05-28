import { ApiProperty } from '@nestjs/swagger';

export class SavingsGoalResponse {
  @ApiProperty() id!: string;
  @ApiProperty({ nullable: true }) linkedWalletId!: string | null;
  @ApiProperty() name!: string;
  @ApiProperty({ example: '12000000.00' }) targetAmount!: string;
  @ApiProperty({ example: '2500000.00' }) currentAmount!: string;
  @ApiProperty({ example: '2026-12-31T00:00:00.000Z' }) targetDate!: string;
  @ApiProperty({ nullable: true }) note!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}