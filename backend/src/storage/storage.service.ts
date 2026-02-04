import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicDomain: string;
  private readonly logger = new Logger(StorageService.name);

  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME || 'multi-kreasi-products';
    this.publicDomain = process.env.R2_PUBLIC_DOMAIN || 'https://assets.multikreasiprinting.com';

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT || 'https://mock.r2.cloudflarestorage.com',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || 'mock',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'mock',
      },
    });
  }

  async uploadFile(file: Express.Multer.File, pathPrefix: string): Promise<{ url: string; r2Path: string }> {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error('Tipe file tidak diizinkan. Hanya JPG, PNG, dan WebP yang didukung.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Ukuran file maksimal 5MB.');
    }

    const extension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${extension}`;
    const r2Path = `${pathPrefix}/${fileName}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: r2Path,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
      );

      const url = `${this.publicDomain}/${r2Path}`;
      return { url, r2Path };
    } catch (error) {
      this.logger.error('Failed to upload file to R2', error);
      throw new Error('Gagal mengupload gambar produk');
    }
  }

  async uploadRaw(r2Path: string, buffer: Buffer, mimeType: string): Promise<{ url: string; r2Path: string }> {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: r2Path,
          Body: buffer,
          ContentType: mimeType,
        }),
      );

      return {
        url: `${this.publicDomain}/${r2Path}`,
        r2Path,
      };
    } catch (error) {
      throw new Error(`Gagal mengupload file: ${(error as Error).message}`);
    }
  }

  async getSignedUrl(r2Path: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: r2Path,
    });
    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
