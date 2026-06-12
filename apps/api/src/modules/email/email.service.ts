import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly appName: string;
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not configured. Email sending will be disabled.');
    }

    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>('EMAIL_FROM', 'noreply@temankas.com');
    this.appName = this.configService.get<string>('APP_NAME', 'Teman Kas');
    this.appUrl = this.configService.get<string>('APP_URL', 'http://localhost:4000');
  }

  async sendResetPasswordEmail(to: string, token: string, userName: string): Promise<void> {
    const resetLink = `${this.appUrl}/auth/reset-password?token=${token}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password - ${this.appName}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">${this.appName}</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">Reset Password</h2>
                      
                      <p style="margin: 0 0 16px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                        Halo <strong>${userName}</strong>,
                      </p>

                      <p style="margin: 0 0 16px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                        Kami menerima permintaan untuk reset password akun Anda. Klik tombol di bawah ini untuk membuat password baru:
                      </p>

                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Reset Password</a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 24px 0 16px 0; color: #555555; font-size: 14px; line-height: 1.6;">
                        Atau copy link berikut ke browser Anda:
                      </p>

                      <p style="margin: 0 0 24px 0; padding: 12px; background-color: #f5f5f5; border-radius: 4px; word-break: break-all; font-size: 13px; color: #667eea;">
                        ${resetLink}
                      </p>

                      <p style="margin: 0 0 16px 0; color: #555555; font-size: 14px; line-height: 1.6;">
                        <strong>Link ini akan expired dalam 1 jam.</strong>
                      </p>

                      <p style="margin: 0; color: #999999; font-size: 13px; line-height: 1.6;">
                        Jika Anda tidak meminta reset password, abaikan email ini. Password Anda tetap aman.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0 0 8px 0; color: #999999; font-size: 13px;">
                        © ${new Date().getFullYear()} ${this.appName}. All rights reserved.
                      </p>
                      <p style="margin: 0; color: #999999; font-size: 12px;">
                        Email otomatis, mohon tidak membalas email ini.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `Reset Password - ${this.appName}`,
        html: htmlContent,
      });

      this.logger.log(`Reset password email sent to ${to}, ID: ${result.data?.id}`);
    } catch (error) {
      this.logger.error(`Failed to send reset password email to ${to}`, error);
      throw error;
    }
  }
}
