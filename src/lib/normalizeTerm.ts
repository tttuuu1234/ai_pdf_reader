/** 選択テキストを正規化する（小文字化 + 前後の空白除去）。 */
export function normalizeTerm(raw: string): string {
  return raw.trim().toLowerCase()
}
