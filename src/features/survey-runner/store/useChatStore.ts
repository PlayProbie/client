/**
 * Chat Store - Survey Runner 채팅 상태 관리
 */

import { create } from 'zustand';

import type {
  ChatExcerpt,
  ChatMessageData,
  InterviewLogQType,
  SurveySessionStatus,
} from '../types';

/** 채팅 상태 인터페이스 */
interface ChatState {
  // Session info
  sessionId: number | null;
  surveyId: number | null;
  status: SurveySessionStatus | null;
  sseUrl: string | null;

  // Messages
  messages: ChatMessageData[];
  currentTurnNum: number;

  // UI state
  isLoading: boolean;
  isConnecting: boolean;
  isComplete: boolean;
  error: string | null;

  // Actions
  setSession: (
    sessionId: number,
    surveyId: number,
    status: SurveySessionStatus,
    sseUrl: string
  ) => void;
  addAIMessage: (
    content: string,
    turnNum: number,
    qType: InterviewLogQType,
    fixedQId: number
  ) => void;
  addUserMessage: (content: string, turnNum: number) => void;
  restoreMessages: (excerpts: ChatExcerpt[]) => void;
  setLoading: (loading: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setComplete: (complete: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  sessionId: null,
  surveyId: null,
  status: null,
  sseUrl: null,
  messages: [],
  currentTurnNum: 0,
  isLoading: false,
  isConnecting: false,
  isComplete: false,
  error: null,
};

export const useChatStore = create<ChatState>((set) => ({
  ...initialState,

  setSession: (sessionId, surveyId, status, sseUrl) =>
    set({
      sessionId,
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

  restoreMessages: (excerpts) =>
    set(() => {
      const messages: ChatMessageData[] = [];
      let maxTurnNum = 0;

      excerpts.forEach((excerpt) => {
        // AI 질문
        messages.push({
          id: `ai-${excerpt.turn_num}-restored`,
          type: 'ai',
          content: excerpt.question_text,
          turnNum: excerpt.turn_num,
          qType: excerpt.q_type,
          timestamp: new Date(),
        });

        // 사용자 응답 (있는 경우)
        if (excerpt.answer_text) {
          messages.push({
            id: `user-${excerpt.turn_num}-restored`,
            type: 'user',
            content: excerpt.answer_text,
            turnNum: excerpt.turn_num,
            timestamp: new Date(),
          });
        }

        maxTurnNum = Math.max(maxTurnNum, excerpt.turn_num);
      });

      return {
        messages,
        currentTurnNum: maxTurnNum,
      };
    }),

  setLoading: (loading) => set({ isLoading: loading }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  setComplete: (complete) => set({ isComplete: complete, isLoading: false }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set(initialState),
}));
