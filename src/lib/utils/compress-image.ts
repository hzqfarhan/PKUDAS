/**
 * Client-side image compression utility.
 * Accepts a File, validates size (max 10MB), resizes to max 400×400,
 * and compresses to JPEG at quality 0.7 (~50-200KB output).
 * Returns a base64 data URL string.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 400;
const JPEG_QUALITY = 0.7;

export interface CompressResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
}

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Please select an image file (JPEG, PNG, WebP, etc.)';
  }
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return `File is too large (${sizeMB}MB). Maximum allowed size is 10MB.`;
  }
  return null;
}

export function compressImage(file: File): Promise<CompressResult> {
  return new Promise((resolve, reject) => {
    const error = validateImageFile(file);
    if (error) {
      reject(new Error(error));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Scale down to fit within MAX_DIMENSION while preserving aspect ratio
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = Math.round((height / width) * MAX_DIMENSION);
              width = MAX_DIMENSION;
            } else {
              width = Math.round((width / height) * MAX_DIMENSION);
              height = MAX_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // Draw with smooth scaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
          
          // Estimate compressed size from base64 string
          const base64Length = dataUrl.split(',')[1]?.length || 0;
          const compressedSize = Math.round((base64Length * 3) / 4);

          resolve({
            dataUrl,
            originalSize: file.size,
            compressedSize,
          });
        } catch (err) {
          reject(err instanceof Error ? err : new Error('Compression failed'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
