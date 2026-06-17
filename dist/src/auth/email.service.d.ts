import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    sendVerificationEmail(email: string, name: string, otp: string): Promise<void>;
    sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void>;
    sendNewAssignmentEmail(email: string, name: string, payload: {
        className: string;
        assignmentTitle: string;
        dueAt?: Date | null;
        assignmentMode: string;
        link: string;
    }): Promise<void>;
    sendAssignmentDueReminderEmail(email: string, name: string, payload: {
        className: string;
        assignmentTitle: string;
        dueAt: Date;
        link: string;
    }): Promise<void>;
}
