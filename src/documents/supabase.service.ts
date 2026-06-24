import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private bucketName = 'documents';

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return this.uploadBuffer(
      file.buffer,
      file.originalname,
      file.mimetype || 'application/octet-stream',
    );
  }

  private async uploadLocal(
    buffer: Buffer,
    originalName: string,
    folder: string,
  ): Promise<string> {
    const dir = join(process.cwd(), 'uploads', folder);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeName = originalName.replace(/[^\w.\-]+/g, '_');
    const fileName = `${timestamp}-${safeName}`;
    await writeFile(join(dir, fileName), buffer);

    const port = process.env.PORT ?? 3001;
    const base = (process.env.API_PUBLIC_URL || `http://localhost:${port}`).replace(/\/$/, '');
    const urlPath = `${folder}/${fileName}`.replace(/\\/g, '/');
    return `${base}/uploads/${urlPath}`;
  }

  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    contentType: string,
    folder = 'uploads',
  ): Promise<string> {
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
      } catch (error) {
        console.warn('Supabase upload failed, using local storage:', (error as Error).message);
      }
    }

    return this.uploadLocal(buffer, originalName, folder);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (!this.supabase) return;

    try {
      const filePath = this.extractFilePath(fileUrl);
      if (!filePath) return;

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Supabase deletion error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting from Supabase:', error);
    }
  }

  private extractFilePath(url: string): string {
    // Extract path after /storage/v1/object/public/documents/
    const parts = url.split('/storage/v1/object/public/documents/');
    return parts[1] || '';
  }
}
