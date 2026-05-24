import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private bucketName = 'documents';

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found in environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    return this.uploadBuffer(
      file.buffer,
      file.originalname,
      file.mimetype || 'application/octet-stream',
    );
  }

  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    contentType: string,
    folder = 'uploads',
  ): Promise<string> {
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
        console.error('Supabase upload error:', error);
        throw error;
      }

      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading to Supabase:', error);
      throw error;
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const filePath = this.extractFilePath(fileUrl);

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
