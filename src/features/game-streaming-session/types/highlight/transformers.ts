import type { ApiInsightTag, InsightTag } from './insight-tags';
import type { ClientSegmentMeta, SegmentMeta } from './segments';
import type { ApiPresignedUrlResponse } from './upload';

// ============================================
// Transformers
// ============================================

/** SegmentMeta → ClientSegmentMeta 변환 */
export function toClientSegmentMeta(api: SegmentMeta): ClientSegmentMeta {
  return {
    segmentId: api.segment_id,
    sessionId: api.session_id,
    startMediaTime: api.start_media_time,
    endMediaTime: api.end_media_time,
    uploadStatus: api.upload_status,
    overlapMs: api.overlap_ms,
    fileSize: api.file_size,
    createdAt: api.created_at,
    uploadedAt: api.uploaded_at,
  };
}

/** ApiInsightTag → InsightTag 변환 */
export function toInsightTag(api: ApiInsightTag): InsightTag {
  return {
    insightTagId: api.insight_tag_id,
    sessionId: api.session_id,
    tagType: api.tag_type,
    score: api.score,
    description: api.description,
    mediaTimeStart: api.media_time_start,
    mediaTimeEnd: api.media_time_end,
    clips: api.clips.map((clip) => ({
      segmentId: clip.segment_id,
      offsetStart: clip.offset_start,
      offsetEnd: clip.offset_end,
      videoUrl: clip.video_url,
    })),
    playbackStatus: api.playback_status,
    createdAt: api.created_at,
  };
}

/** ApiPresignedUrlResponse → PresignedUrl (간소화) */
export function toPresignedUrl(api: ApiPresignedUrlResponse['result']): {
  segmentId: string;
  s3Url: string;
  expiresIn: number;
} {
  return {
    segmentId: api.segment_id,
    s3Url: api.s3_url,
    expiresIn: api.expires_in,
  };
}
