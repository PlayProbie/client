declare module 'event-source-polyfill' {
  export interface EventSourcePolyfillInit {
    headers?: Record<string, string>;
    withCredentials?: boolean;
    heartbeatTimeout?: number;
    lastEventIdQueryParameterName?: string;
  }

  export class EventSourcePolyfill extends EventSource {
    constructor(url: string | URL, eventSourceInitDict?: EventSourcePolyfillInit);
  }
}
