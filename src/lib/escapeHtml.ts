const MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

/** HTML特殊文字をエスケープする。 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => MAP[ch])
}
