import { Module } from '@nestjs/common';
import { RecurringController } from './recurring.controller';
import { RecurringService } from './recurring.service';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';

@Module({
  controllers: [RecurringController],
  providers: [RecurringService, WorkspaceGuard],
  exports: [RecurringService],
})
export class RecurringModule {}
