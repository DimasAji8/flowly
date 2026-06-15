import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from './prisma/prisma.service';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  async getDbHealth(): Promise<{ status: string; database: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'connected' };
    } catch {
      return { status: 'error', database: 'disconnected' };
    }
  }

  /**
   * Seed akun developer dari env DEV_USER_EMAIL & DEV_USER_PASSWORD.
   * Dipanggil saat aplikasi start.
   */
  async seedDeveloper(): Promise<void> {
    const email = this.configService.get<string>('DEV_USER_EMAIL');
    const password = this.configService.get<string>('DEV_USER_PASSWORD');

    if (!email) {
      this.logger.log('ℹ️  DEV_USER_EMAIL tidak diset — lewati seed developer');
      return;
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      // Upgrade role jika sudah ada tapi belum developer
      if (existing.role !== 'developer') {
        await this.prisma.user.update({
          where: { id: existing.id },
          data: { role: 'developer' },
        });
        this.logger.log(`👑 User ${email} di-upgrade ke role developer`);
      } else {
        this.logger.log(`✅ Developer account already exists: ${email}`);
      }
      return;
    }

    const passwordHash = await bcrypt.hash(
      password || 'developer123',
      BCRYPT_ROUNDS,
    );

    const user = await this.prisma.user.create({
      data: {
        name: 'Developer',
        email: email.toLowerCase(),
        password: passwordHash,
        role: 'developer',
        gender: null,
      },
    });

    // Buat personal workspace juga untuk akun developer
    const workspace = await this.prisma.workspace.create({
      data: {
        name: "Developer's Workspace",
        ownerId: user.id,
      },
    });

    await this.prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: 'owner',
      },
    });

    this.logger.log(`👑 Akun developer berhasil dibuat: ${email}`);
  }
}
