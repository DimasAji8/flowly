import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTransactionDto } from './create-transaction.dto';

/**
 * Semua field optional. Type masih bisa di-update kalau memang diperlukan,
 * tapi UI biasanya cuma kasih edit amount/note/date/category/wallet.
 */
export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
  @ApiProperty({ required: false })
  declare type?: CreateTransactionDto['type'];
}
