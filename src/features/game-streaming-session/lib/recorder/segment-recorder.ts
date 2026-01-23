/**
 * Segment Recorder
 *
 * video -> canvas(360p) -> MediaRecorder
 * 30s core + 3s overlap on both sides (first segment is trailing overlap only)
 */
import {
  DEFAULT_FRAME_RATE,
  DEFAULT_OVERLAP_MS,
  DEFAULT_SEGMENT_DURATION_MS,
  DEFAULT_TARGET_HEIGHT,
  DEFAULT_TIMESLICE_MS,
} from './segment-recorder.constants';
import {
  createSegmentMeta,
  ensureCanvasCaptureSupported,
  getMediaTimeMs,
  getVideoDimensions,
  selectSupportedMimeType,
  waitForVideoMetadata,
} from './segment-recorder.support';
import { computeSegmentTiming } from './segment-recorder.timing';
import type {
  SegmentRecorderOptions,
  SegmentTiming,
} from './segment-recorder.types';

export class SegmentRecorder {
  private readonly options: Required<
    Omit<
      SegmentRecorderOptions,
      | 'onSegmentReady'
      | 'onSegmentStart'
      | 'onSegmentChunk'
      | 'onError'
      | 'onUnsupported'
    >
  > &
    Pick<
      SegmentRecorderOptions,
      | 'onSegmentReady'
      | 'onSegmentStart'
      | 'onSegmentChunk'
      | 'onError'
      | 'onUnsupported'
    >;
  private readonly mimeType: string | null;
  private readonly canvas: HTMLCanvasElement | null;
  private readonly canvasContext: CanvasRenderingContext2D | null;
  private stream: MediaStream | null;
  private isRecording = false;
  private segmentIndex = 0;
  private drawHandle: number | null = null;
  private nextSegmentTimer: number | null = null;
  private readonly activeRecorders = new Map<string, MediaRecorder>();
  private readonly activeStopTimers = new Map<string, number>();
  private readonly segmentTimings: SegmentTiming[] = [];
  private readonly pendingSegments = new Map<
    string,
    { resolve: () => void; reject: (error: Error) => void }
  >();

  constructor(options: SegmentRecorderOptions) {
    this.options = {
      enabled: options.enabled ?? true,
      segmentDurationMs:
        options.segmentDurationMs ?? DEFAULT_SEGMENT_DURATION_MS,
      overlapMs: options.overlapMs ?? DEFAULT_OVERLAP_MS,
      targetHeight: options.targetHeight ?? DEFAULT_TARGET_HEIGHT,
      frameRate: options.frameRate ?? DEFAULT_FRAME_RATE,
      timesliceMs: options.timesliceMs ?? DEFAULT_TIMESLICE_MS,
      ...options,
    };

    this.mimeType = selectSupportedMimeType();

    if (!ensureCanvasCaptureSupported() || !this.mimeType) {
      this.canvas = null;
      this.canvasContext = null;
      this.stream = null;
      return;
    }

    this.canvas = document.createElement('canvas');
    this.canvasContext = this.canvas.getContext('2d');
    this.stream = null;
  }

  async start(): Promise<void> {
    if (!this.options.enabled || this.isRecording) {
      return;
    }

    if (!this.mimeType || !this.canvas || !this.canvasContext) {
      this.options.onUnsupported?.('MediaRecorder 또는 Canvas 캡처 미지원');
      return;
    }

    if (!this.options.videoElement) {
      this.options.onError?.(new Error('videoElement가 필요합니다.'));
      return;
    }

    try {
      await waitForVideoMetadata(this.options.videoElement);
      this.setupCanvas();
      this.isRecording = true; // MUST be set before startDrawing()
      this.segmentIndex = 0;
      this.segmentTimings.length = 0;
      this.startDrawing();
      this.startSegment();
    } catch (error) {
      this.options.onError?.(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  stop(): void {
    if (!this.isRecording) return;

    this.isRecording = false;
    this.stopDrawing();

    if (this.nextSegmentTimer) {
      clearTimeout(this.nextSegmentTimer);
      this.nextSegmentTimer = null;
    }

    this.activeStopTimers.forEach((timerId) => {
      clearTimeout(timerId);
    });
    this.activeStopTimers.clear();

    this.activeRecorders.forEach((recorder) => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    });
    this.activeRecorders.clear();
  }

  /**
   * 현재 활성화된 모든 레코더를 즉시 stop하고,
   * 모든 onSegmentReady 콜백이 완료될 때까지 기다립니다.
   * 게임 종료 시 마지막 세그먼트가 유실되지 않도록 사용합니다.
   */
  async finalize(): Promise<void> {
    if (!this.isRecording) return;

    this.isRecording = false;
    this.stopDrawing();

    // 다음 세그먼트 타이머 취소
    if (this.nextSegmentTimer) {
      clearTimeout(this.nextSegmentTimer);
      this.nextSegmentTimer = null;
    }

    // 예약된 stop 타이머 취소 (수동으로 stop 호출)
    this.activeStopTimers.forEach((timerId) => clearTimeout(timerId));
    this.activeStopTimers.clear();

    // 활성 레코더가 없으면 바로 반환
    if (this.activeRecorders.size === 0) return;

    // 모든 활성 레코더 stop 및 완료 대기
    const promises: Promise<void>[] = [];
    this.activeRecorders.forEach((recorder, segmentId) => {
      if (recorder.state !== 'inactive') {
        const promise = new Promise<void>((resolve, reject) => {
          this.pendingSegments.set(segmentId, { resolve, reject });
        });
        promises.push(promise);
        recorder.stop();
      }
    });

    await Promise.all(promises);
  }

  getActiveSegmentIds(mediaTimeMs: number): string[] {
    if (this.segmentTimings.length === 0) return [];

    const active = this.segmentTimings.filter(
      (segment) =>
        mediaTimeMs >= segment.recordStartMs &&
        mediaTimeMs <= segment.recordEndMs
    );

    const sorted = active.sort((a, b) => a.recordStartMs - b.recordStartMs);

    return sorted.map((segment) => segment.segmentId);
  }

  private setupCanvas(): void {
    if (!this.canvas || !this.options.videoElement) return;
    const { width, height } = getVideoDimensions(
      this.options.videoElement,
      this.options.targetHeight
    );
    this.canvas.width = width;
    this.canvas.height = height;
  }

  private startDrawing(): void {
    if (!this.canvas || !this.canvasContext || !this.options.videoElement) {
      return;
    }

    const drawFrame = () => {
      if (!this.isRecording || !this.canvas || !this.canvasContext) return;
      this.canvasContext.drawImage(
        this.options.videoElement,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.drawHandle = window.requestAnimationFrame(drawFrame);
    };

    drawFrame();
  }

  private stopDrawing(): void {
    if (this.drawHandle == null) return;
    if (
      this.options.videoElement &&
      typeof this.options.videoElement.cancelVideoFrameCallback === 'function'
    ) {
      this.options.videoElement.cancelVideoFrameCallback(this.drawHandle);
    } else {
      window.cancelAnimationFrame(this.drawHandle);
    }
    this.drawHandle = null;
  }

  private startSegment(): void {
    if (!this.isRecording || !this.canvas || !this.mimeType) return;
    const mimeType = this.mimeType;

    const videoElement = this.options.videoElement;
    const recordStartMs = getMediaTimeMs(videoElement);
    const timingResult = computeSegmentTiming({
      segmentIndex: this.segmentIndex,
      recordStartMs,
      segmentDurationMs: this.options.segmentDurationMs,
      overlapMs: this.options.overlapMs,
    });

    const segmentId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `seg_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const timing: SegmentTiming = {
      segmentId,
      recordStartMs,
      recordEndMs: timingResult.recordEndMs,
      coreStartMs: timingResult.coreStartMs,
      coreEndMs: timingResult.coreEndMs,
    };

    this.segmentTimings.push(timing);
    this.options.onSegmentStart?.(timing);

    if (!this.canvas.captureStream) {
      this.options.onUnsupported?.('canvas.captureStream 미지원');
      return;
    }

    const stream =
      this.stream ?? this.canvas.captureStream(this.options.frameRate);
    if (!this.stream) {
      this.stream = stream;
    }

    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
        if (this.options.onSegmentChunk) {
          void Promise.resolve(
            this.options.onSegmentChunk(segmentId, event.data)
          ).catch((error) => {
            const err =
              error instanceof Error ? error : new Error(String(error));
            this.options.onError?.(err);
          });
        }
      }
    };

    recorder.onerror = () => {
      this.options.onError?.(
        new Error('세그먼트 녹화 중 오류가 발생했습니다.')
      );
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType || undefined });
      const meta = createSegmentMeta({
        segmentId,
        sessionId: this.options.sessionId,
        coreStartMs: timing.coreStartMs,
        coreEndMs: timing.coreEndMs,
        overlapMs: this.options.overlapMs,
        fileSize: blob.size,
      });

      this.activeRecorders.delete(segmentId);
      this.activeStopTimers.delete(segmentId);

      // onSegmentReady 완료 후 pending promise resolve
      const pending = this.pendingSegments.get(segmentId);
      Promise.resolve(
        this.options.onSegmentReady({
          segmentId,
          blob,
          mimeType,
          meta,
          timing,
        })
      )
        .then(() => {
          pending?.resolve();
        })
        .catch((error) => {
          pending?.reject(
            error instanceof Error ? error : new Error(String(error))
          );
        })
        .finally(() => {
          this.pendingSegments.delete(segmentId);
        });
    };

    const timeslice = this.options.timesliceMs;
    if (typeof timeslice === 'number' && timeslice > 0) {
      recorder.start(timeslice);
    } else {
      recorder.start();
    }
    this.activeRecorders.set(segmentId, recorder);

    const stopTimer = window.setTimeout(() => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    }, timingResult.recordDurationMs);
    this.activeStopTimers.set(segmentId, stopTimer);

    this.segmentIndex += 1;

    this.nextSegmentTimer = window.setTimeout(
      () => this.startSegment(),
      timingResult.nextSegmentDelayMs
    );
  }
}
