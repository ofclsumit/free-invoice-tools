"use client";

const SESSION_PREFIX = "turnivo_pv_session_";
const ACTIVE_FLAG_PREFIX = "turnivo_pv_active_";

export interface PreviewSessionData<T = any> {
  docType: string;
  formValues: T;
  extraState?: {
    logoOriginal?: string;
    logoSettings?: any;
    signatureOriginal?: string;
    signatureSettings?: any;
    watermarkOriginal?: string;
    watermarkSettings?: any;
    [key: string]: any;
  };
  timestamp: number;
}

// In-memory fallback map for environments where sessionStorage might be constrained
const memorySessionStore = new Map<string, PreviewSessionData>();

/**
 * Save form state into a temporary preview session.
 * Called ONLY when user explicitly clicks the "Preview" button.
 */
export function savePreviewSession<T>(
  docType: string,
  formValues: T,
  extraState?: Record<string, any>
): void {
  if (!docType || !formValues) return;

  const sessionData: PreviewSessionData<T> = {
    docType,
    formValues,
    extraState,
    timestamp: Date.now(),
  };

  memorySessionStore.set(docType, sessionData);

  try {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_PREFIX + docType, JSON.stringify(sessionData));
      sessionStorage.setItem(ACTIVE_FLAG_PREFIX + docType, "true");
    }
  } catch (err) {
    console.warn("Could not write preview session:", err);
  }
}

/**
 * Check and consume the preview session state on form mount.
 * If the user navigated Back from Preview, returns the state and IMMEDIATELY clears/consumes it,
 * ensuring that subsequent refreshes or home navigations start with a 100% fresh form.
 */
export function consumePreviewSession<T>(
  docType: string
): { formValues: T; extraState?: Record<string, any> } | null {
  if (!docType) return null;

  try {
    if (typeof window !== "undefined") {
      const isActive = sessionStorage.getItem(ACTIVE_FLAG_PREFIX + docType) === "true";
      if (!isActive) {
        // Not a Preview -> Back navigation; clean any stale data and return null for fresh form
        sessionStorage.removeItem(SESSION_PREFIX + docType);
        memorySessionStore.delete(docType);
        return null;
      }

      // It IS an active Preview -> Back navigation!
      const raw = sessionStorage.getItem(SESSION_PREFIX + docType);
      let sessionData: PreviewSessionData<T> | null = null;

      if (raw) {
        sessionData = JSON.parse(raw) as PreviewSessionData<T>;
      } else if (memorySessionStore.has(docType)) {
        sessionData = memorySessionStore.get(docType) as PreviewSessionData<T>;
      }

      // CRITICAL: Immediately consume & delete the active flag and stored session
      sessionStorage.removeItem(ACTIVE_FLAG_PREFIX + docType);
      sessionStorage.removeItem(SESSION_PREFIX + docType);
      memorySessionStore.delete(docType);

      if (sessionData && sessionData.formValues) {
        return {
          formValues: sessionData.formValues,
          extraState: sessionData.extraState,
        };
      }
    }
  } catch (err) {
    console.warn("Could not consume preview session:", err);
  }

  return null;
}

/**
 * Clear any active preview sessions (e.g., when intentionally switching tools or navigating to home).
 */
export function clearAllPreviewSessions(): void {
  memorySessionStore.clear();
  try {
    if (typeof window !== "undefined") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith(SESSION_PREFIX) || key.startsWith(ACTIVE_FLAG_PREFIX))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    }
  } catch {}
}
