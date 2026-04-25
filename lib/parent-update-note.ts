/** Optional note from tutor appended to WhatsApp fee reminders (not private). */
export const PARENT_UPDATE_NOTE_MAX = 500

export function normalizeParentUpdateNote(raw: string | null | undefined): string | null {
  const t = raw?.trim() ?? ''
  if (!t) return null
  return t.replace(/\r\n/g, '\n').slice(0, PARENT_UPDATE_NOTE_MAX)
}
