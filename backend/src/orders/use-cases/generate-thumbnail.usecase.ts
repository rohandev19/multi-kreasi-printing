import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import { StorageService } from '../../storage/storage.service';
import * as path from 'path';

@Injectable()
export class GenerateThumbnailUseCase {
  private readonly logger = new Logger(GenerateThumbnailUseCase.name);

  constructor(private storage: StorageService) {}

  async execute(
    fileBuffer: Buffer,
    filename: string,
    r2Path: string,
    mimeType: string,
  ): Promise<string | null> {
    const isImage = mimeType === 'image/jpeg' || mimeType === 'image/png';
    if (!isImage) {
      return null;
    }

    try {
      const thumbnailBuffer = await sharp(fileBuffer)
        .resize(300, 300, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();

      const thumbnailPath = r2Path
        .replace('designs/', 'thumbnails/')
        .replace(path.extname(r2Path), '.webp');

      await this.storage.uploadRaw(
        thumbnailPath,
        thumbnailBuffer,
        'image/webp',
      );
      return thumbnailPath;
    } catch (error) {
      this.logger.error(`Failed to generate thumbnail for ${filename}:`, error);
      return null;
    }
  }
}
