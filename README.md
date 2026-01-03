# 초기 세팅

### 환경 변수 세팅

프로젝트 root에서 `.env.local` 파일을 생성하여, 다음 내용을 복사/붙여넣기 하면 환경변수가 세팅됩니다.

```md
# API 서버 URL
VITE_API_BASE_URL=https://dev-api.playprobie.shop

# 클라이언트 URL
VITE_CLIENT_BASE_URL=http://localhost:5173

# MSW 비활성화 (실제 서버 통신)
VITE_MSW_ENABLED=false
```

### 라이브러리 설치

프로젝트 root에서 터미널을 켜고, 다음 명령어를 실행하면 `package.json`에 추가된 라이브러리가 설치됩니다.

```bash
npm i
```

# 개발 서버 실행

다음 명령어로 로컬에서 개발 서버를 사용하여 개발할 수 있습니다.

```bash
npm run dev
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
