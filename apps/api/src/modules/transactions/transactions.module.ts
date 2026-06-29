import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, WorkspaceGuard],
  exports: [TransactionsService],
})
export class TransactionsModule {}
