import { Controller, Post, Body, Headers, Logger } from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator";
import { PrismaService } from "../prisma/prisma.service";
import * as crypto from "crypto";

@Controller("payments")
export class PaymentsWebhookController {
  private readonly logger = new Logger(PaymentsWebhookController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Post("webhook")
  @Public()
  async handleWebhook(
    @Body() body: any,
    @Headers("x-razorpay-signature") signature: string,
  ) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(body))
      .digest("hex");

    if (signature !== expectedSig) {
      this.logger.warn("Invalid webhook signature");
      return { status: "error", message: "Invalid signature" };
    }

    const event = body.event;

    if (event === "payment.captured") {
      const payment = body.payload.payment.entity;
      await this.prisma.payment.updateMany({
        where: { razorpayPaymentId: payment.id },
        data: { status: "paid" },
      });

      const existingPayment = await this.prisma.payment.findFirst({
        where: { razorpayPaymentId: payment.id },
      });

      if (existingPayment) {
        const user = await this.prisma.user.findUnique({
          where: { id: existingPayment.userId },
        });

        const newScriptCredits = (user?.scriptCredits || 0) + existingPayment.creditsPurchased;

        await this.prisma.creditTransaction.create({
          data: {
            userId: existingPayment.userId,
            amount: existingPayment.creditsPurchased,
            type: "purchase",
            balanceAfter: newScriptCredits,
            description: `Purchased ${existingPayment.creditsPurchased} credits`,
          },
        });

        await this.prisma.user.update({
          where: { id: existingPayment.userId },
          data: { scriptCredits: newScriptCredits },
        });
      }
    }

    if (event === "subscription.charged") {
      const subscription = body.payload.subscription.entity;
      const existingSub = await this.prisma.subscription.findFirst({
        where: { razorpaySubscriptionId: subscription.id },
      });

      if (existingSub) {
        const user = await this.prisma.user.findUnique({
          where: { id: existingSub.userId },
        });

        const newScriptCredits = (user?.scriptCredits || 0) + existingSub.scriptCredits;
        const newThumbnailCredits = (user?.thumbnailCredits || 0) + existingSub.thumbnailCredits;

        await this.prisma.creditTransaction.create({
          data: {
            userId: existingSub.userId,
            amount: existingSub.scriptCredits + existingSub.thumbnailCredits,
            type: "subscription_grant",
            balanceAfter: newScriptCredits + newThumbnailCredits,
            description: `Monthly subscription grant: ${existingSub.scriptCredits} script + ${existingSub.thumbnailCredits} thumbnail credits`,
          },
        });

        await this.prisma.user.update({
          where: { id: existingSub.userId },
          data: {
            scriptCredits: newScriptCredits,
            thumbnailCredits: newThumbnailCredits,
          },
        });

        await this.prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }

    return { status: "ok" };
  }
}