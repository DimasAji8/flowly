import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import type { WorkspaceContext } from '../types/workspace';

/**
 * Ambil workspace context dari Request.
 * Wajib dipakai di route yang sudah di-protect oleh WorkspaceGuard.
 *
 * @example
 *   @UseGuards(JwtAuthGuard, WorkspaceGuard)
 *   @Get()
 *   list(@CurrentWorkspace() ws: WorkspaceContext) { ... }
 */
export const CurrentWorkspace = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): WorkspaceContext => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ workspace?: WorkspaceContext }>();
    if (!request.workspace) {
      throw new InternalServerErrorException(
        'CurrentWorkspace used without WorkspaceGuard',
      );
    }
    return request.workspace;
  },
);
