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
        <!-- 로딩 로고 (펄스 애니메이션) -->
        <div style="
          animation: pulse 2s ease-in-out infinite;
          margin-bottom: 40px;
        ">
          <img
            src="${LOADING_LOGO_IMAGE}"
            alt="Loading"
            style="
              max-width: 200px;
              max-height: 200px;
              object-fit: contain;
            "
            onerror="this.style.display='none'"
          />
        </div>

        <!-- 로딩 스피너 -->
        <div style="
          width: 48px;
          height: 48px;
          border: 4px solid rgba(255, 255, 255, 0.2);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>

        <!-- 로딩 텍스트 -->
        <p style="
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 16px;
          font-weight: 500;
          margin-top: 24px;
          opacity: 0.9;
          animation: fadeInOut 2s ease-in-out infinite;
        ">
          게임을 로딩하고 있습니다...
        </p>

        <!-- 진행률 바 (선택적) -->
        <div style="
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          margin-top: 16px;
          overflow: hidden;
        ">
          <div id="loading-progress-bar" style="
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            border-radius: 2px;
            animation: loading-progress 3s ease-in-out infinite;
          "></div>
        </div>

        <!-- CSS 애니메이션 정의 -->
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
          }

          @keyframes fadeInOut {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }

          @keyframes loading-progress {
            0% { width: 0%; }
            50% { width: 80%; }
            100% { width: 100%; }
          }
        </style>
      </div>
    `;
  }

  /**
   * 로딩 화면 표시
   */
  function showLoadingScreen() {
    // 이미 로딩 화면이 있으면 제거
    hideLoadingScreen();

    // 로딩 화면 삽입
    const loadingHTML = createLoadingScreenHTML();
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
  }

  /**
   * 로딩 화면 숨기기 (페이드 아웃 애니메이션)
   */
  function hideLoadingScreen() {
    const loadingScreen = document.getElementById(LOADING_SCREEN_ID);
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.remove();
      }, 500);
    }
  }

  /**
   * 로딩 진행률 업데이트 (0-100)
   */
  function updateProgress(percentage) {
    const progressBar = document.getElementById('loading-progress-bar');
    if (progressBar) {
      progressBar.style.animation = 'none';
      progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    }
  }

  // 전역 객체로 노출
  window.GameLiftLoadingScreen = {
    show: showLoadingScreen,
    hide: hideLoadingScreen,
    updateProgress: updateProgress,
  };
})();
