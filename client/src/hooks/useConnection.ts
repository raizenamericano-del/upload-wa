import { useState, useCallback, useEffect } from 'react';
import { ConnectionState, ConnectionStatus } from '../types';
import { useSocket } from './useSocket';

export interface UseConnectionReturn {
  connection: ConnectionState;
  isConnected: boolean;
  isConnecting: boolean;
  isWaiting: boolean;
  hasError: boolean;
  error?: string;
  phoneNumber?: string;
  profileName?: string;
  profilePicture?: string;
  qrCode?: string;
  pairingCode?: string;
  connect: (phoneNumber?: string) => void;
  disconnect: () => void;
  reconnect: () => void;
  clearError: () => void;
}

export function useConnection(): UseConnectionReturn {
  const { 
    socket, 
    state: socketState, 
    sessionId, 
    connectionState,
    connect: connectSocket,
    disconnect: disconnectSocket,
    reconnect: reconnectSocket,
    initConnection,
    disconnectConnection,
  } = useSocket();
  
  const isConnected = connectionState.status === 'connected';
  const isConnecting = connectionState.status === 'connecting' || socketState.connecting;
  const isWaiting = connectionState.status === 'waiting';
  const hasError = connectionState.status === 'error' || !!socketState.error;
  const error = connectionState.error || socketState.error;
  
  // Connect with optional phone number
  const connect = useCallback((phoneNumber?: string) => {
    if (!sessionId) {
      // Generate new session ID
      const newSessionId = `kyy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      connectSocket(newSessionId, phoneNumber);
    } else {
      initConnection(phoneNumber);
    }
  }, [sessionId, connectSocket, initConnection]);
  
  // Disconnect
  const disconnect = useCallback(() => {
    disconnectConnection();
    disconnectSocket();
  }, [disconnectConnection, disconnectSocket]);
  
  // Reconnect
  const reconnect = useCallback(() => {
    reconnectSocket();
  }, [reconnectSocket]);
  
  // Clear error
  const clearError = useCallback(() => {
    // This will be cleared by new connection state
  }, []);
  
  return {
    connection: connectionState,
    isConnected,
    isConnecting,
    isWaiting,
    hasError,
    error,
    phoneNumber: connectionState.phoneNumber,
    profileName: connectionState.profileName,
    profilePicture: connectionState.profilePicture,
    qrCode: connectionState.qrCode,
    pairingCode: connectionState.pairingCode,
    connect,
    disconnect,
    reconnect,
    clearError,
  };
}
