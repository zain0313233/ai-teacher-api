export declare class SupabaseService {
    private supabase;
    private bucketName;
    constructor();
    uploadFile(file: Express.Multer.File): Promise<string>;
    private uploadLocal;
    uploadBuffer(buffer: Buffer, originalName: string, contentType: string, folder?: string): Promise<string>;
    deleteFile(fileUrl: string): Promise<void>;
    private extractFilePath;
}
