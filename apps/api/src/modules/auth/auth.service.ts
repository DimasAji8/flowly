import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { FlowlyJwtPayload, JwtPayload } from '../../common/types/auth';
import { DEFAULT_CATEGORIES, DEFAULT_WALLETS } from './auth.defaults';

const BCRYPT_ROUNDS = 12;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: { id: string; name: string; email: string; gender: string | null };
  workspaceId: string;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    // Buat user + personal workspace + membership + seed default
    // (wallet & categories) — semua dalam 1 transaksi atomik.
    const { user, workspace } = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: passwordHash,
          gender: dto.gender ?? null,
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: `${dto.name}'s Workspace`,
          ownerId: user.id,
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: 'owner',
        },
      });

      // Seed default wallet & categories supaya user bisa langsung
      // input transaksi tanpa setup terlebih dahulu.
      if (DEFAULT_WALLETS.length > 0) {
        await tx.wallet.createMany({
          data: DEFAULT_WALLETS.map((w) => ({
            workspaceId: workspace.id,
            name: w.name,
            balance: new Prisma.Decimal(w.balance),
          })),
        });
      }
      if (DEFAULT_CATEGORIES.length > 0) {
        await tx.category.createMany({
          data: DEFAULT_CATEGORIES.map((c) => ({
            workspaceId: workspace.id,
            name: c.name,
            type: c.type,
            color: c.color,
            icon: c.icon,
            group: c.group ?? null,
          })),
        });
      }

      return { user, workspace };
    });

    const tokens = await this.signTokens(user);
    return {
      user: { id: user.id, name: user.name, email: user.email, gender: user.gender },
      workspaceId: workspace.id,
      ...tokens,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    // Pesan generik biar tidak kasih info "user ada / tidak"
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const workspaceId = await this.getPrimaryWorkspaceId(user.id);
    const tokens = await this.signTokens(user);
    return {
      user: { id: user.id, name: user.name, email: user.email, gender: user.gender },
      workspaceId,
      ...tokens,
    };
  }

  async refresh(payload: JwtPayload): Promise<{ accessToken: string }> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User no longer exists');
    const accessToken = await this.signAccessToken(user);
    return { accessToken };
  }

  // ===========================================================
  // helpers
  // ===========================================================

  private async signTokens(user: User): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(user),
      this.signRefreshToken(user),
    ]);
    return { accessToken, refreshToken };
  }

  private signAccessToken(user: User): Promise<string> {
    const payload: FlowlyJwtPayload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    } as JwtSignOptions);
  }

  private signRefreshToken(user: User): Promise<string> {
    const payload: FlowlyJwtPayload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    } as JwtSignOptions);
  }

  /**
   * Cari workspace utama user (yang dia owner-i).
   * Kalau ada lebih dari 1, pilih yang paling lama (Phase 1 cukup ini).
   */
  private async getPrimaryWorkspaceId(userId: string): Promise<string> {
    const workspace = await this.prisma.workspace.findFirst({
      where: { ownerId: userId },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    if (!workspace) {
      // Edge case: user terdaftar tanpa workspace (data inkonsisten).
      throw new UnauthorizedException('No workspace assigned to user');
    }
    return workspace.id;
  }
}
