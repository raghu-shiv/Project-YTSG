import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class ThrottleTierGuard extends ThrottlerGuard {
  protected async getTracker(req: any): Promise<string> {
    return req.ip;
  }

  protected async getLimitAndTtl(context: any): Promise<[number, number]> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const isPro = user?.role === "pro" || user?.role === "admin";
    return isPro ? [60, 60000] : [10, 60000];
  }
}
