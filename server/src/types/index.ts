import { Socket } from 'socket.io';
import { WADefaultSchemas } from '@whiskeysockets/baileys';

// Connection Types
export type ConnectionStatus = 'disconnected' | 'connecting' | 'waiting' | 'connected' | 'error';

export interface ConnectionState {
  status: ConnectionStatus;
  qrCode?: string;
  pairingCode?: string;
  phoneNumber?: string;
  profileName?: string;
  profilePicture?: string;
  error?: string;
}

export interface WAConnection {
  id: string;
  phoneNumber: string;
  profileName: string;
  profilePicture?: string;
  status: ConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Upload Types
export type MediaType = 'image' | 'video';

export interface UploadFile {
  name: string;
  type: MediaType;
  size: number;
  path: string;
  mimetype: string;
}

export interface CompressionOptions {
  quality: number; // 1-100
  width?: number;
  height?: number;
  bitrate?: number; // for video
  fps?: number; // for video
}

export interface UploadRequest {
  file: UploadFile;
  compress: boolean;
  compressionOptions?: CompressionOptions;
}

export interface UploadProgress {
  stage: 'uploading' | 'compressing' | 'posting' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  processedFile?: string;
}

export interface UploadResult {
  success: boolean;
  message: string;
  filePath?: string;
  statusId?: string;
  error?: string;
}

// Socket Types
export interface ServerToClientEvents {
  'connection:status': (status: ConnectionState) => void;
  'connection:qr': (qrCode: string) => void;
  'connection:pairing': (pairingCode: string) => void;
  'connection:success': (data: { phoneNumber: string; profileName: string; profilePicture?: string }) => void;
  'connection:error': (error: string) => void;
  'upload:progress': (progress: UploadProgress) => void;
  'upload:result': (result: UploadResult) => void;
  'status:list': (statuses: any[]) => void;
  'error': (error: string) => void;
}

export interface ClientToServerEvents {
  'connection:init': (phoneNumber?: string) => void;
  'connection:disconnect': () => void;
  'connection:reconnect': () => void;
  'upload:start': (data: { compress: boolean; compressionOptions?: CompressionOptions }) => void;
  'status:fetch': () => void;
}

export interface InterServerEvents {}

export interface SocketData {
  sessionId?: string;
  phoneNumber?: string;
}

export type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

// Baileys Types
export interface BaileysSession {
  authState: WADefaultSchemas['AuthenticationState'];
  connectionState: WADefaultSchemas['ConnectionState'];
}

export interface SessionStore {
  [key: string]: BaileysSession;
}

// Storage Types
export interface UploadHistory {
  id: string;
  fileName: string;
  fileType: MediaType;
  originalSize: number;
  compressedSize?: number;
  uploadDate: Date;
  statusId?: string;
  success: boolean;
  error?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: Date;
  version: string;
  connections: number;
}
