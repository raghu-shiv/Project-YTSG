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

  @Post("create-order")
  @UseGuards(JwtAuthGuard)
  createOrder(
    @Req() req: any,
    @Body() body: { amount: number; credits: number },
  ) {
    return this.paymentsService.createOrder(
      req.user.id,
      body.amount,
      body.credits,
    );
  }

  @Post("verify")
  @Public()
  verifyPayment(
    @Body()
    body: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    },
  ) {
    return this.paymentsService.verifyPayment(
      body.razorpayOrderId,
      body.razorpayPaymentId,
      body.razorpaySignature,
    );
  }
}
