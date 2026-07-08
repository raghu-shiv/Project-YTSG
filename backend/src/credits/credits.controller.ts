import { Controller, Get, Query, UseGuards, Req } from "@nestjs/common";
import { CreditsService } from "./credits.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("credits")
@UseGuards(JwtAuthGuard)
export class CreditsController {
  constructor(private creditsService: CreditsService) {}

  @Get("balance")
  getBalance(@Req() req: any) {
    return this.creditsService.getBalance(req.user.id);
  }

  @Get("transactions")
  getTransactions(
    @Req() req: any,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.creditsService.getTransactions(
      req.user.id,
      Number(page) || 1,
      Number(limit) || 20,
    );
  }
}
