// ============================================
// Input Log Types (입력 로그 스키마)
// ============================================

/** 입력 이벤트 타입 */
export type InputEventType =
  | 'KEY_DOWN'
  | 'KEY_UP'
  | 'MOUSE_DOWN'
  | 'MOUSE_UP'
  | 'MOUSE_MOVE'
  | 'WHEEL'
  | 'GAMEPAD_BUTTON'
  | 'GAMEPAD_AXIS'
  | 'BLUR'
  | 'FOCUS'
  | 'VISIBILITY_HIDDEN'
  | 'VISIBILITY_VISIBLE'
  | 'PAGE_HIDE';

/** 기본 입력 로그 (최소 필수 필드) */
export interface BaseInputLog {
  /** 입력 이벤트 타입 */
  type: InputEventType;
  /** 영상 기준 시간 (video.currentTime 또는 rVFC) - Core Key, 단위: ms (밀리초 정수) */
  media_time: number;
  /** 로컬 에포크 타임 (Date.now()), 단위: ms (밀리초 정수) */
  timestamp: number;
  /** 해당 이벤트가 포함된 세그먼트 ID */
  segment_id: string;
  /**
   * 오버랩 구간 로그용 세그먼트 배열
   * segment_id는 기본 세그먼트, segment_ids는 양쪽 세그먼트 포함
   */
  segment_ids?: string[];
}

/** 키보드 입력 로그 */
export interface KeyboardInputLog extends BaseInputLog {
  type: 'KEY_DOWN' | 'KEY_UP';
  /** 키 코드 (e.g., 'KeyA', 'Space', 'Enter') */
  code: string;
  /** 키 이름 (e.g., 'a', ' ', 'Enter') */
  key: string;
}

/** 마우스 클릭 입력 로그 */
export interface MouseClickInputLog extends BaseInputLog {
  type: 'MOUSE_DOWN' | 'MOUSE_UP';
  /** 마우스 버튼 (0: left, 1: middle, 2: right) */
  button: number;
  /** X 좌표 */
  x: number;
  /** Y 좌표 */
  y: number;
}

/** 마우스 이동 입력 로그 (샘플링 적용) */
export interface MouseMoveInputLog extends BaseInputLog {
  type: 'MOUSE_MOVE';
  /** X 좌표 */
  x: number;
  /** Y 좌표 */
  y: number;
  /** 샘플링된 이벤트 여부 */
  sampled?: boolean;
}

/** 휠 입력 로그 (샘플링 적용) */
export interface WheelInputLog extends BaseInputLog {
  type: 'WHEEL';
  /** 수평 스크롤량 */
  deltaX: number;
  /** 수직 스크롤량 */
  deltaY: number;
  /** 샘플링된 이벤트 여부 */
  sampled?: boolean;
}

/** 게임패드 버튼 입력 로그 */
export interface GamepadButtonInputLog extends BaseInputLog {
  type: 'GAMEPAD_BUTTON';
  /** 게임패드 인덱스 */
  gamepadIndex: number;
  /** 버튼 인덱스 */
  buttonIndex: number;
  /** 눌림 여부 */
  pressed: boolean;
  /** 눌림 강도 (0.0 ~ 1.0) */
  value: number;
}

/** 게임패드 축 입력 로그 */
export interface GamepadAxisInputLog extends BaseInputLog {
  type: 'GAMEPAD_AXIS';
  /** 게임패드 인덱스 */
  gamepadIndex: number;
  /** 축 인덱스 */
  axisIndex: number;
  /** 축 값 (-1.0 ~ 1.0) */
  value: number;
}

/** Visibility/Focus 이벤트 로그 */
export interface VisibilityInputLog extends BaseInputLog {
  type:
    | 'BLUR'
    | 'FOCUS'
    | 'VISIBILITY_HIDDEN'
    | 'VISIBILITY_VISIBLE'
    | 'PAGE_HIDE';
}

/** 모든 입력 로그 타입 유니온 */
export type InputLog =
  | KeyboardInputLog
  | MouseClickInputLog
  | MouseMoveInputLog
  | WheelInputLog
  | GamepadButtonInputLog
  | GamepadAxisInputLog
  | VisibilityInputLog;
