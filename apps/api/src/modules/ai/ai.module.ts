import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';

@Module({
  controllers: [AiController],
  providers: [AiService, WorkspaceGuard],
  exports: [AiService],
})
export class AiModule {}
