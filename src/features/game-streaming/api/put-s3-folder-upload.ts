/**
 * S3 폴더 업로드 API
 * AWS SDK를 사용하여 폴더 내 파일들을 S3에 재귀적으로 업로드
 */
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import type { AwsCredentials, FolderUploadProgress } from '../types';

export interface FolderUploadOptions {
  files: File[];
  bucket: string;
  keyPrefix: string;
  credentials: AwsCredentials;
  region?: string;
  onProgress?: (progress: FolderUploadProgress) => void;
  signal?: AbortSignal;
}

/** 폴더 내 파일들을 S3에 업로드 */
export async function putS3FolderUpload({
  files,
  bucket,
  keyPrefix,
  credentials,
  region = 'ap-northeast-2',
  onProgress,
  signal,
}: FolderUploadOptions): Promise<void> {
  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
  });

  const totalFiles = files.length;
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  let uploadedFiles = 0;
  let uploadedBytes = 0;
  const startTime = Date.now();

  for (const file of files) {
    if (signal?.aborted) {
      throw new DOMException('Upload cancelled', 'AbortError');
    }

    // webkitRelativePath에서 폴더명 제거하여 상대 경로 추출
    const relativePath = file.webkitRelativePath
      ? file.webkitRelativePath.split('/').slice(1).join('/')
      : file.name;

    const key = `${keyPrefix}/${relativePath}`;

    // 파일 내용 읽기
    const arrayBuffer = await file.arrayBuffer();
    const body = new Uint8Array(arrayBuffer);

    // S3에 업로드
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: file.type || 'application/octet-stream',
    });

    await s3Client.send(command, { abortSignal: signal });

    // 진행률 업데이트
    uploadedFiles++;
    uploadedBytes += file.size;

    const elapsed = (Date.now() - startTime) / 1000;
    const speed = elapsed > 0 ? uploadedBytes / elapsed : 0;
    const remaining = totalBytes - uploadedBytes;
    const eta = speed > 0 ? remaining / speed : 0;
    const percent = Math.round((uploadedBytes / totalBytes) * 100);

    onProgress?.({
      totalFiles,
      uploadedFiles,
      totalBytes,
      uploadedBytes,
      percent,
      speed,
      eta,
      currentFileName: relativePath,
    });
  }
}
