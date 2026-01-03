# client

## 개발 서버 실행

클라이언트 개발자는 다음 명령어로 로컬에서 mock API를 사용하여 개발할 수
있습니다:

```bash
npm run dev-msw
```

## API 환경 변수 적용

프로젝트를 설정하는 개발자는 다음 명령어로 환경 변수 파일을 생성합니다.

```bash
cp .env.example .env.local
```

### 환경 별로 설정할 환경 변수는 다음과 같습니다.

- `.env.local` : 로컬 개발 환경
- `.env.server.dev` : 개발 서버 환경
- `.env.server.prod` : 프로덕션 서버 환경
- `.env.example` : 환경 변수 예시(공유 불가능한 환경변수는 변수명만 명시)

## 문서

- [AGENTS.md](./AGENTS.md) : Codex Agent 문서
- [GEMINI.md](./GEMINI.md) : Antigravity & Gemini Agent 문서
- .agent/instructions.md : Agent 지침
