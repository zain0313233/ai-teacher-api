import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    if (this.isSmtpConfigured()) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST'),
        port: this.configService.get('SMTP_PORT'),
        secure: this.configService.get('SMTP_SECURE') === 'true',
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
      });
    }
  }

  private isSmtpConfigured(): boolean {
    return Boolean(
      this.configService.get('SMTP_HOST') &&
        this.configService.get('SMTP_USER') &&
        this.configService.get('SMTP_PASS'),
    );
  }

  async sendVerificationEmail(email: string, name: string, otp: string) {
    if (!this.isSmtpConfigured()) {
      console.warn('⚠️ SMTP not configured — verification OTP (dev only):', otp);
      console.warn('📧 Would send to:', email);
      return;
    }
    const mailOptions = {
      from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM_EMAIL')}>`,
      to: email,
      subject: 'Verify Your Email - AI Teacher Assistant',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to AI Teacher Assistant!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for signing up. Please verify your email address using the OTP below:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <br>
          <p>Best regards,<br>AI Teacher Assistant Team</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Verification email sent successfully:', info.messageId);
      console.log('📧 Email sent to:', email);
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, name: string, resetToken: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    if (!this.isSmtpConfigured()) {
      console.warn('⚠️ SMTP not configured — password reset link (dev only):');
      console.warn(resetUrl);
      console.warn('📧 Would send to:', email);
      return;
    }
    
    const mailOptions = {
      from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM_EMAIL')}>`,
      to: email,
      subject: 'Reset Your Password - AI Teacher Assistant',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
          <br>
          <p>Best regards,<br>AI Teacher Assistant Team</p>
        </div>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully:', info.messageId);
      console.log('📧 Email sent to:', email);
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw error;
    }
  }

  async sendNewAssignmentEmail(
    email: string,
    name: string,
    payload: {
      className: string;
      assignmentTitle: string;
      dueAt?: Date | null;
      assignmentMode: string;
      link: string;
    },
  ) {
    const dueLine = payload.dueAt
      ? `<p><strong>Due:</strong> ${payload.dueAt.toLocaleString()}</p>`
      : '';
    const modeLabel = payload.assignmentMode === 'timed' ? 'Timed assessment' : 'Practice';

    const mailOptions = {
      from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM_EMAIL')}>`,
      to: email,
      subject: `New assignment: ${payload.assignmentTitle} — ${payload.className}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New class assignment</h2>
          <p>Hi ${name},</p>
          <p>Your teacher posted a new assignment in <strong>${payload.className}</strong>.</p>
          <p><strong>${payload.assignmentTitle}</strong></p>
          <p>Mode: ${modeLabel}</p>
          ${dueLine}
          <div style="text-align: center; margin: 28px 0;">
            <a href="${payload.link}" style="background-color: #14B8A6; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Open assignment
            </a>
          </div>
          <p style="color: #666; font-size: 13px;">You can change email preferences in Settings → Notifications.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Assignment notification email sent to:', email);
    } catch (error) {
      console.error('❌ Failed to send assignment email:', error);
    }
  }

  async sendAssignmentDueReminderEmail(
    email: string,
    name: string,
    payload: {
      className: string;
      assignmentTitle: string;
      dueAt: Date;
      link: string;
    },
  ) {
    const mailOptions = {
      from: `${this.configService.get('SMTP_FROM_NAME')} <${this.configService.get('SMTP_FROM_EMAIL')}>`,
      to: email,
      subject: `Reminder: ${payload.assignmentTitle} due in 24 hours`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Assignment due soon</h2>
          <p>Hi ${name},</p>
          <p><strong>${payload.assignmentTitle}</strong> in ${payload.className} is due on
            <strong>${payload.dueAt.toLocaleString()}</strong>.</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${payload.link}" style="background-color: #3B82F6; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Complete assignment
            </a>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ Due reminder email sent to:', email);
    } catch (error) {
      console.error('❌ Failed to send due reminder email:', error);
    }
  }
}
