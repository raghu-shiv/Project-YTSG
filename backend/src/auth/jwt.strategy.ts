import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../prisma/prisma.service";

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  ver?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        scriptCredits: true,
        thumbnailCredits: true,
        tokenVersion: true,
      },
    });

    if (!user || payload.ver !== user.tokenVersion) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    const { tokenVersion: _tokenVersion, ...safeUser } = user;
    return safeUser;
  }
}
