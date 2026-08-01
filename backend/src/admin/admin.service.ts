import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: { scripts: true, creditTransactions: true, payments: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count(),
    ]);
    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getUserDetails(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        scripts: { orderBy: { createdAt: "desc" }, take: 50 },
        creditTransactions: { orderBy: { createdAt: "desc" }, take: 50 },
        payments: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });
  }

  async adjustCredits(userId: string, amount: number, reason: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    // For admin adjustments, add to script credits by default
    const newBalance = user.scriptCredits + amount;

    await this.prisma.creditTransaction.create({
      data: {
        userId,
        amount: Math.abs(amount),
        type: "purchase",
        balanceAfter: newBalance,
        description: reason,
      },
    });

    return this.prisma.user.update({
      where: { id: userId },
      data: { scriptCredits: newBalance },
    });
  }

  async getStats() {
    const [
      totalUsers,
      totalScripts,
      totalPayments,
      todayScripts,
      activeSubscriptions,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.script.count(),
      this.prisma.payment.aggregate({ _sum: { amount: true } }),
      this.prisma.script.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      this.prisma.subscription.count({ where: { status: "active" } }),
    ]);

    return {
      totalUsers,
      totalScripts,
      totalRevenue: totalPayments._sum.amount || 0,
      scriptsToday: todayScripts,
      activeSubscriptions,
    };
  }
}