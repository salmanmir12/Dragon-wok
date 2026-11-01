import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

export interface ImageUploadProgress {
  progress: number; // 0 to 100
  status: 'idle' | 'compressing' | 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

/**
 * Validates the image file format and size.
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Unsupported file format. Please upload JPG, PNG, or WEBP images only.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Maximum allowed size is 5 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Compresses/resizes an image client-side to ensure fast loading on mobile networks and optimal storage.
 */
export async function optimizeImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<Blob> {
  // If it is already small and a webp/jpeg, return as-is
  if (file.size < 400 * 1024 && (file.type === 'image/jpeg' || file.type === 'image/webp')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // Fallback to raw file if canvas fails
    };

    img.src = objectUrl;
  });
}

/**
 * Uploads an image to Firebase Storage and returns the permanent public download URL.
 */
export async function uploadDishImage(
  file: File,
  itemId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  // 1. Optimize image before upload
  const optimizedBlob = await optimizeImage(file);

  // 2. Generate clean storage filename
  const cleanId = (itemId || 'dish').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const filename = `${cleanId}_${Date.now()}.jpg`;
  const storageRef = ref(storage, `menu_images/${filename}`);

  // 3. Resumable upload with progress tracking
  const uploadTask = uploadBytesResumable(storageRef, optimizedBlob, {
    contentType: 'image/jpeg',
    customMetadata: {
      dishId: itemId,
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        reject(new Error(`Image upload failed: ${error.message}`));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (urlError: any) {
          reject(new Error(`Failed to retrieve download URL: ${urlError.message}`));
        }
      }
    );
  });
}

/**
 * Deletes an image from Firebase Storage if it was uploaded there.
 */
export async function deleteDishImage(imageUrl?: string): Promise<void> {
  if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) {
    return; // Do nothing if local static asset or external URL
  }

  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (error: any) {
    // If file doesn't exist or already removed, ignore error
    console.warn('Note: Could not delete old image from storage:', error.message);
  }
}
