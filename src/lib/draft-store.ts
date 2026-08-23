"use client";

import { savePreviewSession, consumePreviewSession, clearAllPreviewSessions } from "./preview-session";

/**
 * Legacy compatibility layer forwarding to ephemeral preview session
 */
export function saveDraft<T>(docType: string, data: T): void {
  savePreviewSession(docType, data);
}

export function loadDraft<T>(docType: string): T | null {
  const result = consumePreviewSession<T>(docType);
  return result ? result.formValues : null;
}

export function clearDraft(docType: string): void {
  clearAllPreviewSessions();
}
