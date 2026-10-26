import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { EmailService } from "../email/email.service";

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const GENERIC_RESET_RESPONSE = {
  message:
    "If an account exists for this email, password reset instructions will be sent shortly.",
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const normalizedEmail = this.normalizeEmail(email);
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name || normalizedEmail.split("@")[0],
        scriptCredits: 2,
        thumbnailCredits: 1,
      },
    });

    await this.prisma.creditTransaction.create({
      data: {
        userId: user.id,
        type: "purchase",
        amount: 3,
        balanceAfter: 3,
        description: "Welcome credits (2 script + 1 thumbnail)",
      },
    });

    const token = this.generateToken(user);
    return {
      user: this.toPublicUser(user),
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: this.normalizeEmail(email) },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return {
      user: this.toPublicUser(user),
      token: this.generateToken(user),
    };
  }

  async googleLogin(googleUser: {
    email: string;
    name: string;
    googleId: string;
    avatarUrl?: string;
  }) {
    const normalizedEmail = this.normalizeEmail(googleUser.email);

    let user = await this.prisma.user.findUnique({
      where: { googleId: googleUser.googleId },
    });

    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.googleId,
            authProvider: "google",
            avatarUrl: googleUser.avatarUrl,
          },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            email: normalizedEmail,
            name: googleUser.name,
            googleId: googleUser.googleId,
            authProvider: "google",
            avatarUrl: googleUser.avatarUrl,
            scriptCredits: 2,
            thumbnailCredits: 1,
          },
        });

        await this.prisma.creditTransaction.create({
          data: {
            userId: user.id,
            type: "purchase",
            amount: 3,
            balanceAfter: 7,
            description: "Welcome credits (2 script + 1 thumbnail)",
          },
        });
      }
    }

    return {
      user: this.toPublicUser(user),
      token: this.generateToken(user),
    };
  }

  /**
   * Always returns the same public response, whether the user exists or not.
   */
  async forgotPassword(email: string) {
    const normalizedEmail = this.normalizeEmail(email);

    // Invalidating previous links ensures only the newest request is valid.
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return GENERIC_RESET_RESPONSE;
    }

    const rawToken = randomBytes(32).toString("base64url");
    const tokenHash = this.hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      await tx.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });
    });

    const frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl) {
      this.logger.error(
        "FRONTEND_URL is not configured; reset email was not sent",
      );
      // Do not log the token or URL. The caller still receives a generic response.
      await this.prisma.passwordResetToken.deleteMany({
        where: { tokenHash },
      });
      return GENERIC_RESET_RESPONSE;
    }

    const resetUrl = new URL("/auth/reset-password", frontendUrl);
    resetUrl.searchParams.set("token", rawToken);

    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetUrl.toString(),
      );
    } catch (error) {
      // Invalidate a token whose email could not be sent.
      await this.prisma.passwordResetToken.deleteMany({
        where: { tokenHash },
      });
      this.logger.error("Password reset email send failed");
      // Avoid account enumeration through provider errors.
    }

    return GENERIC_RESET_RESPONSE;
  }

  /**
   * A token must be valid, unexpired and unused.
   * The transaction consumes it and updates the password atomically.
   */
  async resetPassword(rawToken: string, newPassword: string) {
    if (
      typeof rawToken !== "string" ||
      rawToken.length < 40 ||
      rawToken.length > 200
    ) {
      throw new BadRequestException("Invalid or expired reset link");
    }

    if (
      typeof newPassword !== "string" ||
      newPassword.length < 12 ||
      newPassword.length > 128
    ) {
      throw new BadRequestException(
        "Password must be between 12 and 128 characters",
      );
    }

    const tokenHash = this.hashResetToken(rawToken);
    const now = new Date();

    // Hash password before entering the transaction to minimize lock duration.
    const passwordHash = await bcrypt.hash(newPassword, 12);

    try {
      await this.prisma.$transaction(
        async (tx) => {
          const reset = await tx.passwordResetToken.findUnique({
            where: { tokenHash },
            select: {
              id: true,
              userId: true,
              expiresAt: true,
              usedAt: true,
            },
          });

          if (!reset || reset.usedAt || reset.expiresAt <= now) {
            throw new BadRequestException("Invalid or expired reset link");
          }

          // Conditional claim prevents simultaneous reuse of the same token.
          const consumed = await tx.passwordResetToken.updateMany({
            where: {
              id: reset.id,
              usedAt: null,
              expiresAt: { gt: now },
            },
            data: { usedAt: now },
          });

          if (consumed.count !== 1) {
            throw new BadRequestException("Invalid or expired reset link");
          }

          // Password change and session-version increment commit together.
          await tx.user.update({
            where: { id: reset.userId },
            data: {
              passwordHash,
              tokenVersion: { increment: 1 },
            },
          });

          // Revoke all other reset links for the same user.
          await tx.passwordResetToken.deleteMany({
            where: {
              userId: reset.userId,
              id: { not: reset.id },
            },
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      // A Serializable transaction can fail under concurrent requests.
      // Do not turn unexpected database errors into successful resets.
      this.logger.error("Password reset transaction failed");
      throw error;
    }

    return {
      message: "Password has been reset. Please sign in again.",
    };
  }

  /**
   * Promote a user to admin role using a secret admin key.
   */
  async makeAdmin(userId: string, secretKey: string) {
    const adminSecretKey = process.env.ADMIN_SECRET_KEY;

    if (!adminSecretKey) {
      throw new ForbiddenException("Admin promotion is not configured");
    }

    if (secretKey !== adminSecretKey) {
      throw new ForbiddenException("Invalid admin secret key");
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role: "admin" },
    });

    this.logger.log(`User ${user.email} (${user.id}) promoted to admin`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        scriptCredits: user.scriptCredits,
        thumbnailCredits: user.thumbnailCredits,
      },
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private hashResetToken(token: string): string {
    return createHash("sha256").update(token, "utf8").digest("hex");
  }

  private toPublicUser(user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    phoneVerified: boolean;
    emailVerified: boolean;
    role: string;
    scriptCredits: number;
    thumbnailCredits: number;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      phoneVerified: user.phoneVerified,
      emailVerified: user.emailVerified,
      role: user.role,
      scriptCredits: user.scriptCredits,
      thumbnailCredits: user.thumbnailCredits,
    };
  }

  private generateToken(user: {
    id: string;
    email: string;
    role: string;
    tokenVersion: number;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      ver: user.tokenVersion,
    };

    return this.jwtService.sign(payload, { expiresIn: "7d" });
  }
}
