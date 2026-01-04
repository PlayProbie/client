/**
 * S3 업로드 API
 * PUT uploadUrl (presigned URL로 직접 업로드)
 */
import axios, { type AxiosProgressEvent } from 'axios';

export interface S3UploadOptions {
  file: File;
  uploadUrl: string;
  onProgress?: (event: AxiosProgressEvent) => void;
  signal?: AbortSignal;
}

/** S3 직접 업로드 (Presigned URL 사용) */
export async function putS3Upload({
  file,
  uploadUrl,
  onProgress,
  signal,
}: S3UploadOptions): Promise<void> {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': 'application/zip',
    },
    onUploadProgress: onProgress,
    signal,
  });
}
