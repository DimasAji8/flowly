import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { AuthUser } from '../types/auth';

/**
 * Rate limiter khusus endpoint AI.
 *
 * Menggunakan user ID (dari JWT) sebagai throttle key, bukan IP address.
 * Ini lebih adil karena beberapa user bisa berada di belakang NAT yang sama.
 */
@Injectable()
export class AiThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, unknown>): Promise<string> {
    const user = req['user'] as AuthUser | undefined;
    // Fallback ke IP jika user belum ter-resolve (seharusnya tidak terjadi karena JwtAuthGuard duluan)
    return Promise.resolve(user?.id ?? (req['ip'] as string) ?? 'anonymous');
  }

  protected async throwThrottlingException(): Promise<void> {
    const { ThrottlerException } = await import('@nestjs/throttler');
    throw new ThrottlerException(
      'Terlalu banyak permintaan ke fitur AI. Silakan tunggu sebentar sebelum mencoba lagi.',
    );
  }
}
