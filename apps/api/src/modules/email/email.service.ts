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
      this.logger.warn(
        'RESEND_API_KEY not configured. Email sending will be disabled.',
      );
    }
    this.resend = new Resend(apiKey);
    this.fromEmail = this.configService.get<string>(
      'EMAIL_FROM',
      'noreply@temankas.com',
    );
    this.appName = this.configService.get<string>('APP_NAME', 'Teman Kas');
    this.appUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:4000',
    );
  }

  async sendResetPasswordEmail(
    to: string,
    token: string,
    userName: string,
  ): Promise<void> {
    const resetLink = `${this.appUrl}/auth/reset-password?token=${token}`;
    const firstName = userName.split(' ')[0];

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f7;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:0 0 24px 0;">
              <span style="font-size:22px;font-weight:700;color:#0066cc;letter-spacing:-0.5px;">${this.appName}</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:12px;border:1px solid #e3e3e8;padding:40px 36px;">

              <!-- Icon -->
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;width:48px;height:48px;background:#eef4fc;border-radius:12px;text-align:center;line-height:48px;font-size:24px;">🔐</div>
              </div>

              <h1 style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:#1d1d1f;text-align:center;">Reset Password</h1>
              <p style="margin:0 0 28px 0;font-size:14px;color:#6e6e73;text-align:center;">Permintaan reset password untuk akun Anda</p>

              <p style="margin:0 0 20px 0;font-size:15px;color:#1d1d1f;line-height:1.6;">
                Halo <strong>${firstName}</strong>,
              </p>
              <p style="margin:0 0 28px 0;font-size:15px;color:#3a3a3c;line-height:1.6;">
                Kami menerima permintaan untuk mengatur ulang password akun <strong>${this.appName}</strong> Anda. Klik tombol di bawah untuk melanjutkan.
              </p>

              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="display:inline-block;padding:13px 36px;background-color:#0066cc;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">Atur Ulang Password</a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px 0;font-size:13px;color:#6e6e73;">Atau salin link ini ke browser:</p>
              <p style="margin:0 0 28px 0;padding:12px 14px;background-color:#f5f5f7;border-radius:6px;word-break:break-all;font-size:12px;color:#0066cc;font-family:monospace;">${resetLink}</p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #e3e3e8;margin:0 0 20px 0;">

              <p style="margin:0;font-size:13px;color:#6e6e73;line-height:1.6;">
                Link ini berlaku selama <strong>1 jam</strong>. Jika Anda tidak meminta reset password, abaikan email ini — password Anda tidak akan berubah.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 0 0 0;">
              <p style="margin:0;font-size:12px;color:#8e8e93;">© ${new Date().getFullYear()} ${this.appName} · Email otomatis, jangan dibalas</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: `Reset password akun ${this.appName} Anda`,
        html,
      });
      this.logger.log(
        `Reset password email sent to ${to}, ID: ${result.data?.id}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send reset password email to ${to}`, error);
      throw error;
    }
  }
}
