import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import Constants from 'expo-constants';

// Read Cloudinary config from app.config.js extra (sourced from .env)
const extra = Constants.expoConfig?.extra ?? {};
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${extra.cloudinaryCloudName}/image/upload`;
const UPLOAD_PRESET = extra.cloudinaryUploadPreset || '';

// Max dimensions for receipt images (keeps file size small)
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1600;

export const cloudinaryService = {
  /**
   * Compress an image by resizing and reducing quality.
   * Returns the URI of the compressed image.
   */
  async compressImage(fileUri: string): Promise<string> {
    try {
      const compressed = await manipulateAsync(
        fileUri,
        [{ resize: { width: MAX_WIDTH } }],
        {
          compress: 0.6, // 60% quality — good balance of size vs clarity
          format: SaveFormat.JPEG,
        }
      );
      return compressed.uri;
    } catch (error) {
      console.error('Image compression error:', error);
      // Fall back to original if compression fails
      return fileUri;
    }
  },

  /**
   * Upload an image to Cloudinary.
   * Automatically compresses the image first to reduce upload size.
   */
  async uploadImage(fileUri: string): Promise<string> {
    try {
      // Step 1: Compress the image
      const compressedUri = await this.compressImage(fileUri);

      // Step 2: Upload via FormData
      const formData = new FormData();

      formData.append('file', {
        uri: compressedUri,
        type: 'image/jpeg',
        name: `receipt_${Date.now()}.jpg`,
      } as any);

      formData.append('upload_preset', UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (responseData.secure_url) {
        return responseData.secure_url;
      } else {
        throw new Error(responseData.error?.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }
};
