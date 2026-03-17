export declare class SupabaseService {
    private supabase;
    private bucketName;
    constructor();
    uploadFile(file: Express.Multer.File): Promise<string>;
    deleteFile(fileUrl: string): Promise<void>;
    private extractFilePath;
}
