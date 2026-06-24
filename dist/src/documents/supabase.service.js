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
exports.SupabaseService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const path_1 = require("path");
let SupabaseService = class SupabaseService {
    supabase = null;
    bucketName = 'documents';
    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
        if (supabaseUrl && supabaseKey) {
            this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        }
    }
    async uploadFile(file) {
        return this.uploadBuffer(file.buffer, file.originalname, file.mimetype || 'application/octet-stream');
    }
    async uploadLocal(buffer, originalName, folder) {
        const dir = (0, path_1.join)(process.cwd(), 'uploads', folder);
        if (!(0, fs_1.existsSync)(dir)) {
            await (0, promises_1.mkdir)(dir, { recursive: true });
        }
        const timestamp = Date.now();
        const safeName = originalName.replace(/[^\w.\-]+/g, '_');
        const fileName = `${timestamp}-${safeName}`;
        await (0, promises_1.writeFile)((0, path_1.join)(dir, fileName), buffer);
        const port = process.env.PORT ?? 3001;
        const base = (process.env.API_PUBLIC_URL || `http://localhost:${port}`).replace(/\/$/, '');
        const urlPath = `${folder}/${fileName}`.replace(/\\/g, '/');
        return `${base}/uploads/${urlPath}`;
    }
    async uploadBuffer(buffer, originalName, contentType, folder = 'uploads') {
        if (!buffer?.length) {
            throw new Error('Empty file buffer');
        }
        if (this.supabase) {
            try {
                const timestamp = Date.now();
                const safeName = originalName.replace(/[^\w.\-]+/g, '_');
                const filePath = `${folder}/${timestamp}-${safeName}`;
                const { error } = await this.supabase.storage
                    .from(this.bucketName)
                    .upload(filePath, buffer, {
                    contentType,
                    upsert: false,
                });
                if (error) {
                    throw error;
                }
                const { data: urlData } = this.supabase.storage
                    .from(this.bucketName)
                    .getPublicUrl(filePath);
                return urlData.publicUrl;
            }
            catch (error) {
                console.warn('Supabase upload failed, using local storage:', error.message);
            }
        }
        return this.uploadLocal(buffer, originalName, folder);
    }
    async deleteFile(fileUrl) {
        if (!this.supabase)
            return;
        try {
            const filePath = this.extractFilePath(fileUrl);
            if (!filePath)
                return;
            const { error } = await this.supabase.storage
                .from(this.bucketName)
                .remove([filePath]);
            if (error) {
                console.error('Supabase deletion error:', error);
                throw error;
            }
        }
        catch (error) {
            console.error('Error deleting from Supabase:', error);
        }
    }
    extractFilePath(url) {
        const parts = url.split('/storage/v1/object/public/documents/');
        return parts[1] || '';
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map