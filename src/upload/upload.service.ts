import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { supabase } from './supabase.config';
import { Multer } from 'multer';

@Injectable()
export class UploadService {
  async uploadFile(
    file: Multer.File,
    folder: string,
  ): Promise<string> {
    try {
      if (!file || !file.originalname) {
        throw new Error('Invalid file provided');
      }

      const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
      const filePath = `${folder}/${fileName}`;

      const { error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to upload file: ${error.message}`);
    }
  }

  async updateFile(
    file: Multer.File,
    folder: string,
    oldFileUrl?: string,
  ): Promise<string> {
    if (oldFileUrl) {
      await this.deleteFile(oldFileUrl);
    }
    return this.uploadFile(file, folder);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const filePath = fileUrl.split('/').slice(-2).join('/');
      const { error } = await supabase.storage
        .from('uploads')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to delete file: ${error.message}`);
    }
  }
}
