import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, WorkspaceGuard],
  exports: [TransactionsService],
})
export class TransactionsModule {}
