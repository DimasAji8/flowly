import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferResponse {
  @ApiProperty() id: string;
  @ApiProperty() workspaceId: string;
  @ApiProperty() fromWalletId: string;
  @ApiProperty() toWalletId: string;
  @ApiProperty() fromWalletName: string;
  @ApiProperty() toWalletName: string;
  @ApiProperty() amount: string;
  @ApiPropertyOptional() note: string | null;
  @ApiProperty() transferDate: string;
  @ApiProperty() createdAt: string;
}
