import { v2 as cloudinary } from 'cloudinary';
import { env } from '@/lib/env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export type CloudinaryUploadResponse = {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  [key: string]: unknown;
};

/**
 * Uploads a file buffer or base64 string to Cloudinary.
 * @param fileData - The file as a buffer or base64 string.
 * @param folder - The folder in Cloudinary where the image should be stored.
 */
export async function uploadToCloudinary(
  fileData: string | Buffer,
  folder: string = 'event-posters'
): Promise<CloudinaryUploadResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        if (!result) {
          return reject(new Error('Cloudinary upload failed: No result returned'));
        }
        resolve(result as CloudinaryUploadResponse);
      }
    );

    // If it's a buffer, write it to the stream
    if (Buffer.isBuffer(fileData)) {
      uploadStream.end(fileData);
    } else {
      // If it's a base64 string or URL, we can use the upload method directly
      // but if it's a string from a form, we usually need to convert to buffer or handle it
      // For simplicity in our actions, we'll likely pass a buffer.
      cloudinary.uploader.upload(fileData, { folder, resource_type: 'auto' })
        .then(res => resolve(res as CloudinaryUploadResponse))
        .catch(err => reject(err));
    }
  });
}

export async function deleteFromCloudinary(url: string) {
  try {
    // Standard Cloudinary URL: https://res.cloudinary.com/cloud_name/image/upload/v123456789/folder/image_id.jpg
    const parts = url.split('/')
    const uploadIndex = parts.indexOf('upload')
    if (uploadIndex === -1) return { error: 'Invalid URL: No upload segment found' }
    
    // The segments after /upload/
    const relevantSegments = parts.slice(uploadIndex + 1)
    
    // Skip the version segment if it exists (e.g., v123456789)
    if (relevantSegments[0].startsWith('v') && /^\d+$/.test(relevantSegments[0].substring(1))) {
       relevantSegments.shift()
    }
    
    // Join remaining segments and remove file extension to get the public_id
    const publicIdWithExtension = relevantSegments.join('/')
    const publicId = publicIdWithExtension.split('.')[0]
    
    if (!publicId) return { error: 'Invalid URL: Could not extract public ID' }

    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (err: unknown) {
    console.error('Cloudinary deletion error:', err)
    const message = err instanceof Error ? err.message : 'Unknown deletion error'
    return { error: message }
  }
}

export default cloudinary;
