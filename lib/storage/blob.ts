import { put, del } from '@vercel/blob';

/**
 * Upload file to Vercel Blob Storage
 * @param file - File to upload
 * @param folder - Folder name (e.g., 'images', 'books', 'avatars')
 * @returns Object with url and blobUrl
 */
export async function uploadToBlob(file: File, folder: string) {
  const fileName = `${folder}/${Date.now()}-${file.name}`;
  
  const blob = await put(fileName, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return {
    url: blob.url,
    blobUrl: blob.url,
  };
}

/**
 * Upload buffer to Vercel Blob Storage
 * @param buffer - Buffer to upload
 * @param fileName - Original file name
 * @param folder - Folder name
 * @param contentType - MIME type
 * @returns Object with url and blobUrl
 */
export async function uploadBufferToBlob(
  buffer: Buffer,
  fileName: string,
  folder: string,
  contentType: string
) {
  const blobFileName = `${folder}/${Date.now()}-${fileName}`;
  
  const blob = await put(blobFileName, buffer, {
    access: 'public',
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return {
    url: blob.url,
    blobUrl: blob.url,
  };
}

/**
 * Delete file from Vercel Blob Storage
 * @param url - Full blob URL to delete
 */
export async function deleteFromBlob(url: string) {
  try {
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    console.log(`Deleted blob: ${url}`);
  } catch (error) {
    console.error('Error deleting blob:', url, error);
    throw error;
  }
}

/**
 * Delete multiple files from Vercel Blob Storage
 * @param urls - Array of blob URLs to delete
 */
export async function deleteManyFromBlob(urls: string[]) {
  try {
    await del(urls, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    console.log(`Deleted ${urls.length} blobs`);
  } catch (error) {
    console.error('Error deleting multiple blobs:', error);
    throw error;
  }
}
