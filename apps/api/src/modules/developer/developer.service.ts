import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DeveloperService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      totalTransactions,
      totalWorkspaces,
      totalWallets,
      totalSavingsGoals,
      totalTransfers,
      totalRecurring,
      incomeAgg,
      expenseAgg,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.transaction.count(),
      this.prisma.workspace.count(),
      this.prisma.wallet.count(),
      this.prisma.savingsGoal.count(),
      this.prisma.transfer.count(),
      this.prisma.recurringTransaction.count(),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'income' },
      }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'expense' },
      }),
    ]);

    return {
      users: totalUsers,
      transactions: totalTransactions,
      workspaces: totalWorkspaces,
      wallets: totalWallets,
      savingsGoals: totalSavingsGoals,
      transfers: totalTransfers,
      recurringTransactions: totalRecurring,
      totalIncome: incomeAgg._sum.amount ?? 0,
      totalExpense: expenseAgg._sum.amount ?? 0,
    };
  }

  async listUsers() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            ownedWorkspaces: true,
            memberships: true,
            transactions: true,
          },
        },
      },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      gender: u.gender,
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      ownedWorkspaces: u._count.ownedWorkspaces,
      memberOf: u._count.memberships,
      transactions: u._count.transactions,
    }));
  }

  async getWorkspaceStats() {
    const workspaces = await this.prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            members: true,
            wallets: true,
            categories: true,
            transactions: true,
            savingsGoals: true,
          },
        },
      },
    });

    const totalMembers = workspaces.reduce(
      (sum, w) => sum + w._count.members,
      0,
    );

    return {
      total: workspaces.length,
      totalMembers,
      avgMembersPerWorkspace:
        workspaces.length > 0
          ? Math.round((totalMembers / workspaces.length) * 10) / 10
          : 0,
      list: workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        ownerId: w.ownerId,
        members: w._count.members,
        wallets: w._count.wallets,
        categories: w._count.categories,
        transactions: w._count.transactions,
        savingsGoals: w._count.savingsGoals,
        createdAt: w.createdAt,
      })),
    };
  }

  async getHealth() {
    // Cek koneksi database
    let dbStatus = 'healthy';
    let dbLatencyMs: number | null = null;
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
    } catch {
      dbStatus = 'unhealthy';
    }

    return {
      status: dbStatus === 'healthy' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
    };
  }
}
