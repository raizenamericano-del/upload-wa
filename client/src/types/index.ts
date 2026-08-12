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

// Upload Types
export type MediaType = 'image' | 'video';

export interface UploadFile {
  name: string;
  type: MediaType;
  size: number;
  path?: string;
  preview?: string;
  mimetype: string;
}

export interface CompressionOptions {
  quality?: number; // 1-100
  width?: number;
  height?: number;
  bitrate?: number; // for video
  fps?: number; // for video
}

export interface UploadRequest {
  file: File | UploadFile;
  compress: boolean;
  compressionOptions?: CompressionOptions;
}

export type UploadStage = 'uploading' | 'compressing' | 'posting' | 'completed' | 'failed';

export interface UploadProgress {
  stage: UploadStage;
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

// History Types
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

// UI Types
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
}

// Theme Types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  primary: string;
  secondary: string;
  accent: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Form Types
export interface ConnectionFormData {
  phoneNumber?: string;
  method: 'qr' | 'pairing';
}

export interface UploadFormData {
  file: File | null;
  compress: boolean;
  compressionOptions: CompressionOptions;
}
