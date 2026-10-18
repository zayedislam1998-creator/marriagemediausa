export interface UploadResult {
  fullUrl: string;
  thumbUrl: string;
  blurUrl: string;
  fileName: string;
}

export interface StorageDriver {
  /**
   * Upload an avatar and generate all 3 WebP variants:
   * 1. Full Profile Avatar (800x1000px, quality 85)
   * 2. Card Thumbnail (300x375px, quality 80)
   * 3. Purdah Gaussian Blur (300x375px, blur radius 24, quality 75)
   */
  uploadAvatar(fileBuffer: Buffer, originalName: string): Promise<UploadResult>;

  /**
   * Upload a private identity document (Passport, Green Card, Degree)
   * into protected vault outside public web root
   */
  uploadPrivateKyc(fileBuffer: Buffer, originalName: string): Promise<string>;

  /**
   * Delete an existing media file
   */
  deleteFile(relativeFilePath: string): Promise<boolean>;

  /**
   * Retrieve a readable stream for authenticated streaming of private KYC files
   */
  getPrivateFilePath(relativeFilePath: string): string;
}
