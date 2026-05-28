import { Module } from '@nestjs/common';
import { SavingsGoalsController } from './savings-goals.controller';
import { SavingsGoalsService } from './savings-goals.service';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';

@Module({
  controllers: [SavingsGoalsController],
  providers: [SavingsGoalsService, WorkspaceGuard],
  exports: [SavingsGoalsService],
})
export class SavingsGoalsModule {}
