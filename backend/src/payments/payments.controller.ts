import { Controller, Get, Post, Body, UseGuards, Req } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { Public } from "../common/decorators/public.decorator";

@Controller("payments")
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Get("pricing")
  @Public()
  getPricing() {
    return this.paymentsService.getPricing();
  }

  @Post("create-recurring-subscription")
  @UseGuards(JwtAuthGuard)
  createRecurringSubscription(
    @Req() req: any,
    @Body() body: { plan: string },
  ) {
    return this.paymentsService.createRecurringSubscription(
      req.user.id,
      body.plan,
    );
  }

  @Post("create-one-time-purchase")
  @UseGuards(JwtAuthGuard)
  createOneTimePurchase(
    @Req() req: any,
    @Body() body: { plan: string },
  ) {
    return this.paymentsService.createOneTimePurchase(
      req.user.id,
      body.plan,
    );
  }

  @Post("verify-recurring-subscription")
  @UseGuards(JwtAuthGuard)
  verifyRecurringSubscription(
    @Req() req: any,
    @Body()
    body: {
      razorpaySubscriptionId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      plan: string;
      scriptCredits: number;
      thumbnailCredits: number;
    },
  ) {
    return this.paymentsService.verifyRecurringSubscription(
      req.user.id,
      body.razorpaySubscriptionId,
      body.razorpayPaymentId,
      body.razorpaySignature,
      body.plan,
      body.scriptCredits,
      body.thumbnailCredits,
    );
  }

  @Post("verify-one-time-purchase")
  @UseGuards(JwtAuthGuard)
  verifyOneTimePurchase(
    @Req() req: any,
    @Body()
    body: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      plan: string;
      scriptCredits: number;
      thumbnailCredits: number;
    },
  ) {
    return this.paymentsService.verifyOneTimePurchase(
      req.user.id,
      body.razorpayOrderId,
      body.razorpayPaymentId,
      body.razorpaySignature,
      body.plan,
      body.scriptCredits,
      body.thumbnailCredits,
    );
  }

  @Get("subscriptions")
  @UseGuards(JwtAuthGuard)
  getUserSubscriptions(@Req() req: any) {
    return this.paymentsService.getUserSubscriptions(req.user.id);
  }

  @Post("toggle-auto-renew")
  @UseGuards(JwtAuthGuard)
  toggleAutoRenew(
    @Req() req: any,
    @Body() body: { subscriptionId: string },
  ) {
    return this.paymentsService.toggleAutoRenew(
      req.user.id,
      body.subscriptionId,
    );
  }
}