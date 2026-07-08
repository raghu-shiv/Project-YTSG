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

  async createOrder(userId: string, amount: number, credits: number) {
    try {
      const response = await axios.post(
        `${this.razorpayBaseUrl}/orders`,
        {
          amount: amount * 100, // Razorpay expects amount in paise
          currency: "INR",
          receipt: `credits_${userId}_${Date.now()}`,
          notes: { userId, credits: credits.toString() },
        },
        { headers: this.getAuthHeader() },
      );

      const order = response.data;

      // Save order to DB
      await this.prisma.payment.create({
        data: {
          userId,
          razorpayOrderId: order.id,
          amount,
          currency: "INR",
          status: "created",
          creditsPurchased: credits,
        },
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: this.keyId,
      };
    } catch (error: any) {
      this.logger.error(`Razorpay order creation failed: ${error.message}`);
      throw new Error("Payment order creation failed");
    }
  }

  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
  ) {
    // Verify signature
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

    // Update payment status
    await this.prisma.payment.update({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId,
        status: "paid",
      },
    });

    // Add credits to user
    const user = await this.prisma.user.findUnique({
      where: { id: payment.userId },
    });

    if (user) {
      const newBalance = user.creditBalance + payment.creditsPurchased;
      await this.prisma.user.update({
        where: { id: payment.userId },
        data: { creditBalance: newBalance },
      });

      await this.prisma.creditTransaction.create({
        data: {
          userId: payment.userId,
          type: "purchase",
          amount: payment.creditsPurchased,
          balanceAfter: newBalance,
          referenceId: razorpayPaymentId,
          description: `Purchased ${payment.creditsPurchased} credits`,
        },
      });
    }

    return { success: true, credits: payment.creditsPurchased };
  }

  async getPricing() {
    return {
      payPerCredit: [
        { credits: 10, price: 49, pricePerCredit: 4.9 },
        { credits: 50, price: 199, pricePerCredit: 3.98 },
        { credits: 100, price: 349, pricePerCredit: 3.49 },
      ],
      subscriptions: [
        {
          plan: "bundle_30",
          name: "30 Videos/Month",
          credits: 30,
          price: 149,
          pricePerCredit: 4.97,
        },
        {
          plan: "bundle_60",
          name: "60 Videos/Month",
          credits: 60,
          price: 249,
          pricePerCredit: 4.15,
        },
      ],
    };
  }
}
