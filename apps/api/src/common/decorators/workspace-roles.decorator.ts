import { SetMetadata } from '@nestjs/common';
import type { WorkspaceRole } from '@prisma/client';

export const WORKSPACE_ROLES_KEY = 'workspaceRoles';

/**
 * Restrict endpoint ke role tertentu di dalam workspace.
 * Wajib dipakai bersama WorkspaceGuard.
 *
 * @example
 *   @UseGuards(JwtAuthGuard, WorkspaceGuard)
 *   @WorkspaceRoles('owner')
 *   @Delete(':id')
 *   remove(...) { ... }
 */
export const WorkspaceRoles = (...roles: WorkspaceRole[]) =>
  SetMetadata(WORKSPACE_ROLES_KEY, roles);
