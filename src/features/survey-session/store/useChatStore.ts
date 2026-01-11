/**
 * Chat Store - Survey Runner 채팅 상태 관리
 * - Buffered Queue 시스템 도입: Reaction -> Typing -> Question 순서 보장
 */

import { create } from 'zustand';

import type {
  ChatMessageData,
  InterviewLogQType,
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
    duration?: number; // WAIT 시간 (ms)
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
    qType: InterviewLogQType
  ) => void;
  enqueueStreamToken: (
    token: string,
    turnNum: number,
    qType?: InterviewLogQType,
    fixedQId?: number | null
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
  isLoading: false,
  isConnecting: false,
  isStreaming: false,
  isComplete: false,
  error: null,
  streamingContent: '',
  streamQueue: [],
  isProcessingQueue: false,
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
  enqueueQuestion: (text, turnNum, fixedQId, qType) => {
    const { processQueue } = get();
    set((state) => ({
      streamQueue: [
        ...state.streamQueue,
        {
          type: 'START_BUBBLE',
          payload: { turnNum, qType, fixedQId },
        },
        { type: 'TYPE_TEXT', payload: { text } },
      ],
    }));
    processQueue();
  },

  /** Question (Streaming Token): 말풍선 시작(필요시) -> 토큰 타이핑 */
  enqueueStreamToken: (token, turnNum, qType = 'TAIL', fixedQId = null) => {
    const { processQueue } = get();

    set((state) => ({
      streamQueue: [
        ...state.streamQueue,
        {
          type: 'TYPE_TEXT',
          payload: { text: token, turnNum, qType, fixedQId },
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
                timestamp: new Date(),
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
          // 버블 생성 후 다시 시도 (큐는 유지)
          set((s) => ({
            messages: [
              ...s.messages,
              {
                id: `ai-streaming-${payload?.turnNum ?? s.currentTurnNum}`,
                type: 'ai',
                content: '',
                turnNum: payload?.turnNum ?? s.currentTurnNum,
                qType: payload?.qType,
                fixedQId: payload?.fixedQId,
                timestamp: new Date(),
              },
            ],
            isStreaming: true,
          }));
          // 생성 직후 다시 processNext 호출하면 이 분기점 통과함
          requestAnimationFrame(processNext);
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
  reset: () => set(initialState),
}));
