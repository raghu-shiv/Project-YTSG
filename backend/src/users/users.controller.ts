import { Controller, Get, Put, Body, UseGuards, Req } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("profile")
  getProfile(@Req() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put("profile")
  updateProfile(
    @Req() req: any,
    @Body() body: { name?: string; avatarUrl?: string },
  ) {
    return this.usersService.updateProfile(req.user.id, body);
  }
}
