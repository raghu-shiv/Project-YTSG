import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { OtpService } from "./otp.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("otp")
export class OtpController {
  constructor(private otpService: OtpService) {}

  @Post("send")
  @UseGuards(JwtAuthGuard)
  sendOtp(
    @Req() req: any,
    @Body() body: { target: string; type: "email" | "phone" },
  ) {
    return this.otpService.sendOtp(req.user.id, body.target, body.type);
  }

  @Post("verify")
  @UseGuards(JwtAuthGuard)
  verifyOtp(
    @Req() req: any,
    @Body() body: { target: string; type: "email" | "phone"; otp: string },
  ) {
    return this.otpService.verifyOtp(req.user.id, body.target, body.type, body.otp);
  }
}