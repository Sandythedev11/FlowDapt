/**
 * API Configuration
 * Centralized API URL management for all backend requests
 */

// Get API URL from environment variable or fallback to localhost for development
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_URL}/api/auth/login`,
    REGISTER: `${API_URL}/api/auth/register`,
    VERIFY_EMAIL: `${API_URL}/api/auth/verify-email`,
    RESEND_VERIFICATION: `${API_URL}/api/auth/resend-verification`,
    REACTIVATE_ACCOUNT: `${API_URL}/api/auth/reactivate-account`,
    ME: `${API_URL}/api/auth/me`,
    UPDATE_PROFILE: `${API_URL}/api/auth/update-profile`,
    ADD_RECOVERY_EMAIL: `${API_URL}/api/auth/add-recovery-email`,
    VERIFY_RECOVERY_EMAIL: `${API_URL}/api/auth/verify-recovery-email`,
    REMOVE_RECOVERY_EMAIL: `${API_URL}/api/auth/remove-recovery-email`,
    DEACTIVATE_ACCOUNT: `${API_URL}/api/auth/deactivate-account`,
    DELETE_ACCOUNT: `${API_URL}/api/auth/delete-account`,
  },
  
  // AI endpoints
  AI: {
    INDEX: `${API_URL}/api/ai/index`,
    CHAT: `${API_URL}/api/ai/chat`,
    CLEAR_SESSION: `${API_URL}/api/ai/clear-session`,
    CLEAR_ALL: `${API_URL}/api/ai/clear-all`,
  },
  
  // Upload endpoints
  UPLOAD: {
    SESSION_CLEAR: `${API_URL}/api/upload/session/clear`,
  },
  
  // Feedback endpoints
  FEEDBACK: {
    SUBMIT: `${API_URL}/api/feedback/submit`,
  },
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function for multipart form data headers
export const getMultipartAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

console.log('🌐 API Configuration loaded:', {
  apiUrl: API_URL,
  environment: import.meta.env.MODE,
});
