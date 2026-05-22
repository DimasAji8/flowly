import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtPayload } from '../types/auth';

/**
 * Ambil JWT payload mentah (sub, email) dari request.
 * Dipakai khusus untuk endpoint /auth/refresh — di sana kita
 * cuma butuh `sub` untuk re-issue access token, tidak perlu hit DB.
 */
export const CurrentJwtPayload = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    if (!request.user) {
      throw new InternalServerErrorException(
        'CurrentJwtPayload used on unprotected route',
      );
    }
    return request.user;
  },
);
