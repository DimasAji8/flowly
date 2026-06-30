import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { AiThrottlerGuard } from '../../common/guards/ai-throttler.guard';

@Module({
  controllers: [AiController],
  providers: [AiService, WorkspaceGuard, AiThrottlerGuard],
  exports: [AiService],
})
export class AiModule {}
