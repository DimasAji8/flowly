import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const TREND_DAYS = 7;

@Injectable()
export class DeveloperService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - ONE_DAY_MS);
    const sevenDaysAgo = new Date(now.getTime() - 7 * ONE_DAY_MS);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * ONE_DAY_MS);

    // ── Aggregations dasar (counts) ─────────────────────────────────────
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

    const totalIncome = incomeAgg._sum.amount
      ? Number(incomeAgg._sum.amount)
      : 0;
    const totalExpense = expenseAgg._sum.amount
      ? Number(expenseAgg._sum.amount)
      : 0;

    // ── Active users (DAU/WAU/MAU) via single raw query ────────────────
    const activeBuckets = await this.prisma.$queryRaw<
      Array<{ d1: number; d7: number; d30: number }>
    >`
      SELECT
        COUNT(*) FILTER (WHERE "last_seen_at" >= ${oneDayAgo})::int  AS d1,
        COUNT(*) FILTER (WHERE "last_seen_at" >= ${sevenDaysAgo})::int AS d7,
        COUNT(*) FILTER (WHERE "last_seen_at" >= ${thirtyDaysAgo})::int AS d30
      FROM "users"
    `;
    const active = activeBuckets[0] ?? { d1: 0, d7: 0, d30: 0 };

    // ── Transactions minggu ini + time series 7 hari ───────────────────
    const [transactionsThisWeek, txByDayRaw] = await Promise.all([
      this.prisma.transaction.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE("created_at") AS date, COUNT(*)::bigint AS count
        FROM "transactions"
        WHERE "created_at" >= ${sevenDaysAgo}
        GROUP BY DATE("created_at")
        ORDER BY date ASC
      `,
    ]);

    // Isi hari yang kosong dengan 0 agar chart tetap kontinu
    const dayMap = new Map<string, number>();
    for (const row of txByDayRaw) {
      const d =
        row.date instanceof Date ? row.date : new Date(row.date as unknown as string);
      const key = this.toDateKey(d);
      dayMap.set(key, Number(row.count));
    }
    const transactionsByDay: Array<{ date: string; label: string; count: number }> = [];
    for (let i = TREND_DAYS - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * ONE_DAY_MS);
      const key = this.toDateKey(d);
      const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      transactionsByDay.push({ date: key, label, count: dayMap.get(key) ?? 0 });
    }

    // ── Adoption / engagement: % user yang pernah pakai tiap fitur ──────
    // Wallet, savings goal, transfer, recurring → workspace-scoped, harus
    // dicek via ownedWorkspaces ATAU memberships.
    // Transaction → langsung punya userId.
    const [usersWithWallet, usersWithTransaction, usersWithTransfer, usersWithSavingsGoal, usersWithRecurring] =
      await Promise.all([
        this.prisma.user.count({
          where: {
            OR: [
              { ownedWorkspaces: { some: { wallets: { some: {} } } } },
              { memberships: { some: { workspace: { wallets: { some: {} } } } } },
            ],
          },
        }),
        this.prisma.user.count({ where: { transactions: { some: {} } } }),
        this.prisma.user.count({
          where: {
            OR: [
              { ownedWorkspaces: { some: { transfers: { some: {} } } } },
              { memberships: { some: { workspace: { transfers: { some: {} } } } } },
            ],
          },
        }),
        this.prisma.user.count({
          where: {
            OR: [
              { ownedWorkspaces: { some: { savingsGoals: { some: {} } } } },
              { memberships: { some: { workspace: { savingsGoals: { some: {} } } } } },
            ],
          },
        }),
        this.prisma.user.count({
          where: {
            OR: [
              {
                ownedWorkspaces: {
                  some: { recurringTransactions: { some: {} } },
                },
              },
              {
                memberships: {
                  some: { workspace: { recurringTransactions: { some: {} } } },
                },
              },
            ],
          },
        }),
      ]);

    // Rata-rata transaksi per user yang punya ≥1 transaksi
    const txPerUserGroup = await this.prisma.transaction.groupBy({
      by: ['userId'],
      _count: { _all: true },
    });
    const activeTxUserCount = txPerUserGroup.length;
    const totalTxAcrossActive = txPerUserGroup.reduce(
      (sum, g) => sum + g._count._all,
      0,
    );
    const avgTxPerActiveUser =
      activeTxUserCount > 0
        ? Math.round((totalTxAcrossActive / activeTxUserCount) * 10) / 10
        : 0;

    const safeRate = (numerator: number) =>
      totalUsers > 0 ? Math.round((numerator / totalUsers) * 1000) / 1000 : 0;

    return {
      // Counts mentah (tetap dikembalikan agar tidak breaking)
      users: totalUsers,
      transactions: totalTransactions,
      workspaces: totalWorkspaces,
      wallets: totalWallets,
      savingsGoals: totalSavingsGoals,
      transfers: totalTransfers,
      recurringTransactions: totalRecurring,

      // Volume (sebelumnya sudah ada, tinggal dipake FE)
      totalIncome,
      totalExpense,
      volumeNet: totalIncome - totalExpense,

      // Active users (DAU/WAU/MAU)
      activeUsers24h: active.d1,
      activeUsers7d: active.d7,
      activeUsers30d: active.d30,

      // Tren transaksi 7 hari
      transactionsThisWeek,
      transactionsByDay,

      // Adoption / engagement (desimal 0..1, frontend format sebagai %)
      engagement: {
        walletAdoption: safeRate(usersWithWallet),
        transactionAdoption: safeRate(usersWithTransaction),
        transferAdoption: safeRate(usersWithTransfer),
        avgTxPerActiveUser,
      },

      // Adoption fitur lanjutan (dipakai di sub-section "Adopsi Fitur")
      featureAdoption: {
        savingsGoalAdoption: safeRate(usersWithSavingsGoal),
        recurringAdoption: safeRate(usersWithRecurring),
      },
    };
  }

  private toDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
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
        lastSeenAt: true,
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
      lastSeenAt: u.lastSeenAt,
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
