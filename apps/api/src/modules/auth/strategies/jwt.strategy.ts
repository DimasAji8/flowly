import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser, JwtPayload } from '../../../common/types/auth';

// Throttle window untuk update lastSeenAt — hemat write, cukupgranular
// untuk hitung DAU/WAU/MAU.
const LAST_SEEN_THROTTLE_MS = 5 * 60 * 1000;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET is not defined');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User no longer exists');
    if (user.isSuspended) throw new UnauthorizedException('Akun Anda ditangguhkan, silakan hubungi administrator untuk membuka');

    // Fire-and-forget: throttled update lastSeenAt untuk analytics (DAU/WAU/MAU).
    // Tidak await agar tidak menambah latency request.
    this.touchLastSeen(user.id).catch((err) => {
      this.logger.warn(`Failed to update lastSeenAt for ${user.id}: ${err}`);
    });

    return { id: user.id, email: user.email, role: payload.role };
  }

  private async touchLastSeen(userId: string): Promise<void> {
    const threshold = new Date(Date.now() - LAST_SEEN_THROTTLE_MS);
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        OR: [{ lastSeenAt: null }, { lastSeenAt: { lt: threshold } }],
      },
      data: { lastSeenAt: new Date() },
    });
  }
}
