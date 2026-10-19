import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';

export interface MediaItem {
  id: string;
  name: string;
  originalName: string;
  url: string;
  thumbUrl: string;
  blurUrl: string;
  sizeBytes: number;
  formattedSize: string;
  width?: number;
  height?: number;
  mimeType: string;
  category: 'avatar' | 'gallery' | 'document' | 'general';
  createdAt: string;
}

const PUBLIC_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const MANIFEST_PATH = path.join(PUBLIC_UPLOADS_DIR, 'media-manifest.json');

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export class MediaService {
  private static async ensureDirectories() {
    await fs.mkdir(path.join(PUBLIC_UPLOADS_DIR, 'avatars'), { recursive: true });
    await fs.mkdir(path.join(PUBLIC_UPLOADS_DIR, 'thumbnails'), { recursive: true });
    await fs.mkdir(path.join(PUBLIC_UPLOADS_DIR, 'blurred'), { recursive: true });
    await fs.mkdir(path.join(PUBLIC_UPLOADS_DIR, 'general'), { recursive: true });
  }

  private static async readManifest(): Promise<MediaItem[]> {
    await this.ensureDirectories();
    try {
      const data = await fs.readFile(MANIFEST_PATH, 'utf-8');
      return JSON.parse(data) as MediaItem[];
    } catch {
      return [];
    }
  }

  private static async writeManifest(items: MediaItem[]): Promise<void> {
    await this.ensureDirectories();
    await fs.writeFile(MANIFEST_PATH, JSON.stringify(items, null, 2), 'utf-8');
  }

  /**
   * Scans existing images on disk in public/uploads/ and reconciles with manifest
   */
  public static async listMedia(): Promise<MediaItem[]> {
    await this.ensureDirectories();
    const manifestItems = await this.readManifest();
    const manifestMap = new Map<string, MediaItem>(manifestItems.map((item) => [item.name, item]));

    // Read files in public/uploads/avatars to ensure nothing is missing
    try {
      const avatarDir = path.join(PUBLIC_UPLOADS_DIR, 'avatars');
      const files = await fs.readdir(avatarDir);

      let updated = false;
      for (const file of files) {
        if (!file.endsWith('.webp') && !file.endsWith('.jpg') && !file.endsWith('.png')) continue;
        if (!manifestMap.has(file)) {
          const filePath = path.join(avatarDir, file);
          try {
            const stat = await fs.stat(filePath);
            const metadata = await sharp(filePath).metadata().catch(() => ({ width: 800, height: 1000 }));

            const newItem: MediaItem = {
              id: `media_${path.parse(file).name}`,
              name: file,
              originalName: file,
              url: `/uploads/avatars/${file}`,
              thumbUrl: `/uploads/thumbnails/${file}`,
              blurUrl: `/uploads/blurred/${file}`,
              sizeBytes: stat.size,
              formattedSize: formatBytes(stat.size),
              width: metadata.width || 800,
              height: metadata.height || 1000,
              mimeType: 'image/webp',
              category: 'avatar',
              createdAt: stat.birthtime ? stat.birthtime.toISOString() : new Date().toISOString(),
            };

            manifestItems.push(newItem);
            manifestMap.set(file, newItem);
            updated = true;
          } catch {
            // Ignore unreadable file
          }
        }
      }

      // Check root public/uploads for direct webp/jpg files
      const rootFiles = await fs.readdir(PUBLIC_UPLOADS_DIR);
      for (const file of rootFiles) {
        if (!file.endsWith('.webp') && !file.endsWith('.jpg') && !file.endsWith('.png')) continue;
        if (!manifestMap.has(file)) {
          const filePath = path.join(PUBLIC_UPLOADS_DIR, file);
          try {
            const stat = await fs.stat(filePath);
            const metadata = await sharp(filePath).metadata().catch(() => ({ width: 600, height: 800 }));

            const newItem: MediaItem = {
              id: `media_${path.parse(file).name}`,
              name: file,
              originalName: file,
              url: `/uploads/${file}`,
              thumbUrl: `/uploads/${file}`,
              blurUrl: `/uploads/${file}`,
              sizeBytes: stat.size,
              formattedSize: formatBytes(stat.size),
              width: metadata.width || 600,
              height: metadata.height || 800,
              mimeType: 'image/webp',
              category: 'gallery',
              createdAt: stat.birthtime ? stat.birthtime.toISOString() : new Date().toISOString(),
            };

            manifestItems.push(newItem);
            manifestMap.set(file, newItem);
            updated = true;
          } catch {
            // Ignore unreadable
          }
        }
      }

      if (updated) {
        await this.writeManifest(manifestItems);
      }
    } catch (err) {
      console.error('Error scanning uploads directory:', err);
    }

    // Sort newest first
    return manifestItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Upload and process image into 3 Sharp WebP variants with instant metadata
   */
  public static async uploadMedia(
    buffer: Buffer,
    originalName: string,
    category: 'avatar' | 'gallery' | 'document' | 'general' = 'avatar'
  ): Promise<MediaItem> {
    await this.ensureDirectories();

    const fileId = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    const baseName = `${fileId}.webp`;

    const avatarPath = path.join(PUBLIC_UPLOADS_DIR, 'avatars', baseName);
    const thumbPath = path.join(PUBLIC_UPLOADS_DIR, 'thumbnails', baseName);
    const blurPath = path.join(PUBLIC_UPLOADS_DIR, 'blurred', baseName);

    // 1. Process Full Avatar (Strip EXIF, Max 1000px, WebP Q85)
    const processedMain = await sharp(buffer)
      .rotate()
      .resize(800, 1000, { fit: 'cover', position: 'top' })
      .webp({ quality: 85 })
      .toFile(avatarPath);

    // 2. Process Card Thumbnail (300x375 WebP Q80)
    await sharp(buffer)
      .rotate()
      .resize(300, 375, { fit: 'cover', position: 'top' })
      .webp({ quality: 80 })
      .toFile(thumbPath);

    // 3. Process Purdah Gaussian Blur (Modesty Shield, 24px Blur)
    await sharp(buffer)
      .rotate()
      .resize(300, 375, { fit: 'cover', position: 'top' })
      .blur(24)
      .webp({ quality: 75 })
      .toFile(blurPath);

    const newItem: MediaItem = {
      id: `media_${fileId}`,
      name: baseName,
      originalName,
      url: `/uploads/avatars/${baseName}`,
      thumbUrl: `/uploads/thumbnails/${baseName}`,
      blurUrl: `/uploads/blurred/${baseName}`,
      sizeBytes: processedMain.size,
      formattedSize: formatBytes(processedMain.size),
      width: processedMain.width,
      height: processedMain.height,
      mimeType: 'image/webp',
      category,
      createdAt: new Date().toISOString(),
    };

    const currentItems = await this.readManifest();
    currentItems.unshift(newItem);
    await this.writeManifest(currentItems);

    return newItem;
  }

  /**
   * Delete media item and all its generated variants from disk
   */
  public static async deleteMedia(idOrName: string): Promise<boolean> {
    const items = await this.readManifest();
    const itemIndex = items.findIndex((item) => item.id === idOrName || item.name === idOrName);

    if (itemIndex === -1) {
      return false;
    }

    const item = items[itemIndex];
    const baseName = item.name;

    // Delete files safely
    const pathsToDelete = [
      path.join(PUBLIC_UPLOADS_DIR, 'avatars', baseName),
      path.join(PUBLIC_UPLOADS_DIR, 'thumbnails', baseName),
      path.join(PUBLIC_UPLOADS_DIR, 'blurred', baseName),
      path.join(PUBLIC_UPLOADS_DIR, baseName),
    ];

    for (const filePath of pathsToDelete) {
      try {
        await fs.unlink(filePath);
      } catch {
        // File may not exist in all folders, ignore
      }
    }

    items.splice(itemIndex, 1);
    await this.writeManifest(items);
    return true;
  }
}
