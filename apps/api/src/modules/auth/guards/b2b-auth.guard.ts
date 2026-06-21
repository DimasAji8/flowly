import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Guard untuk autentikasi B2B via API Key.
 *
 * - Jika request TIDAK mengirim header `X-API-Key` → pass-through (guard skip).
 * - Jika request mengirim header `X-API-Key` → validasi key, inject user+workspace.
 *
 * Setelah B2B aktif, JwtAuthGuard dan WorkspaceGuard akan pass-through
 * otomatis (cek flag `__b2b`).
 */
@Injectable()
export class B2bAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
      __b2b?: boolean;
      user?: { id: string; email: string; role: 'user' | 'developer' };
      workspace?: { id: string; role: 'owner' | 'member' };
    }>();

    const headerValue = request.headers['x-api-key'];
    const apiKey = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    // Tidak ada header → pass-through (biarkan auth normal jalan)
    if (!apiKey) {
      return true;
    }

    const expectedKey = this.configService.get<string>('B2B_API_KEY');
    if (!expectedKey) {
      throw new UnauthorizedException('B2B API Key tidak dikonfigurasi');
    }

    if (apiKey !== expectedKey) {
      throw new UnauthorizedException('X-API-Key tidak valid');
    }

    const userId = this.configService.get<string>('B2B_USER_ID');
    const workspaceId = this.configService.get<string>('B2B_WORKSPACE_ID');
    const email =
      this.configService.get<string>('B2B_EMAIL') ?? 'b2b@temankas.com';

    if (!userId || !workspaceId) {
      throw new UnauthorizedException(
        'Konfigurasi B2B tidak lengkap (B2B_USER_ID / B2B_WORKSPACE_ID)',
      );
    }

    // Tandai request sebagai B2B + inject user & workspace
    request.__b2b = true;
    request.user = { id: userId, email, role: 'user' };
    request.workspace = { id: workspaceId, role: 'owner' };

    return true;
  }
}
