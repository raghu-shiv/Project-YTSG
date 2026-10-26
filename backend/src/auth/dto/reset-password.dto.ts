import { IsString, Length, MaxLength } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  @Length(40, 200)
  token!: string;

  @IsString()
  @Length(12, 128)
  newPassword!: string;
}
