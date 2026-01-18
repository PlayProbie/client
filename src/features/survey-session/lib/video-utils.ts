/**
 * Video manipulation utilities
 */

/**
 * Blob에서 특정 구간을 추출하여 새로운 Video Blob을 생성합니다.
 * HTMLVideoElement.captureStream()과 MediaRecorder를 사용하여 재녹화하는 방식입니다.
 *
 * 주의: 실시간 재생 시간만큼 소요됩니다. (예: 5초 구간 추출 시 5초 소요)
 *
 * @param originalBlob 원본 비디오 Blob
 * @param startMs 시작 시간 (ms)
 * @param endMs 종료 시간 (ms)
 * @returns 추출된 새로운 Blob
 */
export async function clipVideoBlob(
  originalBlob: Blob,
  startMs: number,
  endMs: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(originalBlob);
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    // Cleanup function
    const cleanup = () => {
      URL.revokeObjectURL(video.src);
      video.remove();
    };

    video.onloadedmetadata = () => {
      const durationMs = video.duration * 1000;
      if (startMs >= durationMs) {
        cleanup();
        reject(new Error('Start time is out of range'));
        return;
      }

      // Seek to start
      video.currentTime = startMs / 1000;
    };

    video.addEventListener(
      'seeked',
      () => {
        let stream: MediaStream;
        try {
          // @ts-expect-error - captureStream is not yet in standard TS types for all browsers
          stream = video.captureStream
            ? // @ts-expect-error - standard
              video.captureStream()
            : // @ts-expect-error - firefox
              video.mozCaptureStream();
        } catch {
          cleanup();
          reject(new Error('Browser does not support captureStream'));
          return;
        }

        const mimeType = [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8',
          'video/webm',
        ].find((type) => MediaRecorder.isTypeSupported(type));

        if (!mimeType) {
          cleanup();
          reject(new Error('No supported mimeType found for MediaRecorder'));
          return;
        }

        const options: MediaRecorderOptions = { mimeType };
        const recorder = new MediaRecorder(stream, options);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const resultBlob = new Blob(chunks, { type: mimeType });
          cleanup();
          resolve(resultBlob);
        };

        recorder.start();
        video.play();

        const checkTime = () => {
          if (video.currentTime >= endMs / 1000 || video.ended) {
            video.pause();
            recorder.stop();
            video.removeEventListener('timeupdate', checkTime);
          }
        };

        video.addEventListener('timeupdate', checkTime);
      },
      { once: true }
    );

    video.onerror = () => {
      cleanup();
      reject(new Error('Video load error'));
    };
  });
}

export interface VideoSource {
  blob: Blob;
  startOffset: number; // ms
  endOffset: number; // ms
}

/**
 * 여러 Blob을 이어붙여 하나의 Video Blob으로 생성합니다.
 * Canvas를 사용하여 순차적으로 그리는 방식을 사용합니다.
 *
 * @param sources 이어붙일 비디오 소스 목록
 * @returns Stitch된 새로운 Blob
 */
export async function stitchVideoBlobs(sources: VideoSource[]): Promise<Blob> {
  if (sources.length === 0) {
    throw new Error('No sources provided');
  }

  // 1. 캔버스 및 레코더 준비
  const canvas = document.createElement('canvas');
  // 해상도는 360p 고정 (640x360) - 원본 비율과 맞춰야 함
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // 검은 배경
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const stream = canvas.captureStream(30); // 30fps
  const mimeType = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ].find((type) => MediaRecorder.isTypeSupported(type));

  if (!mimeType) {
    throw new Error('No supported mimeType found');
  }

  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.start();

  // 2. 순차 재생 및 그리기
  try {
    for (const source of sources) {
      await playBlobToCanvas(ctx, source);
    }
  } catch (err) {
    recorder.stop();
    throw err;
  }

  // 3. 종료 및 Blob 생성
  return new Promise((resolve) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType }));
    };
    recorder.stop();
  });
}

/**
 * 단일 Blob을 Canvas에 그리는 헬퍼 함수
 */
function playBlobToCanvas(
  ctx: CanvasRenderingContext2D,
  source: VideoSource
): Promise<void> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(source.blob);
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    // Cleanup
    const cleanup = () => {
      URL.revokeObjectURL(video.src);
      video.remove();
    };

    video.onloadedmetadata = () => {
      // Seek to start
      video.currentTime = source.startOffset / 1000;
    };

    video.onseeked = () => {
      video.play();
    };

    const drawFrame = () => {
      if (video.paused || video.ended) return;
      ctx.drawImage(video, 0, 0, ctx.canvas.width, ctx.canvas.height);
      requestAnimationFrame(drawFrame);
    };

    video.onplay = () => {
      drawFrame();
    };

    const checkTime = () => {
      // 종료조건: endOffset 도달 or 영상 끝
      if (video.currentTime >= source.endOffset / 1000 || video.ended) {
        video.pause();
        video.removeEventListener('timeupdate', checkTime);
        cleanup();
        resolve();
      }
    };

    video.addEventListener('timeupdate', checkTime);
    video.onerror = (e) => {
      cleanup();
      reject(e);
    };
  });
}
