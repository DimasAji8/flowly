import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, WorkspaceGuard],
  exports: [CategoriesService],
})
export class CategoriesModule {}
