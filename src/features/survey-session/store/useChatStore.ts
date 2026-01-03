/**
 * Chat Store - Survey Runner 채팅 상태 관리
 */

import { create } from 'zustand';

import type {
  ChatMessageData,
  InterviewLogQType,
  SurveySessionStatus,
} from '../types';

/** 채팅 상태 인터페이스 */
interface ChatState {
  // Session info
  sessionUuid: string | null;
  surveyId: number | null;
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

  // Streaming buffer for tail question tokens
  streamingContent: string;

  // Actions
  setSession: (
    sessionUuid: string,
    surveyId: number,
    status: SurveySessionStatus,
    sseUrl: string
  ) => void;
  addAIMessage: (
    content: string,
    turnNum: number,
    qType: InterviewLogQType,
    fixedQId: number | null
  ) => void;
  addUserMessage: (content: string, turnNum: number) => void;
  appendStreamingToken: (token: string, turnNum: number) => void;
  finalizeStreamingMessage: () => void;
  setLoading: (loading: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  setComplete: (complete: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  sessionUuid: null,
  surveyId: null,
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
};

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,

  setSession: (sessionUuid, surveyId, status, sseUrl) =>
    set({
      sessionUuid,
      surveyId,
      status,
      sseUrl,
    }),

  addAIMessage: (content, turnNum, qType, fixedQId) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `ai-${turnNum}-${Date.now()}`,
          type: 'ai',
          content,
          turnNum,
          qType,
          fixedQId,
          timestamp: new Date(),
        },
      ],
      currentTurnNum: turnNum,
      currentFixedQId: fixedQId,
      isLoading: false,
    })),

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

  appendStreamingToken: (token, turnNum) =>
    set((state) => {
      const newContent = state.streamingContent + token;

      // 스트리밍 메시지가 이미 있으면 업데이트, 없으면 추가
      const existingStreamingIndex = state.messages.findIndex(
        (m) => m.id === `ai-streaming-${turnNum}`
      );

      if (existingStreamingIndex >= 0) {
        const updatedMessages = [...state.messages];
        updatedMessages[existingStreamingIndex] = {
          ...updatedMessages[existingStreamingIndex],
          content: newContent,
        };
        return {
          messages: updatedMessages,
          streamingContent: newContent,
          isStreaming: true,
        };
      } else {
        return {
          messages: [
            ...state.messages,
            {
              id: `ai-streaming-${turnNum}`,
              type: 'ai',
              content: newContent,
              turnNum,
              qType: 'TAIL',
              fixedQId: null,
              timestamp: new Date(),
            },
          ],
          streamingContent: newContent,
          isStreaming: true,
        };
      }
    }),

  finalizeStreamingMessage: () => {
    const state = get();
    const streamingIndex = state.messages.findIndex((m) =>
      m.id.startsWith('ai-streaming-')
    );

    if (streamingIndex >= 0) {
      const streamingMsg = state.messages[streamingIndex];
      const updatedMessages = [...state.messages];
      updatedMessages[streamingIndex] = {
        ...streamingMsg,
        id: `ai-${streamingMsg.turnNum}-${Date.now()}`, // 정상 ID로 변경
      };
      set({
        messages: updatedMessages,
        streamingContent: '',
        isStreaming: false,
        currentTurnNum: streamingMsg.turnNum,
      });
    } else {
      set({
        streamingContent: '',
        isStreaming: false,
      });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setComplete: (complete) => set({ isComplete: complete, isLoading: false }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set(initialState),
}));
