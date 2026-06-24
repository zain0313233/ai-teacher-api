import { ClassChatService } from './class-chat.service';
import { SendClassMessageDto } from './dto/send-class-message.dto';
export declare class ClassChatController {
    private readonly classChatService;
    constructor(classChatService: ClassChatService);
    getMessages(req: any, classroomId: string, cursor?: string, limit?: string): Promise<{
        success: boolean;
        classroom: {
            id: string;
            name: string;
            subject: string;
        };
        messages: import("./class-chat.service").ClassMessageView[];
        nextCursor: string | null;
        hasMore: boolean;
    }>;
    sendMessage(req: any, classroomId: string, body: Omit<SendClassMessageDto, 'classroomId'>): Promise<{
        success: boolean;
        message: import("./class-chat.service").ClassMessageView;
    }>;
    uploadFile(req: any, classroomId: string, file: Express.Multer.File, messageType?: string): Promise<{
        success: boolean;
        fileUrl: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        messageType: "document" | "image" | "voice";
    }>;
}
