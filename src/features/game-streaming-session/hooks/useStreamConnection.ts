import { useCallback, useRef, useState } from 'react';

import { postSignal } from '../api';
import { createStreamClient, type StreamClient, type StreamClientConfig } from '../lib';

export interface UseStreamConnectionOptions {
  surveyUuid: string;
  onConnected?: (sessionUuid: string) => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

export interface ConnectStreamParams {
  inputFilters?: StreamClientConfig['inputFilters'];
}

export interface UseStreamConnectionReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  clientRef: React.RefObject<StreamClient | null>;
  isConnecting: boolean;
  isConnected: boolean;
  sessionUuid: string | null;
  connect: (params?: ConnectStreamParams) => Promise<void>;
  disconnect: () => void;
}

export function useStreamConnection(
  options: UseStreamConnectionOptions
): UseStreamConnectionReturn {
  const { surveyUuid, onConnected, onDisconnected, onError } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clientRef = useRef<StreamClient | null>(null);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionUuid, setSessionUuid] = useState<string | null>(null);

  const connect = useCallback(
    async (params: ConnectStreamParams = {}) => {
      if (isConnecting || isConnected) return;

      setIsConnecting(true);

      try {
        const client = createStreamClient(videoRef.current, audioRef.current, {
          onConnectionStateChange: (state) => {
            if (state === 'connected') {
              setIsConnected(true);
            } else if (state === 'disconnected' || state === 'failed') {
              setIsConnected(false);
            }
          },
          onServerDisconnect: () => {
            setIsConnected(false);
            setSessionUuid(null);
            onDisconnected?.();
          },
          onError: (error) => {
            onError?.(error);
          },
          inputFilters: params.inputFilters,
        });
        clientRef.current = client;

        const signalRequest = await client.generateSignalRequest();
        const response = await postSignal(surveyUuid, { signalRequest });

        await client.processSignalResponse(response.signalResponse);
        client.attachInput();

        setSessionUuid(response.surveySessionUuid);
        setIsConnected(true);
        setIsConnecting(false);

        onConnected?.(response.surveySessionUuid);
      } catch (error) {
        setIsConnecting(false);
        setIsConnected(false);
        setSessionUuid(null);

        if (clientRef.current) {
          clientRef.current.disconnect();
          clientRef.current = null;
        }

        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);
      }
    },
    [surveyUuid, isConnecting, isConnected, onConnected, onDisconnected, onError]
  );

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.detachInput();
      clientRef.current.disconnect();
      clientRef.current = null;
    }

    setIsConnected(false);
    setSessionUuid(null);
    onDisconnected?.();
  }, [onDisconnected]);

  return {
    videoRef,
    audioRef,
    clientRef,
    isConnecting,
    isConnected,
    sessionUuid,
    connect,
    disconnect,
  };
}
