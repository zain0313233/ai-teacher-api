export declare class CloudinaryService {
    private supabase;
    private bucketName;
    constructor();
    uploadFile(file: Express.Multer.File): Promise<string>;
    deleteFile(fileUrl: string): Promise<void>;
    private extractFilePath;
}
