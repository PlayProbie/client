/**
 * Chat Store - Survey Runner 채팅 상태 관리
 * - Buffered Queue 시스템 도입: Reaction -> Typing -> Question 순서 보장
 */

import { create } from 'zustand';

import type {
  ChatMessageData,
  InsightQuestionData,
  InsightType,
  InterviewLogQType,
  ReplayPreloadState,
  SurveySessionStatus,
} from '../types';

/** 큐 아이템 타입 정의 */
type QueueItemType =
  | 'START_BUBBLE' // 말풍선 시작
  | 'TYPE_TEXT' // 텍스트 타이핑 (스트리밍)
  | 'FINALIZE_BUBBLE' // 말풍선 완료 (ID 확정)
  | 'WAIT'; // 대기 (delay)

interface QueueItem {
  type: QueueItemType;
  payload?: {
    text?: string;
    turnNum?: number;
    qType?: InterviewLogQType;
    fixedQId?: number | null;
    order?: number;
    totalQuestions?: number;
    duration?: number; // WAIT 시간 (ms)
    insightQuestion?: InsightQuestionData; // 인사이트 질문 데이터
  };
}

/** 채팅 상태 인터페이스 */
interface ChatState {
  // Session info
  sessionUuid: string | null;
  surveyUuid: string | null;
  status: SurveySessionStatus | null;
  sseUrl: string | null;

  // Messages
  messages: ChatMessageData[];
  currentTurnNum: number;
  currentFixedQId: number | null;
  /** 현재 인사이트 질문의 tag_id (인사이트 답변 시 사용) */
  currentInsightTagId: number | null;

  // UI state
  isLoading: boolean;
  isConnecting: boolean;
  isStreaming: boolean; // 토큰 스트리밍 중
  isComplete: boolean;
  error: string | null;

  // Streaming & Queue state
  streamingContent: string;
  streamQueue: QueueItem[];
  isProcessingQueue: boolean;
  replayPreloads: Record<number, ReplayPreloadState>;

  // Actions
  setSession: (
    sessionUuid: string,
    surveyUuid: string,
    status: SurveySessionStatus,
    sseUrl: string
  ) => void;
  addUserMessage: (content: string, turnNum: number) => void;

  // Queue Actions
  enqueueReaction: (text: string, turnNum: number) => void;
  enqueueQuestion: (
    text: string,
    turnNum: number,
    fixedQId: number | null,
    qType: InterviewLogQType,
    order?: number,
    totalQuestions?: number
  ) => void;
  enqueueStreamToken: (
    token: string,
    turnNum: number,
    qType?: InterviewLogQType,
    fixedQId?: number | null,
    order?: number,
    totalQuestions?: number
  ) => void;
  enqueueInsightQuestion: (
    text: string,
    turnNum: number,
    tagId: number,
    insightType: InsightType,
    videoStartMs: number,
    videoEndMs: number
  ) => void;
  enqueueFinalize: () => void;

  // Queue Processing (Internal use mostly)
  processQueue: () => void;

  // Basic Setters
  setLoading: (loading: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  setComplete: (complete: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentTurnNum: (turnNum: number) => void;
  incrementTurnNum: () => void;
  setCurrentFixedQId: (fixedQId: number | null) => void;
  setCurrentInsightTagId: (tagId: number | null) => void;
  setReplayPreload: (tagId: number, state: ReplayPreloadState) => void;
  clearReplayPreload: (tagId: number) => void;
  clearAllReplayPreloads: () => void;
  reset: () => void;
}

const initialState = {
  sessionUuid: null,
  surveyUuid: null,
  status: null,
  sseUrl: null,
  messages: [],
  currentTurnNum: 0,
  currentFixedQId: null,
  currentInsightTagId: null,
  isLoading: false,
  isConnecting: false,
  isStreaming: false,
  isComplete: false,
  error: null,
  streamingContent: '',
  streamQueue: [],
  isProcessingQueue: false,
  replayPreloads: {},
};

// 타이핑 속도 (ms per character)
const TYPING_SPEED = 30;
// 리액션 후 대기 시간 (ms)
const REACTION_PAUSE = 800;

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,

  setSession: (sessionUuid, surveyUuid, status, sseUrl) =>
    set({
      sessionUuid,
      surveyUuid,
      status,
      sseUrl,
    }),

  addUserMessage: (content, turnNum) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `user-${turnNum}-${Date.now()}`,
          type: 'user',
          content,
          turnNum,
          timestamp: new Date(),
        },
      ],
      isLoading: true,
    })),

  // ---------------------------------------------------------------------------
  // Queue Actions
  // ---------------------------------------------------------------------------

  /** Reaction: 말풍선 시작 -> 전체 텍스트 타이핑 -> 완료 -> 대기 */
  enqueueReaction: (text, turnNum) => {
    const { processQueue } = get();
    set((state) => ({
      streamQueue: [
        ...state.streamQueue,
        {
          type: 'START_BUBBLE',
          payload: { turnNum, qType: 'REACTION', fixedQId: null },
        },
        // 전체 텍스트를 한 번에 넣어서 처리기에서 쪼개거나, 여기서 쪼개서 넣음
        // 처리 효율을 위해 TYPE_TEXT에 통째로 넣고 처리기에서 한 글자씩 렌더링하도록 함
        { type: 'TYPE_TEXT', payload: { text } },
        { type: 'FINALIZE_BUBBLE' },
        { type: 'WAIT', payload: { duration: REACTION_PAUSE } },
      ],
    }));
    processQueue();
  },

  /** Question (Full Text): 말풍선 시작 -> 전체 텍스트 타이핑 */
  enqueueQuestion: (text, turnNum, fixedQId, qType, order, totalQuestions) => {
    const { processQueue } = get();
    set((state) => ({
      streamQueue: [
        ...state.streamQueue,
        {
          type: 'START_BUBBLE',
          payload: { turnNum, qType, fixedQId, order, totalQuestions },
        },
        { type: 'TYPE_TEXT', payload: { text } },
      ],
    }));
    processQueue();
  },

  /** InsightQuestion: 인사이트 질문 말풍선 (재생 버튼 포함) */
  enqueueInsightQuestion: (
    text,
    turnNum,
    tagId,
    insightType,
    videoStartMs,
    videoEndMs
  ) => {
    const { processQueue } = get();
    const insightQuestion: InsightQuestionData = {
      tagId,
      insightType,
      videoStartMs,
      videoEndMs,
    };
    set((state) => ({
      streamQueue: [
        ...state.streamQueue,
        {
          type: 'START_BUBBLE',
          payload: {
            turnNum,
            qType: 'INSIGHT',
            fixedQId: null,
            insightQuestion,
          },
        },
        { type: 'TYPE_TEXT', payload: { text } },
        // insight_question은 단발 이벤트이므로 done 없이 직접 FINALIZE
        { type: 'FINALIZE_BUBBLE' },
      ],
    }));
    processQueue();
  },

  /** Question (Streaming Token): 말풍선 시작(필요시) -> 토큰 타이핑 */
  enqueueStreamToken: (
    token,
    turnNum,
    qType = 'TAIL',
    fixedQId = null,
    order,
    totalQuestions
  ) => {
    const { processQueue } = get();

    set((state) => ({
      streamQueue: [
        ...state.streamQueue,
        {
          type: 'TYPE_TEXT',
          payload: {
            text: token,
            turnNum,
            qType,
            fixedQId,
            order,
            totalQuestions,
          },
        },
      ],
    }));
    processQueue();
  },

  enqueueFinalize: () => {
    const { processQueue } = get();
    set((state) => ({
      streamQueue: [...state.streamQueue, { type: 'FINALIZE_BUBBLE' }],
    }));
    processQueue();
  },

  // ---------------------------------------------------------------------------
  // Queue Processor
  // ---------------------------------------------------------------------------

  processQueue: async () => {
    const { isProcessingQueue } = get();
    if (isProcessingQueue) return;

    set({ isProcessingQueue: true });

    // 큐 처리 루프
    const processNext = async () => {
      const state = get();
      if (state.streamQueue.length === 0) {
        set({ isProcessingQueue: false });
        // 큐가 비었을 때 로딩 상태 해제 (메시지 처리가 끝났으므로)
        if (state.isLoading) set({ isLoading: false });
        return;
      }

      // Peek next item
      const item = state.streamQueue[0];
      const { type, payload } = item;

      // 1. START_BUBBLE
      if (type === 'START_BUBBLE') {
        set((s) => {
          // 이미 스트리밍 중인 메시지가 있다면 finalize 먼저 (안전장치)
          // (단, 같은 turnNum의 연속된 스트리밍일 수도 있으니 주의. 여기선 무조건 새로 시작)
          const msgs = [...s.messages];
          const streamingIdx = msgs.findIndex((m) =>
            m.id.startsWith('ai-streaming-')
          );
          if (streamingIdx >= 0) {
            msgs[streamingIdx] = {
              ...msgs[streamingIdx],
              id: `ai-${msgs[streamingIdx].turnNum}-${Date.now()}`,
            };
          }

          return {
            messages: [
              ...msgs,
              {
                id: `ai-streaming-${payload?.turnNum}`,
                type: 'ai',
                content: '',
                turnNum: payload?.turnNum ?? 0,
                qType: payload?.qType,
                fixedQId: payload?.fixedQId,
                order: payload?.order,
                totalQuestions: payload?.totalQuestions,
                timestamp: new Date(),
                insightQuestion: payload?.insightQuestion,
              },
            ],
            streamingContent: '',
            isStreaming: true,
            currentFixedQId: payload?.fixedQId ?? s.currentFixedQId,
            currentTurnNum: payload?.turnNum ?? s.currentTurnNum,
            streamQueue: s.streamQueue.slice(1), // pop
          };
        });
        // 즉시 다음 아이템 처리
        requestAnimationFrame(processNext);
      }
      // 2. WAIT
      else if (type === 'WAIT') {
        const duration = payload?.duration || 500;
        set((s) => ({ streamQueue: s.streamQueue.slice(1) })); // pop first
        setTimeout(() => {
          processNext();
        }, duration);
      }
      // 3. FINALIZE_BUBBLE
      else if (type === 'FINALIZE_BUBBLE') {
        set((s) => {
          const msgs = [...s.messages];
          const streamingIdx = msgs.findIndex((m) =>
            m.id.startsWith('ai-streaming-')
          );
          if (streamingIdx >= 0) {
            const msg = msgs[streamingIdx];
            msgs[streamingIdx] = {
              ...msg,
              id: `ai-${msg.turnNum}-${Date.now()}`,
            };
          }
          return {
            messages: msgs,
            streamingContent: '',
            isStreaming: false,
            streamQueue: s.streamQueue.slice(1),
          };
        });
        requestAnimationFrame(processNext);
      }
      // 4. TYPE_TEXT (핵심: 한 글자씩 타이핑 효과 or 토큰 추가)
      else if (type === 'TYPE_TEXT') {
        const text = payload?.text || '';

        // 현재 스트리밍 버블이 없으면 생성 (안전장치)
        const currentState = get();
        const hasStreaming = currentState.messages.some((m) =>
          m.id.startsWith('ai-streaming-')
        );

        if (!hasStreaming) {
          set((s) => {
            const lastMsg = s.messages[s.messages.length - 1];
            const currentTurnNum = payload?.turnNum ?? s.currentTurnNum;

            if (
              lastMsg &&
              lastMsg.type === 'ai' &&
              lastMsg.turnNum === currentTurnNum
            ) {
              // 기존 메시지를 스트리밍 상태로 전환 (ID 변경)
              const newMessages = [...s.messages];
              newMessages[newMessages.length - 1] = {
                ...lastMsg,
                id: `ai-streaming-${currentTurnNum}`, // streaming ID로 변경하여 hasStreaming 감지되게 함
              };
              return {
                messages: newMessages,
                isStreaming: true,
                // 스트리밍 재개 시 streamingContent 복구
                streamingContent: lastMsg.content,
              };
            }

            // 진짜 새로운 버블 생성
            return {
              messages: [
                ...s.messages,
                {
                  id: `ai-streaming-${currentTurnNum}`,
                  type: 'ai',
                  content: '',
                  turnNum: currentTurnNum,
                  qType: payload?.qType,
                  fixedQId: payload?.fixedQId,
                  order: payload?.order,
                  totalQuestions: payload?.totalQuestions,
                  timestamp: new Date(),
                },
              ],
              isStreaming: true,
            };
          });

          // 상태 업데이트 후 다시 시도 (큐는 유지)
          // requestAnimationFrame 대신 setTimeout 사용 (상태 업데이트 보장)
          setTimeout(processNext, 0);
          return;
        }

        // 한 번에 처리하지 않고, 재귀적으로 타이핑 효과 구현
        // 텍스트가 여러 글자라면: 첫 글자 붙이고, 나머지 텍스트로 큐 아이템 업데이트
        if (text.length > 0) {
          const char = text[0];
          const remaining = text.slice(1);

          set((s) => {
            const msgs = [...s.messages];
            const idx = msgs.findIndex((m) => m.id.startsWith('ai-streaming-'));
            if (idx >= 0) {
              const newContent = msgs[idx].content + char;
              msgs[idx] = { ...msgs[idx], content: newContent };
              return {
                messages: msgs,
                streamingContent: newContent,
                // 큐 헤드 업데이트 (남은 텍스트) 또는 팝
                streamQueue:
                  remaining.length > 0
                    ? [
                        { ...item, payload: { ...payload, text: remaining } },
                        ...s.streamQueue.slice(1),
                      ]
                    : s.streamQueue.slice(1), // 다 썼으면 pop
              };
            }
            return s; // Should not happen
          });

          // 다음 글자 타이핑 딜레이
          setTimeout(() => {
            processNext();
          }, TYPING_SPEED);
        } else {
          // 빈 텍스트면 그냥 넘김
          set((s) => ({ streamQueue: s.streamQueue.slice(1) }));
          processNext();
        }
      }
    };

    processNext();
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setComplete: (complete) => set({ isComplete: complete, isLoading: false }),
  setError: (error) => set({ error, isLoading: false }),
  setCurrentTurnNum: (turnNum) => set({ currentTurnNum: turnNum }),
  incrementTurnNum: () =>
    set((state) => ({ currentTurnNum: state.currentTurnNum + 1 })),
  setCurrentFixedQId: (fixedQId) => set({ currentFixedQId: fixedQId }),
  setCurrentInsightTagId: (tagId) => set({ currentInsightTagId: tagId }),
  setReplayPreload: (tagId, state) =>
    set((prev) => ({
      replayPreloads: {
        ...prev.replayPreloads,
        [tagId]: state,
      },
    })),
  clearReplayPreload: (tagId) =>
    set((prev) => {
      const next = { ...prev.replayPreloads };
      const target = next[tagId];
      if (target?.sources) {
        for (const source of target.sources) {
          URL.revokeObjectURL(source.url);
        }
      }
      delete next[tagId];
      return { replayPreloads: next };
    }),
  clearAllReplayPreloads: () =>
    set((prev) => {
      for (const preload of Object.values(prev.replayPreloads)) {
        if (!preload.sources) continue;
        for (const source of preload.sources) {
          URL.revokeObjectURL(source.url);
        }
      }
      return { replayPreloads: {} };
    }),
  reset: () => {
    const { replayPreloads } = get();
    for (const preload of Object.values(replayPreloads)) {
      if (!preload.sources) continue;
      for (const source of preload.sources) {
        URL.revokeObjectURL(source.url);
      }
    }
    set(initialState);
  },
}));
