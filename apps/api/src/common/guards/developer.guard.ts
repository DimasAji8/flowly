import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DEVELOPER_ONLY_KEY } from '../decorators/developer-only.decorator';
import type { AuthUser } from '../types/auth';

/**
 * Guard untuk endpoint yang hanya boleh diakses user dengan role `developer`.
 *
 * Cara pakai:
 *   - Wajib dipasang SETELAH JwtAuthGuard (butuh req.user dari JWT).
 *   - Gunakan bersama @DeveloperOnly() decorator.
 *
 * @example
 *   @UseGuards(JwtAuthGuard, DeveloperGuard)
 *   @DeveloperOnly()
 *   @Get('stats')
 *   stats() { ... }
 */
@Injectable()
export class DeveloperGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isDeveloperOnly = this.reflector.getAllAndOverride<boolean>(
      DEVELOPER_ONLY_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Jika endpoint tidak di-mark @DeveloperOnly(), lewati saja
    if (!isDeveloperOnly) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: AuthUser;
    }>();

    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Authenticated user is required');
    }

    if (user.role !== 'developer') {
      throw new ForbiddenException('Akses terbatas untuk developer');
    }

    return true;
  }
}
