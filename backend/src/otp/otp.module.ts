import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { OtpService } from "./otp.service";
import { OtpController } from "./otp.controller";

@Module({
  imports: [PrismaModule],
  providers: [OtpService],
  controllers: [OtpController],
  exports: [OtpService],
})
export class OtpModule {}