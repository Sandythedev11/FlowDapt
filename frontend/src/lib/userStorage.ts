// User-scoped storage utilities - ensures data isolation between users
// Session-based storage: Analytics data persists during session (survives refresh)
// Data is automatically cleared when tab/browser closes (sessionStorage behavior)

// Session ID for current browser session
let currentSessionId: string | null = null;

// Generate a unique session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create current session ID (stored in sessionStorage, not localStorage)
export const getCurrentSessionId = (): string => {
  if (currentSessionId) return currentSessionId;
  
  // Try to get from sessionStorage (cleared on tab/browser close)
  const stored = sessionStorage.getItem("flowdapt_session_id");
  if (stored) {
    currentSessionId = stored;
    return stored;
  }
  
  // Generate new session ID
  const newSessionId = generateSessionId();
  sessionStorage.setItem("flowdapt_session_id", newSessionId);
  currentSessionId = newSessionId;
  return newSessionId;
};

// Get current user ID from localStorage
export const getCurrentUserId = (): string | null => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return user._id || null;
    }
  } catch (error) {
    console.error("Failed to get current user ID:", error);
  }
  return null;
};

// Generate user-scoped storage key
export const getUserKey = (baseKey: string): string => {
  const userId = getCurrentUserId();
  if (!userId) {
    console.warn(`No user logged in, using global key for: ${baseKey}`);
    return baseKey;
  }
  return `${userId}_${baseKey}`;
};

// Check if a key should use session storage (analytics data)
const isSessionKey = (key: string): boolean => {
  const sessionKeys = [
    STORAGE_KEYS.ANALYSIS_DATA,
    STORAGE_KEYS.ANALYTICS_RESULTS,
    STORAGE_KEYS.GENERATED_INSIGHTS,
    STORAGE_KEYS.INSIGHT_FEEDBACK,
    STORAGE_KEYS.AI_CHAT_HISTORY,
    STORAGE_KEYS.REPORT_QUEUE,
  ];
  return sessionKeys.includes(key as any);
};

// Get item from user-scoped storage (session or local based on key type)
export const getUserItem = <T>(key: string, defaultValue: T): T => {
  try {
    const userKey = getUserKey(key);
    
    // Analytics data uses sessionStorage (cleared on tab/browser close)
    if (isSessionKey(key)) {
      const stored = sessionStorage.getItem(userKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } else {
      // Non-analytics data uses localStorage (persists)
      const stored = localStorage.getItem(userKey);
      if (stored) {
        return JSON.parse(stored);
      }
    }
  } catch (error) {
    console.error(`Failed to get user item ${key}:`, error);
  }
  return defaultValue;
};

// Set item in user-scoped storage (session or local based on key type)
export const setUserItem = <T>(key: string, value: T): void => {
  try {
    const userKey = getUserKey(key);
    const jsonValue = JSON.stringify(value);
    
    // Analytics data uses sessionStorage (cleared on tab/browser close)
    if (isSessionKey(key)) {
      sessionStorage.setItem(userKey, jsonValue);
    } else {
      // Non-analytics data uses localStorage (persists)
      localStorage.setItem(userKey, jsonValue);
    }
  } catch (error) {
    console.error(`Failed to set user item ${key}:`, error);
  }
};

// Remove item from user-scoped storage (both session and local)
export const removeUserItem = (key: string): void => {
  try {
    const userKey = getUserKey(key);
    sessionStorage.removeItem(userKey);
    localStorage.removeItem(userKey);
  } catch (error) {
    console.error(`Failed to remove user item ${key}:`, error);
  }
};

// Clear all data for current user (both session and local storage)
export const clearUserData = (): void => {
  const userId = getCurrentUserId();
  if (!userId) return;

  // Clear from localStorage
  const localKeysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`${userId}_`)) {
      localKeysToRemove.push(key);
    }
  }
  localKeysToRemove.forEach((key) => localStorage.removeItem(key));

  // Clear from sessionStorage
  const sessionKeysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith(`${userId}_`)) {
      sessionKeysToRemove.push(key);
    }
  }
  sessionKeysToRemove.forEach((key) => sessionStorage.removeItem(key));
};

// Clear session data on logout (clears all analytics data)
export const clearSessionData = (): void => {
  // Clear all user-scoped data first
  clearUserData();
  // Then clear auth tokens
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Clear all analytics data (including report queue)
export const clearAnalyticsData = (): void => {
  const userId = getCurrentUserId();
  if (!userId) return;

  // Clear ALL analytics-related keys (including report queue)
  const analyticsKeys = [
    STORAGE_KEYS.ANALYSIS_DATA,
    STORAGE_KEYS.ANALYTICS_RESULTS,
    STORAGE_KEYS.GENERATED_INSIGHTS,
    STORAGE_KEYS.INSIGHT_FEEDBACK,
    STORAGE_KEYS.AI_CHAT_HISTORY,
    STORAGE_KEYS.REPORT_QUEUE, // Now cleared on session end
  ];

  analyticsKeys.forEach((key) => {
    removeUserItem(key);
  });
};

// Initialize session cleanup - DO NOT clear on page load (data persists during session)
export const initializeSessionCleanup = (): void => {
  // DO NOT clear on page load - sessionStorage persists across refreshes
  // Data is automatically cleared when tab/browser closes (sessionStorage behavior)
  
  console.log("✅ Session cleanup initialized - data will persist during session");
  console.log("📦 SessionStorage will auto-clear on tab/browser close");
};

// Call backend to clear server-side session data
export const clearServerSessionData = async (): Promise<void> => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    // Clear AI data on server
    await fetch("http://localhost:5000/api/ai/clear-all", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Clear upload data on server
    await fetch("http://localhost:5000/api/upload/session/clear", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Failed to clear server session data:", error);
  }
};

// Storage keys used across the app
export const STORAGE_KEYS = {
  ANALYSIS_DATA: "analysisData",
  ANALYTICS_RESULTS: "analyticsResults",
  GENERATED_INSIGHTS: "generatedInsights",
  INSIGHT_FEEDBACK: "insightFeedback",
  REPORT_QUEUE: "reportBuilderQueue",
  AI_CHAT_HISTORY: "aiChatHistory",
  THEME: "theme",
} as const;
