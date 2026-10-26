import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { Resend } from "resend";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("RESEND_API_KEY is required");
    }

    this.resend = new Resend(apiKey);
    this.fromEmail =
      process.env.RESEND_FROM_EMAIL ??
      "YT Scripts <no-reply@yt-scripts.online>";
  }

  private async sendEmail(input: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (error || !data?.id) {
      // Do not log reset tokens, reset URLs, or email contents.
      this.logger.error(
        `Email delivery failed: ${error?.message ?? "No ID returned"}`,
      );
      throw new InternalServerErrorException("Email delivery failed");
    }
  }

  async sendPasswordResetEmail(
    userEmail: string,
    resetUrl: string,
  ): Promise<void> {
    const safeUrl = this.escapeHtml(resetUrl);

    await this.sendEmail({
      to: userEmail,
      subject: "Reset your YT Scripts password",
      text: [
        "We received a request to reset your YT Scripts password.",
        "",
        `Reset your password using this link: ${resetUrl}`,
        "",
        "This link expires in 15 minutes and can only be used once.",
        "If you did not request this, you can ignore this email.",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111827;line-height:1.6">
          <h1 style="font-size:24px">Reset your password</h1>
          <p>We received a request to reset your YT Scripts password.</p>
          <p style="margin:28px 0">
            <a href="${safeUrl}" style="display:inline-block;background:#4f46e5;color:white;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600">
              Reset password
            </a>
          </p>
          <p>This link expires in <strong>15 minutes</strong> and can only be used once.</p>
          <p>If you did not request this, you can safely ignore this email. Your password will not change.</p>
        </div>
      `,
    });
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    await this.sendEmail({
      to: userEmail,
      subject: "Welcome to YT Scripts",
      text: `Welcome to YT Scripts, ${userName}!`,
      html: `<p>Welcome to YT Scripts, ${this.escapeHtml(userName)}!</p>`,
    });
  }

  async sendCreditLowEmail(userEmail: string, balance: number): Promise<void> {
    await this.sendEmail({
      to: userEmail,
      subject: "Your YT Scripts credits are running low",
      text: `You have ${balance} credits remaining.`,
      html: `<p>You have ${balance} credits remaining.</p>`,
    });
  }

  async sendGenerationCompleteEmail(
    userEmail: string,
    scriptTitle: string,
  ): Promise<void> {
    await this.sendEmail({
      to: userEmail,
      subject: "Your YouTube script is ready",
      text: `Your script "${scriptTitle}" is ready.`,
      html: `<p>Your script "${this.escapeHtml(scriptTitle)}" is ready.</p>`,
    });
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
