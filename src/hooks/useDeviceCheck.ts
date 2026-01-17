import { useLayoutEffect, useState } from 'react';

/**
 * 디바이스 타입 체크 훅
 * - 모바일/태블릿 디바이스 감지
 * - Desktop Only 가드에서 사용
 */
export function useDeviceCheck() {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useLayoutEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      // Mobile/Tablet 디바이스 체크
      const mobileRegex =
        /Mobi|Android|iPad|iPhone|iPod|Tablet|webOS|BlackBerry|Opera Mini|IEMobile/i;
      setIsMobileOrTablet(mobileRegex.test(userAgent));
    };

    checkDevice();
  }, []);

  return { isMobileOrTablet };
}
