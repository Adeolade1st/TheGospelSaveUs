import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketOptions {
  url: string;
  protocols?: string | string[];
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

interface WebSocketState {
  socket: WebSocket | null;
  lastMessage: any;
  readyState: number;
  isConnected: boolean;
  error: string | null;
  reconnectCount: number;
}

export const useWebSocket = (options: WebSocketOptions) => {
  const {
    url,
    protocols,
    onOpen,
    onMessage,
    onError,
    onClose,
    reconnectAttempts = 5,
    reconnectInterval = 3000
  } = options;

  const [state, setState] = useState<WebSocketState>({
    socket: null,
    lastMessage: null,
    readyState: WebSocket.CONNECTING,
    isConnected: false,
    error: null,
    reconnectCount: 0
  });

  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const shouldReconnectRef = useRef(true);

  const connect = useCallback(() => {
    try {
      const socket = new WebSocket(url, protocols);

      socket.onopen = (event) => {
        setState(prev => ({
          ...prev,
          socket,
          readyState: WebSocket.OPEN,
          isConnected: true,
          error: null,
          reconnectCount: 0
        }));
        onOpen?.(event);
      };

      socket.onmessage = (event) => {
        let parsedData;
        try {
          parsedData = JSON.parse(event.data);
        } catch {
          parsedData = event.data;
        }

        setState(prev => ({
          ...prev,
          lastMessage: parsedData
        }));
        onMessage?.(event);
      };

      socket.onerror = (event) => {
        setState(prev => ({
          ...prev,
          error: 'WebSocket connection error',
          isConnected: false
        }));
        onError?.(event);
      };

      socket.onclose = (event) => {
        setState(prev => ({
          ...prev,
          socket: null,
          readyState: WebSocket.CLOSED,
          isConnected: false
        }));

        onClose?.(event);

        // Attempt to reconnect if not manually closed
        if (shouldReconnectRef.current && state.reconnectCount < reconnectAttempts) {
          setState(prev => ({
            ...prev,
            reconnectCount: prev.reconnectCount + 1
          }));

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      setState(prev => ({ ...prev, socket }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to create WebSocket connection',
        isConnected: false
      }));
    }
  }, [url, protocols, onOpen, onMessage, onError, onClose, reconnectAttempts, reconnectInterval, state.reconnectCount]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (state.socket) {
      state.socket.close();
    }
  }, [state.socket]);

  const sendMessage = useCallback((message: any) => {
    if (state.socket && state.socket.readyState === WebSocket.OPEN) {
      const messageToSend = typeof message === 'string' ? message : JSON.stringify(message);
      state.socket.send(messageToSend);
      return true;
    }
    return false;
  }, [state.socket]);

  useEffect(() => {
    connect();

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (state.socket) {
        state.socket.close();
      }
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage
  };
};