import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthUser } from '../types/auth';

/**
 * Ambil user yang ter-autentikasi dari Request.
 * Wajib dipakai di route yang sudah di-protect oleh JwtAuthGuard.
 *
 * @example
 *   @UseGuards(JwtAuthGuard)
 *   @Get('me')
 *   me(@CurrentUser() user: AuthUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (!request.user) {
      throw new InternalServerErrorException(
        'CurrentUser used on unprotected route',
      );
    }
    return request.user;
  },
);
