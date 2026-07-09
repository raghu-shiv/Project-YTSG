import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(
    @Body() body: { email: string; password: string; name?: string },
  ) {
    return this.authService.register(body.email, body.password, body.name);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post("google")
  @HttpCode(HttpStatus.OK)
  async googleLogin(
    @Body()
    body: {
      email: string;
      name: string;
      googleId: string;
      avatarUrl?: string;
    },
  ) {
    return this.authService.googleLogin(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post("make-admin")
  @HttpCode(HttpStatus.OK)
  async makeAdmin(
    @CurrentUser() user: { id: string; email: string; role: string },
    @Body() body: { secretKey: string },
  ) {
    return this.authService.makeAdmin(user.id, body.secretKey);
  }
}
