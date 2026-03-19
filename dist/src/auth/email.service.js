"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let EmailService = class EmailService {
    configService;
    transporter;
    constructor(configService) {
        this.configService = configService;
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
    async sendVerificationEmail(email, name, otp) {
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
        }
        catch (error) {
            console.error('❌ Failed to send verification email:', error);
            throw error;
        }
    }
    async sendPasswordResetEmail(email, name, resetToken) {
        const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;
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
        }
        catch (error) {
            console.error('❌ Failed to send password reset email:', error);
            throw error;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map