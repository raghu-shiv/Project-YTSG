import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

@Controller("admin")
@UseGuards(RolesGuard)
@Roles("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("users")
  getUsers(@Query("page") page = 1, @Query("limit") limit = 20) {
    return this.adminService.getUsers(+page, +limit);
  }

  @Get("users/:id")
  getUserDetails(@Param("id") id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Patch("users/:id/credits")
  adjustCredits(
    @Param("id") id: string,
    @Body() body: { amount: number; reason: string },
  ) {
    return this.adminService.adjustCredits(id, body.amount, body.reason);
  }

  @Get("stats")
  getStats() {
    return this.adminService.getStats();
  }
}
