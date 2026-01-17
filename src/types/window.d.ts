export {};

declare global {
  interface Window {
    GameLiftLoadingScreen: {
      show: () => void;
      hide: () => void;
      updateProgress: (percentage: number) => void;
    };
  }
}
