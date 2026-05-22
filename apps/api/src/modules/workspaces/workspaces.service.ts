import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List semua workspace yang user ini join (sebagai owner atau member).
   */
  async listForUser(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            ownerId: true,
            createdAt: true,
          },
        },
      },
    });

    return memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      role: m.role,
      isOwner: m.workspace.ownerId === userId,
      createdAt: m.workspace.createdAt,
    }));
  }

  /**
   * Detail workspace beserta jumlah anggota.
   * User harus sudah lulus WorkspaceGuard (dijamin member).
   */
  async getById(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return {
      id: workspace.id,
      name: workspace.name,
      ownerId: workspace.ownerId,
      memberCount: workspace._count.members,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
    };
  }
}
