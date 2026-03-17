export declare class CloudinaryService {
    constructor();
    uploadFile(file: Express.Multer.File): Promise<string>;
    deleteFile(fileUrl: string): Promise<void>;
    private extractPublicId;
}
