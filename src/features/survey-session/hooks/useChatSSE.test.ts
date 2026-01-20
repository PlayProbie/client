
import { renderHook, act } from '@testing-library/react';
import { useChatSSE } from './useChatSSE';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Capture instances for testing
let mockInstances: MockEventSource[] = [];

class MockEventSource {
  onopen: (() => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readyState = 0; // CONNECTING
  
  private listeners: Record<string, ((event: any) => void)[]> = {};

  constructor(public url: string) {
    mockInstances.push(this);
  }

  addEventListener(type: string, listener: (event: any) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (event: any) => void) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(l => l !== listener);
    }
  }

  close() {
    this.readyState = 2; // CLOSED
  }
  
  // Test helper to trigger events
  emit(type: string, data: any) {
    if (this.listeners[type]) {
      const event = { type, data: JSON.stringify(data) };
      this.listeners[type].forEach(listener => listener(event));
    }
  }
}

describe('useChatSSE', () => {
  let originalEventSource: any;

  beforeEach(() => {
    mockInstances = [];
    originalEventSource = global.EventSource;
    global.EventSource = MockEventSource as any;
  });

  afterEach(() => {
    global.EventSource = originalEventSource;
  });

  it('should call onRetryRequest when retry_request event is received', () => {
    const onRetryRequest = vi.fn();
    
    const { result } = renderHook(() => useChatSSE({
      sessionUuid: 'test-session-id',
      onRetryRequest,
    }));

    // Connect
    act(() => {
      result.current.connect();
    });
    
    // Verify connection created
    expect(mockInstances.length).toBe(1);
    const mockES = mockInstances[0];

    // Simulate connection open
    act(() => {
        if (mockES.onopen) mockES.onopen();
    });

    // Trigger retry_request
    const eventData = {
      message: 'Retry Message Content',
      followup_type: 'clarify'
    };
    
    act(() => {
        mockES.emit('retry_request', eventData);
    });

    expect(onRetryRequest).toHaveBeenCalledTimes(1);
    expect(onRetryRequest).toHaveBeenCalledWith({
      message: 'Retry Message Content',
      followupType: 'clarify'
    });
  });
});
