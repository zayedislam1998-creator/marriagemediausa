import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { StorageDriver, UploadResult } from './types';

export class LocalStorageDriver implements StorageDriver {
  private publicUploadDir = path.join(process.cwd(), 'public', 'uploads');
  private privateKycDir = path.join(process.cwd(), 'uploads', 'private', 'kyc');

  constructor() {
    this.ensureDirectories().catch((err) => {
      console.error('Failed to create storage directories:', err);
    });
  }

  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(path.join(this.publicUploadDir, 'avatars'), { recursive: true });
    await fs.mkdir(path.join(this.publicUploadDir, 'thumbnails'), { recursive: true });
    await fs.mkdir(path.join(this.publicUploadDir, 'blurred'), { recursive: true });
    await fs.mkdir(this.privateKycDir, { recursive: true });
  }

  public async uploadAvatar(fileBuffer: Buffer, originalName: string): Promise<UploadResult> {
    await this.ensureDirectories();

    const fileId = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const baseName = `${fileId}.webp`;

    const avatarPath = path.join(this.publicUploadDir, 'avatars', baseName);
    const thumbPath = path.join(this.publicUploadDir, 'thumbnails', baseName);
    const blurPath = path.join(this.publicUploadDir, 'blurred', baseName);

    // 1. Process Full Avatar (Strip EXIF, 800x1000 WebP)
    await sharp(fileBuffer)
      .rotate() // Auto-orient based on EXIF before stripping
      .resize(800, 1000, { fit: 'cover', position: 'top' })
      .webp({ quality: 85 })
      .toFile(avatarPath);

    // 2. Process Card Thumbnail (300x375 WebP)
    await sharp(fileBuffer)
      .rotate()
      .resize(300, 375, { fit: 'cover', position: 'top' })
      .webp({ quality: 80 })
      .toFile(thumbPath);

    // 3. Process Purdah Gaussian Blur (Modesty Privacy Shield)
    // Heavy 24px blur completely obscuring facial features while maintaining aesthetic silhouette
    await sharp(fileBuffer)
      .rotate()
      .resize(300, 375, { fit: 'cover', position: 'top' })
      .blur(24)
      .webp({ quality: 75 })
      .toFile(blurPath);

    return {
      fullUrl: `/uploads/avatars/${baseName}`,
      thumbUrl: `/uploads/thumbnails/${baseName}`,
      blurUrl: `/uploads/blurred/${baseName}`,
      fileName: baseName,
    };
  }

  public async uploadPrivateKyc(fileBuffer: Buffer, originalName: string): Promise<string> {
    await this.ensureDirectories();

    const fileId = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const ext = path.extname(originalName) || '.pdf';
    const safeName = `kyc_${fileId}${ext}`;
    const destinationPath = path.join(this.privateKycDir, safeName);

    await fs.writeFile(destinationPath, fileBuffer);
    return `/private/kyc/${safeName}`;
  }

  public async deleteFile(relativeFilePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(process.cwd(), 'public', relativeFilePath);
      await fs.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  public getPrivateFilePath(relativeFilePath: string): string {
    const fileName = path.basename(relativeFilePath);
    return path.join(this.privateKycDir, fileName);
  }
}

// Singleton storage instance
export const storageDriver: StorageDriver = new LocalStorageDriver();
