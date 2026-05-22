import { Module } from '@nestjs/common';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';

@Module({
  controllers: [WalletsController],
  providers: [WalletsService, WorkspaceGuard],
  exports: [WalletsService],
})
export class WalletsModule {}
