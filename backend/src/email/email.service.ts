import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    this.logger.log(`Welcome email sent to ${userEmail} (${userName})`);
    // In production, integrate with SendGrid/Mailgun/Resend API
    // await axios.post('https://api.resend.com/emails', { ... });
  }

  async sendCreditLowEmail(userEmail: string, balance: number): Promise<void> {
    this.logger.log(
      `Credit low alert to ${userEmail}: ${balance} credits remaining`,
    );
    // In production, send via email provider
  }

  async sendGenerationCompleteEmail(
    userEmail: string,
    scriptTitle: string,
  ): Promise<void> {
    this.logger.log(
      `Generation complete email to ${userEmail}: ${scriptTitle}`,
    );
    // In production, send via email provider
  }
}
