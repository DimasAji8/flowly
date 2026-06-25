import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard dengan B2B pass-through.
 *
 * Jika request sudah di-autentikasi oleh B2bAuthGuard (ditandai `__b2b`),
 * guard ini akan melewati validasi JWT dan langsung return true.
 *
 * Urutan guard di controller (biasa):
 *   @UseGuards(JwtAuthGuard, WorkspaceGuard)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ __b2b?: boolean }>();
    if (req.__b2b) {
      return true;
    }
    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest<TUser>(
    err: Error | null,
    user: TUser,
    _info: unknown,
    _context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Token akses tidak valid');
    }
    return user;
  }
}
