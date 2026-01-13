/**
 * GameLift Streams 로딩 화면 JavaScript
 *
 * Amazon GameLift Streams Web SDK에서 게임 로딩 시 표시되는 로딩 화면을 구현합니다.
 * Background.png와 LoadingLogo.png를 사용하여 애니메이션 로딩 화면을 표시합니다.
 */

(function () {
  'use strict';

  // 로딩 화면 에셋 경로
  const BACKGROUND_IMAGE = '/LoadingScreen/Background.png';
  const LOADING_LOGO_IMAGE = '/LoadingScreen/LoadingLogo.png';

  // 로딩 화면 컨테이너 ID
  const LOADING_SCREEN_ID = 'gamelift-loading-screen';

  /**
   * 로딩 화면 HTML 생성
   */
  function createLoadingScreenHTML() {
    return `
      <div id="${LOADING_SCREEN_ID}" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #0a0a0a;
        background-image: url('${BACKGROUND_IMAGE}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        transition: opacity 0.5s ease-out;
      ">
        <!-- 로딩 로고 (좌우 sway 애니메이션 + 방향 반전) -->
        <div style="
          animation: swayLeftRight 3s ease-in-out infinite;
          margin-bottom: 16px;
        ">
          <img
            src="${LOADING_LOGO_IMAGE}"
            alt="Loading"
            style="
              max-width: 300px;
              max-height: 300px;
              object-fit: contain;
            "
            onerror="this.style.display='none'"
          />
        </div>
        
        <!-- 로딩 텍스트 -->
        <p style="
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 20px;
          font-weight: 500;
          opacity: 0.9;
          animation: fadeInOut 2s ease-in-out infinite;
        ">
          게임 로딩 중...
        </p>

        <!-- CSS 애니메이션 정의 -->
        <style>


          @keyframes swayLeftRight {
            0% { transform: translateX(-60px) scaleX(1); }
            49.9% { transform: translateX(60px) scaleX(1); }
            50% { transform: translateX(60px) scaleX(-1); }
            99.9% { transform: translateX(-60px) scaleX(-1); }
            100% { transform: translateX(-60px) scaleX(1); }
          }

          @keyframes fadeInOut {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }

        </style>
      </div>
    `;
  }

  /**
   * 로딩 화면 표시
   */
  function showLoadingScreen() {
    const existingScreen = document.getElementById(LOADING_SCREEN_ID);

    // 이미 로딩 화면이 있으면 다시 표시
    if (existingScreen) {
      existingScreen.style.visibility = 'visible';
      existingScreen.style.pointerEvents = 'auto';
      existingScreen.style.opacity = '1';
      return;
    }

    // 로딩 화면 삽입
    const loadingHTML = createLoadingScreenHTML();
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
  }

  /**
   * 로딩 화면 숨기기 (페이드 아웃 애니메이션)
   *
   * 주의: 전체화면 상태를 유지하기 위해 DOM에서 제거하지 않고
   * visibility: hidden으로 숨깁니다. DOM에서 요소를 제거하면
   * 일부 브라우저에서 전체화면이 해제될 수 있습니다.
   */
  function hideLoadingScreen() {
    const loadingScreen = document.getElementById(LOADING_SCREEN_ID);
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        // DOM에서 제거하지 않고 숨김 처리 (전체화면 유지)
        loadingScreen.style.visibility = 'hidden';
        loadingScreen.style.pointerEvents = 'none';
      }, 500);
    }
  }

  window.GameLiftLoadingScreen = {
    show: showLoadingScreen,
    hide: hideLoadingScreen,
  };
})();
