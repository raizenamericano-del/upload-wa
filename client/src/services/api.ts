import { ApiResponse, ConnectionState, UploadResult, UploadHistory } from '../types';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin + '/api';

// Helper to make API requests
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      error: error?.message || 'Network error',
    };
  }
}

// Connection API
export const connectionApi = {
  // Generate new session ID
  generateSession: async (): Promise<ApiResponse<{ sessionId: string }>> => {
    return apiRequest<{ sessionId: string }>('/connections/generate', {
      method: 'POST',
    });
  },
  
  // Initialize connection
  initConnection: async (sessionId: string, phoneNumber?: string): Promise<ApiResponse<ConnectionState>> => {
    return apiRequest<ConnectionState>('/connections/init', {
      method: 'POST',
      body: JSON.stringify({ sessionId, phoneNumber }),
    });
  },
  
  // Get connection state
  getState: async (sessionId: string): Promise<ApiResponse<ConnectionState>> => {
    return apiRequest<ConnectionState>(`/connections/${sessionId}/state`);
  },
  
  // Get QR code
  getQRCode: async (sessionId: string): Promise<ApiResponse<{ qrCode: string }>> => {
    return apiRequest<{ qrCode: string }>(`/connections/${sessionId}/qr`);
  },
  
  // Get pairing code
  getPairingCode: async (sessionId: string): Promise<ApiResponse<{ pairingCode: string }>> => {
    return apiRequest<{ pairingCode: string }>(`/connections/${sessionId}/pairing`);
  },
  
  // Disconnect
  disconnect: async (sessionId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiRequest<{ success: boolean }>(`/connections/${sessionId}/disconnect`, {
      method: 'POST',
    });
  },
  
  // Reconnect
  reconnect: async (sessionId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiRequest<{ success: boolean }>(`/connections/${sessionId}/reconnect`, {
      method: 'POST',
    });
  },
  
  // Check if connected
  isConnected: async (sessionId: string): Promise<ApiResponse<{ connected: boolean }>> => {
    return apiRequest<{ connected: boolean }>(`/connections/${sessionId}/connected`);
  },
};

// Upload API
export const uploadApi = {
  // Upload file
  upload: async (
    sessionId: string,
    file: File,
    compress: boolean = true,
    compressionOptions?: any
  ): Promise<ApiResponse<UploadResult>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('compress', String(compress));
    
    if (compressionOptions) {
      formData.append('compressionOptions', JSON.stringify(compressionOptions));
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/uploads`, {
        method: 'POST',
        headers: {
          'x-session-id': sessionId,
        },
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Upload failed');
      }
      
      return data;
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error?.message || 'Upload failed',
      };
    }
  },
  
  // Get upload history
  getHistory: async (sessionId: string, limit: number = 50): Promise<ApiResponse<{ history: UploadHistory[] }>> => {
    return apiRequest<{ history: UploadHistory[] }>(`/uploads/history?limit=${limit}`, {
      headers: {
        'x-session-id': sessionId,
      },
    });
  },
  
  // Get compression recommendations
  getRecommendations: async (file: File): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}/uploads/recommendations`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to get recommendations');
      }
      
      return data;
    } catch (error) {
      console.error('Get recommendations error:', error);
      return {
        success: false,
        error: error?.message || 'Failed to get recommendations',
      };
    }
  },
};

// Status API
export const statusApi = {
  // Get my status
  getMyStatus: async (sessionId: string): Promise<ApiResponse<{ statuses: any[] }>> => {
    return apiRequest<{ statuses: any[] }>('/status/my', {
      headers: {
        'x-session-id': sessionId,
      },
    });
  },
  
  // Get status by JID
  getStatusByJid: async (sessionId: string, jid: string): Promise<ApiResponse<{ statuses: any[] }>> => {
    return apiRequest<{ statuses: any[] }>(`/status/${jid}`, {
      headers: {
        'x-session-id': sessionId,
      },
    });
  },
  
  // Delete my status
  deleteStatus: async (sessionId: string, statusId: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiRequest<{ success: boolean }>(`/status/${statusId}`, {
      method: 'DELETE',
      headers: {
        'x-session-id': sessionId,
      },
    });
  },
};

// Health API
export const healthApi = {
  // Health check
  healthCheck: async (): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/health');
  },
  
  // Ping
  ping: async (): Promise<ApiResponse<{ message: string; timestamp: string }>> => {
    return apiRequest<{ message: string; timestamp: string }>('/health/ping');
  },
};

// Export all APIs
export const api = {
  connection: connectionApi,
  upload: uploadApi,
  status: statusApi,
  health: healthApi,
};
