# 초기 세팅

### 환경 변수 세팅

프로젝트 root에서 `.env.local` 파일을 생성하여, 다음 내용을 복사/붙여넣기 하면
환경변수가 세팅됩니다.

```md
# API 서버 URL

VITE_API_BASE_URL=https://dev-api.playprobie.shop

# 클라이언트 URL

VITE_CLIENT_BASE_URL=http://localhost:5173

# MSW 활성화 (Mock 서버 통신)

VITE_MSW_ENABLED=true VITE_MOCK_STREAM=true
```

### 라이브러리 설치

프로젝트 root에서 터미널을 켜고, 다음 명령어를 실행하면 `package.json`에 추가된
라이브러리가 설치됩니다.

```bash
npm i
```

# 개발 서버 실행

다음 명령어로 로컬 개발 서버를 실행할 수 있습니다.

### 1. 실제 서버 사용 (기본)

환경변수(`.env.local`) 설정에 따라 동작합니다. 기본적으로 실제 API 서버와
통신합니다.

```bash
npm run dev
```

### 2. Mock 서버 사용 (MSW)

환경변수 설정과 무관하게 **MSW(Mock Service Worker)** 와 **Mock Stream(개발용
스트림)** 을 강제로 활성화하여 실행합니다. 백엔드 서버 없이 클라이언트 단독으로
개발하거나 테스트할 때 사용합니다.

```bash
npm run dev-msw
```

# 브라우저 접속

다음 url로 접속하면, 실시간으로 변경사항을 확인할 수 있습니다.

```bash
http://localhost:5173
```

# API 환경 변수 적용

프로젝트를 설정하는 개발자는 다음 명령어로 환경 변수 파일을 생성합니다.

```bash
cp .env.example .env.local
```

### 환경 별로 설정할 환경 변수는 다음과 같습니다.

- `.env.local` : 로컬 개발 환경
- `.env.server.dev` : 개발 서버 환경
- `.env.server.prod` : 프로덕션 서버 환경
- `.env.example` : 환경 변수 예시(공유 불가능한 환경변수는 변수명만 명시)

### 문서

- [AGENTS.md](./AGENTS.md) : Codex Agent 문서
- [GEMINI.md](./GEMINI.md) : Antigravity & Gemini Agent 문서
- .agent/instructions.md : Agent 지침
