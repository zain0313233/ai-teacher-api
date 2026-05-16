"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
let CloudinaryService = class CloudinaryService {
    supabase;
    bucketName = 'documents';
    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase credentials not found in environment variables');
        }
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    }
    async uploadFile(file) {
        try {
            const timestamp = Date.now();
            const randomString = Math.random().toString(36).substring(7);
            const fileExtension = file.originalname.split('.').pop();
            const fileName = `${timestamp}_${randomString}.${fileExtension}`;
            const filePath = `ai-teacher-documents/${fileName}`;
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });
            if (error) {
                console.error('Supabase upload error:', error);
                throw new Error(`Upload failed: ${error.message}`);
            }
            const { data: urlData } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);
            return urlData.publicUrl;
        }
        catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    }
    async deleteFile(fileUrl) {
        try {
            const filePath = this.extractFilePath(fileUrl);
            const { error } = await this.supabase.storage
                .from(this.bucketName)
                .remove([filePath]);
            if (error) {
                console.error('Supabase deletion error:', error);
                throw error;
            }
        }
        catch (error) {
            console.error('File deletion error:', error);
        }
    }
    extractFilePath(url) {
        const parts = url.split('/storage/v1/object/public/documents/');
        return parts[1] || '';
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map