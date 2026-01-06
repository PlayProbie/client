const AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;

function buildHeaders(existing?: HeadersInit): Headers {
  const headers = new Headers(existing);

  if (AUTH_TOKEN && !headers.has('Authorization')) {
    headers.set('Authorization', AUTH_TOKEN);
  }

  return headers;
}

/** fetch에 인증 헤더를 자동으로 주입합니다. */
export function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const headers = buildHeaders(init?.headers);

  return fetch(input, {
    ...init,
    headers,
  });
}
