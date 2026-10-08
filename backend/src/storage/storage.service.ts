import { Injectable, Logger } from '@nestjs/common';
import {
  BlobServiceClient,
  ContainerClient,
  BlobSASPermissions,
} from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import CircuitBreaker from 'opossum';

@Injectable()
export class StorageService {
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;
  private readonly containerName: string;
  private readonly logger = new Logger(StorageService.name);
  private uploadBreaker: CircuitBreaker;

  constructor() {
    this.containerName =
      process.env.AZURE_CONTAINER_NAME || 'multi-kreasi-products';

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (connectionString && connectionString !== 'mock') {
      this.blobServiceClient =
        BlobServiceClient.fromConnectionString(connectionString);
      this.containerClient = this.blobServiceClient.getContainerClient(
        this.containerName,
      );
    }

    this.uploadBreaker = new CircuitBreaker(this._azureUpload.bind(this), {
      timeout: 10000, // Timeout after 10s
      errorThresholdPercentage: 50, // Open breaker if 50% fails
      resetTimeout: 30000, // Wait 30s before retrying
    });
    
    this.uploadBreaker.fallback(() => {
      throw new Error('Storage Service (Azure) is currently unavailable. Circuit open.');
    });
  }

  private async _azureUpload(r2Path: string, buffer: Buffer, mimeType: string) {
    const blockBlobClient = this.containerClient.getBlockBlobClient(r2Path);
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });
    return { url: blockBlobClient.url, r2Path };
  }

  private isMock(): boolean {
    return (
      !process.env.AZURE_STORAGE_CONNECTION_STRING ||
      process.env.AZURE_STORAGE_CONNECTION_STRING === 'mock'
    );
  }

  async uploadFile(
    file: Express.Multer.File,
    pathPrefix: string,
  ): Promise<{ url: string; r2Path: string }> {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(
        'Tipe file tidak diizinkan. Hanya JPG, PNG, dan WebP yang didukung.',
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Ukuran file maksimal 5MB.');
    }

    const extension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${extension}`;
    const r2Path = `${pathPrefix}/${fileName}`;

    try {
      if (this.isMock()) {
        const localDir = path.join(process.cwd(), 'public', pathPrefix);
        if (!fs.existsSync(localDir)) {
          fs.mkdirSync(localDir, { recursive: true });
        }
        const localFilePath = path.join(process.cwd(), 'public', r2Path);
        fs.writeFileSync(localFilePath, file.buffer);
        const baseUrl =
          process.env.PUBLIC_API_URL ||
          `http://localhost:${process.env.PORT || 3000}`;
        const url = `${baseUrl}/public/${r2Path}`;
        return { url, r2Path };
      }

      return await this.uploadBreaker.fire(r2Path, file.buffer, file.mimetype) as { url: string; r2Path: string };
    } catch (error) {
      this.logger.error('Failed to upload file to Azure', error);
      throw new Error('Gagal mengupload gambar produk');
    }
  }

  async uploadRaw(
    r2Path: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<{ url: string; r2Path: string }> {
    try {
      if (this.isMock()) {
        const pathPrefix = path.dirname(r2Path);
        const localDir = path.join(process.cwd(), 'public', pathPrefix);
        if (!fs.existsSync(localDir)) {
          fs.mkdirSync(localDir, { recursive: true });
        }
        const localFilePath = path.join(process.cwd(), 'public', r2Path);
        fs.writeFileSync(localFilePath, buffer);
        const baseUrl =
          process.env.PUBLIC_API_URL ||
          `http://localhost:${process.env.PORT || 3000}`;
        const url = `${baseUrl}/public/${r2Path}`;
        return { url, r2Path };
      }

      return await this.uploadBreaker.fire(r2Path, buffer, mimeType) as { url: string; r2Path: string };
    } catch (error) {
      throw new Error(`Gagal mengupload file: ${(error as Error).message}`);
    }
  }

  async getSignedUrl(r2Path: string): Promise<string> {
    if (this.isMock()) {
      const baseUrl =
        process.env.PUBLIC_API_URL ||
        `http://localhost:${process.env.PORT || 3000}`;
      return `${baseUrl}/public/${r2Path}`;
    }
    const blockBlobClient = this.containerClient.getBlockBlobClient(r2Path);

    // Ensure we are using SAS auth for secure downloads
    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse('r'),
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour
    });

    return sasUrl;
  }

  async getPresignedUploadUrl(r2Path: string): Promise<string> {
    if (this.isMock()) {
      const baseUrl =
        process.env.PUBLIC_API_URL ||
        `http://localhost:${process.env.PORT || 3000}`;
      return `${baseUrl}/api/v1/mock-storage/upload?path=${encodeURIComponent(r2Path)}`;
    }
    const blockBlobClient = this.containerClient.getBlockBlobClient(r2Path);

    // Generate SAS URL with write permissions
    const sasUrl = await blockBlobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse('cw'), // create & write
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour
    });

    return sasUrl;
  }

  async deleteFile(r2Path: string): Promise<void> {
    try {
      if (this.isMock()) {
        const localFilePath = path.join(process.cwd(), 'public', r2Path);
        if (fs.existsSync(localFilePath)) {
          fs.unlinkSync(localFilePath);
        }
        return;
      }

      const blockBlobClient = this.containerClient.getBlockBlobClient(r2Path);
      await blockBlobClient.deleteIfExists();
    } catch (error) {
      this.logger.warn(
        `Gagal menghapus file dari Azure (${r2Path}), record DB akan tetap dihapus: ${(error as Error).message}`,
      );
    }
  }
}
