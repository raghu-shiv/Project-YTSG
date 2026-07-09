import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || email.split("@")[0],
        creditBalance: 5, // Free signup credits
      },
    });

    // Grant signup credits
    await this.prisma.creditTransaction.create({
      data: {
        userId: user.id,
        type: "purchase",
        amount: 5,
        balanceAfter: 5,
        description: "Welcome credits",
      },
    });

    const token = this.generateToken(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        creditBalance: user.creditBalance,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = this.generateToken(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        creditBalance: user.creditBalance,
      },
      token,
    };
  }

  async googleLogin(googleUser: {
    email: string;
    name: string;
    googleId: string;
    avatarUrl?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: googleUser.googleId },
    });

    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      if (user) {
        // Link Google account to existing user
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.googleId,
            authProvider: "google",
            avatarUrl: googleUser.avatarUrl,
          },
        });
      } else {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.googleId,
            authProvider: "google",
            avatarUrl: googleUser.avatarUrl,
            creditBalance: 5,
          },
        });

        await this.prisma.creditTransaction.create({
          data: {
            userId: user.id,
            type: "purchase",
            amount: 5,
            balanceAfter: 5,
            description: "Welcome credits",
          },
        });
      }
    }

    const token = this.generateToken(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        creditBalance: user.creditBalance,
      },
      token,
    };
  }

  /**
   * Promote a user to admin role using a secret admin key.
   * Only authenticated users can call this endpoint, and they must
   * provide the correct ADMIN_SECRET_KEY environment variable value.
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
        creditBalance: user.creditBalance,
      },
    };
  }

  private generateToken(user: { id: string; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload, { expiresIn: "7d" });
  }
}