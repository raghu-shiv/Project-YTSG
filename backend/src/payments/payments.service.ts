import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly razorpayBaseUrl = "https://api.razorpay.com/v1";
  private readonly keyId: string;
  private readonly keySecret: string;

  constructor(private prisma: PrismaService) {
    this.keyId = process.env.RAZORPAY_KEY_ID || "";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  }

  private getAuthHeader() {
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString(
      "base64",
    );
    return { Authorization: `Basic ${auth}` };
  }

  private getPlanConfig(): Record<string, { scriptCredits: number; thumbnailCredits: number; monthlyPrice: number; annualPrice: number; name: string }> {
    return {
      starter:  { scriptCredits: 10, thumbnailCredits: 5,  monthlyPrice: 299,  annualPrice: 299 * 12,  name: "Starter" },
      pro:      { scriptCredits: 30, thumbnailCredits: 15, monthlyPrice: 799,  annualPrice: 799 * 12,  name: "Pro" },
      premium:  { scriptCredits: 50, thumbnailCredits: 20, monthlyPrice: 1199, annualPrice: 1199 * 12, name: "Premium" },
    };
  }

  async getPricing() {
    return {
      subscriptions: [
        {
          plan: "starter",
          name: "Starter",
          scriptCredits: 10,
          thumbnailCredits: 5,
          monthlyPrice: 299,
          annualPrice: 299 * 12,
          annualSavings: "Save 2 months",
          popular: false,
        },
        {
          plan: "pro",
          name: "Pro",
          scriptCredits: 30,
          thumbnailCredits: 15,
          monthlyPrice: 799,
          annualPrice: 799 * 12,
          annualSavings: "Save 2 months",
          popular: true,
        },
        {
          plan: "premium",
          name: "Premium",
          scriptCredits: 50,
          thumbnailCredits: 20,
          monthlyPrice: 1199,
          annualPrice: 1199 * 12,
          annualSavings: "Save 2 months",
          popular: false,
        },
      ],
    };
  }

  /**
   * Auto-renewal ON: Create a Razorpay subscription (recurring, annual billing)
   */
  async createRecurringSubscription(userId: string, plan: string) {
    const plans = this.getPlanConfig();
    const selectedPlan = plans[plan];
    if (!selectedPlan) {
      throw new Error("Invalid subscription plan");
    }

    try {
      const planResponse = await axios.post(
        `${this.razorpayBaseUrl}/plans`,
        {
          period: "yearly",
          interval: 1,
          item: {
            name: `${selectedPlan.name} - ${selectedPlan.scriptCredits} Script + ${selectedPlan.thumbnailCredits} Thumbnail Credits/mo`,
            description: `Annual subscription: ${selectedPlan.scriptCredits} script credits + ${selectedPlan.thumbnailCredits} thumbnail credits per month, billed yearly`,
            amount: selectedPlan.annualPrice * 100,
            currency: "INR",
          },
          notes: {
            planId: plan,
            scriptCredits: selectedPlan.scriptCredits.toString(),
            thumbnailCredits: selectedPlan.thumbnailCredits.toString(),
          },
        },
        { headers: this.getAuthHeader() },
      );

      const razorpayPlan = planResponse.data;

      const subscriptionResponse = await axios.post(
        `${this.razorpayBaseUrl}/subscriptions`,
        {
          plan_id: razorpayPlan.id,
          total_count: 12,
          quantity: 1,
          customer_notify: true,
          notes: {
            userId,
            plan,
            scriptCredits: selectedPlan.scriptCredits.toString(),
            thumbnailCredits: selectedPlan.thumbnailCredits.toString(),
          },
        },
        { headers: this.getAuthHeader() },
      );

      const razorpaySubscription = subscriptionResponse.data;

      return {
        subscriptionId: razorpaySubscription.id,
        shortUrl: razorpaySubscription.short_url,
        amount: razorpaySubscription.amount,
        currency: "INR",
        keyId: this.keyId,
        plan,
        autoRenew: true,
        scriptCredits: selectedPlan.scriptCredits,
        thumbnailCredits: selectedPlan.thumbnailCredits,
        annualScriptCredits: selectedPlan.scriptCredits * 12,
        annualThumbnailCredits: selectedPlan.thumbnailCredits * 12,
        annualPrice: selectedPlan.annualPrice,
      };
    } catch (error: any) {
      if (error.response) {
        this.logger.error(`Razorpay API error: ${JSON.stringify(error.response.data)}`);
      }
      this.logger.error(`Razorpay recurring subscription creation failed: ${error.message}`);
      throw new Error(error.response?.data?.error?.description || "Recurring subscription creation failed");
    }
  }

  /**
   * Auto-renewal OFF: One-time purchase for a single month's credits
   */
  async createOneTimePurchase(userId: string, plan: string) {
    const plans = this.getPlanConfig();
    const selectedPlan = plans[plan];
    if (!selectedPlan) {
      throw new Error("Invalid subscription plan");
    }

    try {
      const response = await axios.post(
        `${this.razorpayBaseUrl}/orders`,
        {
          amount: selectedPlan.monthlyPrice * 100,
          currency: "INR",
          receipt: `onetime_${userId.slice(0, 8)}_${Date.now()}`,
          notes: {
            userId,
            plan,
            type: "one_time",
            scriptCredits: selectedPlan.scriptCredits.toString(),
            thumbnailCredits: selectedPlan.thumbnailCredits.toString(),
          },
        },
        { headers: this.getAuthHeader() },
      );

      const order = response.data;

      await this.prisma.payment.create({
        data: {
          userId,
          razorpayOrderId: order.id,
          amount: selectedPlan.monthlyPrice,
          currency: "INR",
          status: "created",
          creditsPurchased: selectedPlan.scriptCredits + selectedPlan.thumbnailCredits,
        },
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: this.keyId,
        plan,
        autoRenew: false,
        scriptCredits: selectedPlan.scriptCredits,
        thumbnailCredits: selectedPlan.thumbnailCredits,
        monthlyPrice: selectedPlan.monthlyPrice,
      };
    } catch (error: any) {
      if (error.response) {
        this.logger.error(`Razorpay API error: ${JSON.stringify(error.response.data)}`);
      }
      this.logger.error(`Razorpay one-time purchase creation failed: ${error.message}`);
      throw new Error(error.response?.data?.error?.description || "One-time purchase creation failed");
    }
  }

  /**
   * Verify a recurring subscription payment (auto-renewal)
   */
  async verifyRecurringSubscription(
    userId: string,
    razorpaySubscriptionId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    plan: string,
    scriptCredits: number,
    thumbnailCredits: number,
  ) {
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", this.keySecret)
      .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      throw new Error("Invalid payment signature");
    }

    // Add first year's credits
    const annualScriptCredits = scriptCredits * 12;
    const annualThumbnailCredits = thumbnailCredits * 12;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (user) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          scriptCredits: user.scriptCredits + annualScriptCredits,
          thumbnailCredits: user.thumbnailCredits + annualThumbnailCredits,
        },
      });

      await this.prisma.creditTransaction.create({
        data: {
          userId,
          type: "purchase",
          amount: annualScriptCredits + annualThumbnailCredits,
          balanceAfter: user.scriptCredits + annualScriptCredits + user.thumbnailCredits + annualThumbnailCredits,
          referenceId: razorpayPaymentId,
          description: `Annual subscription (auto-renew): ${scriptCredits} script + ${thumbnailCredits} thumbnail credits/mo`,
        },
      });
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);

    await this.prisma.subscription.upsert({
      where: { userId_plan: { userId, plan: plan as any } },
      update: {
        status: "active",
        scriptCredits,
        thumbnailCredits,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        razorpaySubscriptionId,
      },
      create: {
        userId,
        plan: plan as any,
        scriptCredits,
        thumbnailCredits,
        status: "active",
        razorpaySubscriptionId,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    return {
      success: true,
      scriptCredits: annualScriptCredits,
      thumbnailCredits: annualThumbnailCredits,
      plan,
      autoRenew: true,
      periodEnd,
    };
  }

  /**
   * Verify a one-time purchase (no auto-renewal)
   */
  async verifyOneTimePurchase(
    userId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    plan: string,
    scriptCredits: number,
    thumbnailCredits: number,
  ) {
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", this.keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      throw new Error("Invalid payment signature");
    }

    const payment = await this.prisma.payment.findUnique({
      where: { razorpayOrderId },
    });

    if (!payment) {
      throw new Error("Payment order not found");
    }

    await this.prisma.payment.update({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId,
        status: "paid",
      },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (user) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          scriptCredits: user.scriptCredits + scriptCredits,
          thumbnailCredits: user.thumbnailCredits + thumbnailCredits,
        },
      });

      await this.prisma.creditTransaction.create({
        data: {
          userId,
          type: "purchase",
          amount: scriptCredits + thumbnailCredits,
          balanceAfter: user.scriptCredits + scriptCredits + user.thumbnailCredits + thumbnailCredits,
          referenceId: razorpayPaymentId,
          description: `One-month purchase: ${scriptCredits} script + ${thumbnailCredits} thumbnail credits (${plan})`,
        },
      });
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await this.prisma.subscription.upsert({
      where: { userId_plan: { userId, plan: plan as any } },
      update: {
        status: "cancelled",
        scriptCredits,
        thumbnailCredits,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      create: {
        userId,
        plan: plan as any,
        scriptCredits,
        thumbnailCredits,
        status: "cancelled",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    return {
      success: true,
      scriptCredits,
      thumbnailCredits,
      plan,
      autoRenew: false,
      periodEnd,
    };
  }

  async getUserSubscriptions(userId: string) {
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return subscriptions;
  }

  async toggleAutoRenew(userId: string, subscriptionId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { id: subscriptionId, userId },
    });

    if (!sub) {
      throw new Error("Subscription not found");
    }

    const newStatus = sub.status === "active" ? "cancelled" : "active";

    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: newStatus },
    });

    return {
      success: true,
      status: newStatus,
      message: newStatus === "active" ? "Auto-renewal enabled" : "Auto-renewal disabled",
    };
  }
}