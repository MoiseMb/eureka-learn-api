import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { supabase } from './supabase.config';
import { Multer } from 'multer';

@Injectable()
export class UploadService {
  async uploadImage(
    file: Multer.File,
    folder: string,
  ): Promise<{ url: string }> {
    try {
      const fileName = `${Date.now()}_${file.originalname}`;
      const filePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      return { url: urlData.publicUrl };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to upload file: ${error.message}`);
    }
  }

  async updateImage(
    file: Multer.File,
    folder: string,
    oldImageUrl?: string,
  ): Promise<{ url: string }> {
    if (oldImageUrl) {
      await this.deleteImage(oldImageUrl);
    }
    return this.uploadImage(file, folder);
  }

  async deleteImage(fileUrl: string): Promise<void> {
    try {
      const filePath = fileUrl.split('/').slice(-2).join('/');
      const { error } = await supabase.storage
        .from('uploads')  // Changed bucket name here too
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      throw new InternalServerErrorException(`Failed to delete file: ${error.message}`);
    }
  }
}
