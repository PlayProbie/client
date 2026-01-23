/**
 * MSW 세션 스토어 (공유 상태)
 * game-streaming-session과 survey-session 간 세션 ID 동기화
 */

/** 세션 정보 */
interface SessionInfo {
  sessionUuid: string;
  surveyUuid: string;
  createdAt: string;
  insightIndex: number;
  turnNum: number;
  fixedQId: number;
  needsTail: boolean;
}

/** 공유 세션 스토어 */
class MswSessionStore {
  private sessions = new Map<string, SessionInfo>();

  /** surveyUuid로 세션 생성 또는 조회 */
  getOrCreateSession(surveyUuid: string): SessionInfo {
    // 이미 존재하면 반환
    const existing = Array.from(this.sessions.values()).find(
      (s) => s.surveyUuid === surveyUuid
    );
    if (existing) {
      return existing;
    }

    // 새 세션 생성 (스트리밍과 설문 모두 동일한 ID 사용)
    const sessionUuid = crypto.randomUUID();
    const session: SessionInfo = {
      sessionUuid,
      surveyUuid,
      createdAt: new Date().toISOString(),
      insightIndex: 0,
      turnNum: 0,
      fixedQId: 1,
      needsTail: false,
    };
    this.sessions.set(sessionUuid, session);
    return session;
  }

  /** sessionUuid로 세션 조회 */
  getSession(sessionUuid: string): SessionInfo | undefined {
    return this.sessions.get(sessionUuid);
  }

  /** surveyUuid로 세션 조회 */
  getSessionBySurvey(surveyUuid: string): SessionInfo | undefined {
    return Array.from(this.sessions.values()).find(
      (s) => s.surveyUuid === surveyUuid
    );
  }

  /** 세션 업데이트 */
  updateSession(sessionUuid: string, updates: Partial<SessionInfo>): void {
    const session = this.sessions.get(sessionUuid);
    if (session) {
      Object.assign(session, updates);
    }
  }

  /** 세션 삭제 */
  deleteSession(sessionUuid: string): void {
    this.sessions.delete(sessionUuid);
  }

  /** 초기화 (테스트용) */
  clear(): void {
    this.sessions.clear();
  }
}

/** 전역 MSW 세션 스토어 */
export const mswSessionStore = new MswSessionStore();
