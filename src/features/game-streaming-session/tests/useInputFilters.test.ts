/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useInputFilters } from '../hooks/input/useInputFilters';

const createHook = (addLog: ReturnType<typeof vi.fn>) => {
  const getMediaTime = vi.fn(() => 1234);

  const { result } = renderHook(() => {
    const enabledRef = useRef(true);
    const currentSegmentIdRef = useRef('seg-1');

    return useInputFilters({
      enabledRef,
      currentSegmentIdRef,
      getMediaTime,
      addLog,
    });
  });

  return { result, getMediaTime };
};

describe('useInputFilters', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('키보드 이벤트를 정규화하여 로그를 기록한다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1000));

    const addLog = vi.fn();
    const { result } = createHook(addLog);
    const keyboardFilter = result.current.createKeyboardFilter();

    keyboardFilter(new KeyboardEvent('keydown', { code: 'KeyA', key: 'a' }));

    expect(addLog).toHaveBeenCalledTimes(1);
    expect(addLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'KEY_DOWN',
        media_time: 1234,
        timestamp: 1000,
        segment_id: 'seg-1',
        code: 'KeyA',
        key: '',
      })
    );
  });

  it('마우스 이동은 15Hz/5px 기준으로 샘플링한다', () => {
    vi.useFakeTimers();
    const addLog = vi.fn();
    const { result } = createHook(addLog);
    const mouseFilter = result.current.createMouseFilter();

    vi.setSystemTime(new Date(100));
    mouseFilter(new MouseEvent('mousemove', { clientX: 10, clientY: 0 }));

    vi.setSystemTime(new Date(130));
    mouseFilter(new MouseEvent('mousemove', { clientX: 12, clientY: 1 }));

    expect(addLog).toHaveBeenCalledTimes(1);
    expect(addLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'MOUSE_MOVE',
        sampled: true,
        x: 10,
        y: 0,
      })
    );
  });

  it('휠 이벤트는 30Hz 기준으로 샘플링한다', () => {
    vi.useFakeTimers();
    const addLog = vi.fn();
    const { result } = createHook(addLog);
    const mouseFilter = result.current.createMouseFilter();

    vi.setSystemTime(new Date(40));
    mouseFilter(new WheelEvent('wheel', { deltaX: 1, deltaY: 2 }));

    vi.setSystemTime(new Date(60));
    mouseFilter(new WheelEvent('wheel', { deltaX: 3, deltaY: 4 }));

    expect(addLog).toHaveBeenCalledTimes(1);
    expect(addLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'WHEEL',
        deltaX: 1,
        deltaY: 2,
      })
    );
  });
});
