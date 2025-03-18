import { Injectable } from '@nestjs/common';
import cloudinary from './cloudinary.config';
import { UploadApiResponse } from 'cloudinary';
import { Multer } from 'multer';

@Injectable()
export class UploadService {
  async uploadImage(
    file: Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: 'auto',
            folder: `eureka-leran/${folder}`,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          },
        )
        .end(file.buffer);
    });
  }

  async updateImage(
    file: Multer.File,
    folder: string,
    oldImageUrl?: string,
  ): Promise<UploadApiResponse> {
    if (oldImageUrl) {
      await this.deleteImage(oldImageUrl);
    }

    return this.uploadImage(file, folder);
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const publicId = imageUrl
        .split('/')
        .slice(-2)
        .join('/')
        .split('.')[0];

      await cloudinary.uploader.destroy(`edm/${publicId}`);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      throw error;
    }
  }
}
