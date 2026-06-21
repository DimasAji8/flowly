import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WORKSPACE_ROLES_KEY } from '../decorators/workspace-roles.decorator';
import type { AuthUser } from '../types/auth';
import type { WorkspaceContext } from '../types/workspace';

/**
 * Guard untuk endpoint yang ter-scope ke workspace.
 *
 * Cara pakai:
 *   - Wajib dipasang SETELAH JwtAuthGuard (butuh req.user dari JWT).
 *   - Client harus kirim header `X-Workspace-Id: <workspaceId>`.
 *
 * Apa yang divalidasi:
 *   1. Header `X-Workspace-Id` ada → kalau tidak, 400.
 *   2. User adalah member dari workspace tersebut → kalau bukan, 403.
 *   3. (Opsional) Role user sesuai @WorkspaceRoles(...) → kalau tidak, 403.
 *
 * Setelah lulus: menempelkan `req.workspace = { id, role }` agar bisa
 * dibaca lewat @CurrentWorkspace().
 */
@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: AuthUser;
      headers: Record<string, string | string[] | undefined>;
      workspace?: WorkspaceContext;
      __b2b?: boolean;
    }>();

    // B2B pass-through: workspace sudah di-inject oleh B2bAuthGuard
    if (request.__b2b) {
      return true;
    }

    const user = request.user;
    if (!user) {
      // Konfigurasi salah: WorkspaceGuard dipasang tanpa JwtAuthGuard.
      throw new ForbiddenException('Authenticated user is required');
    }

    const headerValue = request.headers['x-workspace-id'];
    const workspaceId = Array.isArray(headerValue)
      ? headerValue[0]
      : headerValue;
    if (!workspaceId) {
      throw new BadRequestException('Missing X-Workspace-Id header');
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
      select: { role: true },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    const requiredRoles = this.reflector.getAllAndOverride<
      WorkspaceRole[] | undefined
    >(WORKSPACE_ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (
      requiredRoles &&
      requiredRoles.length > 0 &&
      !requiredRoles.includes(membership.role)
    ) {
      throw new ForbiddenException(
        `Requires role: ${requiredRoles.join(' or ')}`,
      );
    }

    request.workspace = { id: workspaceId, role: membership.role };
    return true;
  }
}
