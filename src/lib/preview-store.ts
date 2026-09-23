function randomId(): string {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(36).padStart(2, "0")).join("")
}

const PREFIX = "qf_pv_"

const memoryStore = new Map<string, PreviewStoreItem>()

export interface PreviewStoreItem {
  docType: string
  title: string
  fileName: string
  templateName?: string
  invoiceData?: unknown
  data?: unknown
}

export function savePreviewData(item: PreviewStoreItem): string {
  const id = randomId()
  memoryStore.set(id, item)
  try {
    sessionStorage.setItem(PREFIX + id, JSON.stringify(item))
  } catch {}
  return id
}

export async function fetchPreviewData(id: string): Promise<PreviewStoreItem | null> {
  return loadPreviewData(id)
}

export function loadPreviewData(id: string): PreviewStoreItem | null {
  const mem = memoryStore.get(id)
  if (mem) return mem
  try {
    const raw = sessionStorage.getItem(PREFIX + id)
    if (!raw) return null
    return JSON.parse(raw) as PreviewStoreItem
  } catch {
    return null
  }
}

export function removePreviewData(id: string) {
  memoryStore.delete(id)
  try {
    sessionStorage.removeItem(PREFIX + id)
  } catch {}
}
