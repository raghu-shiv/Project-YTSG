import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate a 6-digit OTP and store it in the database.
   * For development, returns the OTP so it can be used in testing.
   */
  async sendOtp(userId: string, target: string, type: "email" | "phone") {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    // Invalidate any previous unused OTPs for this user+type
    await this.prisma.otpVerification.updateMany({
      where: { userId, type, used: false },
      data: { used: true },
    });

    // Store new OTP
    await this.prisma.otpVerification.create({
      data: {
        userId,
        target,
        type,
        otp,
        expiresAt,
      },
    });

    this.logger.log(`OTP for ${target} (${type}): ${otp}`);

    return {
      success: true,
      message: type === "email" ? "OTP sent to your email" : "OTP sent to your phone",
      // For development, return the OTP
      otp,
    };
  }

  /**
   * Verify the OTP for a given user and target
   */
  async verifyOtp(userId: string, target: string, type: "email" | "phone", otp: string) {
    // Find a valid, unused OTP that hasn't expired
    const verification = await this.prisma.otpVerification.findFirst({
      where: {
        userId,
        target,
        type,
        otp,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      throw new Error("Invalid or expired OTP");
    }

    // Mark OTP as used
    await this.prisma.otpVerification.update({
      where: { id: verification.id },
      data: { used: true },
    });

    if (type === "email") {
      await this.prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true },
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: { phone: target, phoneVerified: true },
      });
    }

    return {
      success: true,
      message: type === "email" ? "Email verified successfully" : "Phone verified successfully",
    };
  }
}