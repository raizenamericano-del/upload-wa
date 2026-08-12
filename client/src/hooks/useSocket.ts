import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  ConnectionState,
  UploadProgress,
  UploadResult
} from '../types';

// Socket URL - will use same origin in production
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

// Session ID key
const SESSION_ID_KEY = 'kyystatus-session-id';

// Get stored session ID
function getStoredSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_ID_KEY);
}

// Set session ID in storage
function setStoredSessionId(sessionId: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_ID_KEY, sessionId);
}

// Clear session ID
function clearStoredSessionId() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_ID_KEY);
}

export interface SocketState {
  connected: boolean;
  connecting: boolean;
  error?: string;
}

export interface UseSocketReturn {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  state: SocketState;
  sessionId: string | null;
  connectionState: ConnectionState;
  connect: (sessionId?: string, phoneNumber?: string) => void;
  disconnect: () => void;
  reconnect: () => void;
  initConnection: (phoneNumber?: string) => void;
  disconnectConnection: () => void;
  uploadStatus: (compress: boolean, compressionOptions?: any) => void;
  fetchStatus: () => void;
}

export function useSocket(): UseSocketReturn {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [state, setState] = useState<SocketState>({
    connected: false,
    connecting: false,
    error: undefined,
  });
  const [sessionId, setSessionId] = useState<string | null>(getStoredSessionId());
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
  });
  
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  
  // Update refs
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);
  
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);
  
  // Initialize socket connection
  const connect = useCallback((customSessionId?: string, phoneNumber?: string) => {
    const id = customSessionId || sessionId;
    if (!id) return;
    
    setState(prev => ({ ...prev, connecting: true, error: undefined }));
    
    try {
      // Create new socket connection
      const newSocket = io(SOCKET_URL, {
        query: { sessionId: id },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      });
      
      setSocket(newSocket);
      setSessionId(id);
      setStoredSessionId(id);
      
      // Socket event handlers
      newSocket.on('connect', () => {
        setState({ connected: true, connecting: false });
        
        // Initialize connection if not already connected
        if (connectionState.status === 'disconnected') {
          newSocket.emit('connection:init', phoneNumber);
        }
      });
      
      newSocket.on('disconnect', () => {
        setState({ connected: false, connecting: false });
      });
      
      newSocket.on('connect_error', (error) => {
        setState(prev => ({
          ...prev,
          connecting: false,
          error: error.message || 'Connection error',
        }));
      });
      
      newSocket.on('connection:status', (status: ConnectionState) => {
        setConnectionState(status);
        
        // Update socket state based on connection status
        if (status.status === 'connected') {
          setState(prev => ({ ...prev, connecting: false, error: undefined }));
        } else if (status.status === 'connecting' || status.status === 'waiting') {
          setState(prev => ({ ...prev, connecting: true, error: undefined }));
        } else if (status.status === 'error') {
          setState(prev => ({
            ...prev,
            connecting: false,
            error: status.error || 'Connection error',
          }));
        }
      });
      
      newSocket.on('connection:qr', (qrCode: string) => {
        setConnectionState(prev => ({ ...prev, qrCode, status: 'waiting' }));
      });
      
      newSocket.on('connection:pairing', (pairingCode: string) => {
        setConnectionState(prev => ({ ...prev, pairingCode, status: 'waiting' }));
      });
      
      newSocket.on('connection:success', (data) => {
        setConnectionState(prev => ({
          ...prev,
          status: 'connected',
          phoneNumber: data.phoneNumber,
          profileName: data.profileName,
          profilePicture: data.profilePicture,
          qrCode: undefined,
          pairingCode: undefined,
          error: undefined,
        }));
        setState(prev => ({ ...prev, connecting: false, error: undefined }));
      });
      
      newSocket.on('connection:error', (error: string) => {
        setState(prev => ({
          ...prev,
          connecting: false,
          error,
        }));
        setConnectionState(prev => ({
          ...prev,
          status: 'error',
          error,
        }));
      });
      
      newSocket.on('upload:progress', (progress: UploadProgress) => {
        // This will be handled by the upload hook
      });
      
      newSocket.on('upload:result', (result: UploadResult) => {
        // This will be handled by the upload hook
      });
      
      newSocket.on('error', (error: string) => {
        setState(prev => ({
          ...prev,
          error,
        }));
      });
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        connecting: false,
        error: error?.message || 'Failed to connect',
      }));
    }
  }, [sessionId, connectionState.status]);
  
  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setState({ connected: false, connecting: false, error: undefined });
    }
    
    clearStoredSessionId();
    setSessionId(null);
    setConnectionState({ status: 'disconnected' });
  }, []);
  
  // Reconnect
  const reconnect = useCallback(() => {
    if (sessionIdRef.current) {
      connect(sessionIdRef.current);
    }
  }, [connect]);
  
  // Initialize connection
  const initConnection = useCallback((phoneNumber?: string) => {
    if (socketRef.current && sessionIdRef.current) {
      socketRef.current.emit('connection:init', phoneNumber);
      setConnectionState(prev => ({ ...prev, status: 'connecting', error: undefined }));
    }
  }, []);
  
  // Disconnect connection
  const disconnectConnection = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('connection:disconnect');
      disconnect();
    }
  }, [disconnect]);
  
  // Upload status
  const uploadStatus = useCallback((compress: boolean, compressionOptions?: any) => {
    if (socketRef.current) {
      socketRef.current.emit('upload:start', { compress, compressionOptions });
    }
  }, []);
  
  // Fetch status
  const fetchStatus = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('status:fetch');
    }
  }, []);
  
  // Auto-connect on mount if session ID exists
  useEffect(() => {
    const storedSessionId = getStoredSessionId();
    if (storedSessionId) {
      setSessionId(storedSessionId);
      connect(storedSessionId);
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  
  return {
    socket,
    state,
    sessionId,
    connectionState,
    connect,
    disconnect,
    reconnect,
    initConnection,
    disconnectConnection,
    uploadStatus,
    fetchStatus,
  };
}

// Hook for upload with progress
export function useUpload(socket: Socket<ServerToClientEvents, ClientToServerEvents> | null) {
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const uploadFile = useCallback((
    file: File,
    compress: boolean,
    compressionOptions?: any,
    onProgress?: (progress: UploadProgress) => void
  ) => {
    if (!socket) {
      setResult({
        success: false,
        message: 'Not connected to server',
        error: 'Socket not connected',
      });
      return Promise.reject(new Error('Socket not connected'));
    }
    
    return new Promise<UploadResult>((resolve, reject) => {
      setIsUploading(true);
      setProgress(null);
      setResult(null);
      
      // Listen for progress
      const progressHandler = (data: UploadProgress) => {
        setProgress(data);
        onProgress?.(data);
      };
      
      // Listen for result
      const resultHandler = (data: UploadResult) => {
        setIsUploading(false);
        setResult(data);
        socket.off('upload:progress', progressHandler);
        socket.off('upload:result', resultHandler);
        
        if (data.success) {
          resolve(data);
        } else {
          reject(new Error(data.error || data.message));
        }
      };
      
      socket.on('upload:progress', progressHandler);
      socket.on('upload:result', resultHandler);
      
      // Start upload
      socket.emit('upload:start', { compress, compressionOptions });
      
      // Timeout after 2 minutes
      const timeout = setTimeout(() => {
        socket.off('upload:progress', progressHandler);
        socket.off('upload:result', resultHandler);
        setIsUploading(false);
        setResult({
          success: false,
          message: 'Upload timeout',
          error: 'Upload took too long',
        });
        reject(new Error('Upload timeout'));
      }, 120000);
      
      // Cleanup on unmount
      return () => {
        clearTimeout(timeout);
        socket.off('upload:progress', progressHandler);
        socket.off('upload:result', resultHandler);
      };
    });
  }, [socket]);
  
  return {
    progress,
    result,
    isUploading,
    uploadFile,
  };
}
